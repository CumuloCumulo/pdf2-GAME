import os
import json
import base64
import uuid
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI, RateLimitError, AuthenticationError, APIStatusError, APIConnectionError

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATA_DIR = os.environ.get("APP_DATA_DIR", "/app/app_data")
os.makedirs(DATA_DIR, exist_ok=True)

BASE_DIR = Path(__file__).parent
SKILLS_FILES = [
    "data/skills.json", "data/skills_psychology.json", "data/skills_mechanics.json",
    "data/skills_narrative.json", "data/skills_world.json",
    "data/skills_social.json", "data/skills_testing.json",
]

ALL_SKILLS = []
for f in SKILLS_FILES:
    p = BASE_DIR / f
    if p.exists():
        ALL_SKILLS.extend(json.loads(p.read_text("utf-8")))

SKILLS_MAP = {s["name"]: s for s in ALL_SKILLS}

client = AsyncOpenAI(
    api_key=os.environ.get("LLM_API_KEY", ""),
    base_url=os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1"),
)
MODEL_VISION = os.environ.get("LLM_MODEL_VISION", "gpt-4o")

CATEGORIES = [
    {"icon": "🎯", "name": "设计基础", "desc": "游戏设计理论与方法论"},
    {"icon": "🧠", "name": "心理与动机", "desc": "玩家心理学与动机设计"},
    {"icon": "🏗️", "name": "机制系统", "desc": "游戏机制与系统设计"},
    {"icon": "🎭", "name": "叙事角色", "desc": "叙事设计与角色塑造"},
    {"icon": "🌐", "name": "世界构建", "desc": "游戏世界与空间设计"},
    {"icon": "👥", "name": "社交系统", "desc": "多人游戏与社区设计"},
    {"icon": "🔍", "name": "测试评估", "desc": "游戏测试与评估方法"},
]


@app.get("/")
async def index():
    return FileResponse(BASE_DIR / "static" / "index.html")


@app.get("/api/skills")
async def get_skills():
    return ALL_SKILLS


@app.get("/api/categories")
async def get_categories():
    return CATEGORIES


SYSTEM_PROMPT = """你是一位游戏设计教育专家。用户会上传一张与游戏设计相关的图片。
请分析图片内容，判断它最可能对应以下哪个游戏设计技能。

技能列表：
""" + "\n".join(f"- {s['name']}（{s['category']}）：{s['description']}" for s in ALL_SKILLS) + """

请严格按以下JSON格式回复，不要输出其他内容：
{"skill_name": "技能名称", "confidence": 0.8, "reason": "识别理由"}

如果图片与游戏设计完全无关，返回：
{"skill_name": null, "confidence": 0, "reason": "原因"}"""


@app.post("/api/recognize")
async def recognize(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "请上传图片文件")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "图片大小不能超过10MB")

    b64 = base64.b64encode(content).decode()
    media_type = file.content_type or "image/jpeg"

    try:
        resp = await client.chat.completions.create(
            model=MODEL_VISION,
            max_tokens=1024,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
                    {"type": "text", "text": "请分析这张图片对应的游戏设计技能。"},
                ]},
            ],
        )
    except RateLimitError:
        raise HTTPException(429, "AI服务频率限制，请稍后重试")
    except AuthenticationError:
        raise HTTPException(401, "AI服务密钥配置错误")
    except APIConnectionError:
        raise HTTPException(502, "无法连接AI服务")
    except APIStatusError as e:
        msg = str(e.message) if hasattr(e, "message") else str(e)
        if "budget" in msg.lower() or "quota" in msg.lower() or "insufficient" in msg.lower():
            raise HTTPException(402, f"AI服务余额不足: {msg}")
        raise HTTPException(e.status_code, f"AI服务错误: {msg}")
    except Exception as e:
        raise HTTPException(500, f"识别失败: {str(e)}")

    raw = resp.choices[0].message.content.strip()
    # Extract JSON from response
    try:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
    except json.JSONDecodeError:
        raise HTTPException(500, "AI返回格式异常，请重试")

    skill_name = result.get("skill_name")
    if not skill_name:
        return {"matched": False, "reason": result.get("reason", "未识别到相关技能"), "source": "model"}

    # Match against known skills
    matched_skill = SKILLS_MAP.get(skill_name)
    if matched_skill:
        return {
            "matched": True, "source": "skills",
            "skill": matched_skill,
            "reason": result.get("reason", ""),
            "confidence": result.get("confidence", 0.5),
            "image_b64": b64, "image_type": media_type,
        }

    # Fuzzy: find best partial match
    for name, skill in SKILLS_MAP.items():
        if skill_name in name or name in skill_name:
            return {
                "matched": True, "source": "skills",
                "skill": skill, "reason": result.get("reason", ""),
                "confidence": result.get("confidence", 0.5),
                "image_b64": b64, "image_type": media_type,
            }

    # Model fallback
    return {
        "matched": True, "source": "model",
        "skill": {
            "id": f"model-{uuid.uuid4().hex[:8]}",
            "name": skill_name,
            "category": result.get("category", "设计基础"),
            "description": result.get("reason", "AI识别的技能"),
            "difficulty": 3, "rarity": "中级", "score": 30,
            "application": "AI识别",
        },
        "reason": result.get("reason", ""),
        "confidence": result.get("confidence", 0.5),
        "image_b64": b64, "image_type": media_type,
    }


app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
