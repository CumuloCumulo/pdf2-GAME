# 🚀 Render 部署指南

本项目可以轻松部署到 Render 平台。

## 📋 部署前准备

1. **准备 API Key** - 确保您的通义千问 API Key 可用
2. **GitHub 仓库** - 确保代码已推送到 GitHub

## 🛠️ 部署步骤

### 方法一：使用 render.yaml（推荐）

1. 访问 https://dashboard.render.com/
2. 点击 "New +"
3. 选择 "Blueprints"
4. 连接您的 GitHub 账号
5. 选择 `pdf2-GAME` 仓库
6. Render 会自动识别 `render.yaml` 配置
7. 确认部署配置后点击 "Apply"

### 方法二：手动创建 Web Service

1. 访问 https://dashboard.render.com/
2. 点击 "New +"
3. 选择 "Web Service"
4. 连接您的 GitHub 账号
5. 选择 `pdf2-GAME` 仓库
6. 配置以下选项：

**基础配置:**
```
Name: pdf2-game
Region: Singapore (或离您最近的区域)
Branch: main
```

**构建配置:**
```
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**环境变量:**
```
PYTHON_VERSION = 3.11.0
LLM_API_KEY = sk-xxxxxxxxxxxxxxxxxx (您的 API Key)
LLM_BASE_URL = https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL_VISION = qwen-vl-max
APP_DATA_DIR = /opt/render/project/app_data
```

**实例配置:**
```
Instance Type: Free (或付费计划)
```

7. 点击 "Create Web Service"

## ✅ 部署后验证

1. 访问 Render 提供的 URL
2. 应该能看到 Game Design Art Skill Deck 的主页
3. 测试图片识别功能是否正常

## 📊 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `LLM_API_KEY` | 通义千问 API Key | `sk-cb77...` |
| `LLM_BASE_URL` | API 基础地址 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `LLM_MODEL_VISION` | 视觉模型 | `qwen-vl-max` |
| `APP_DATA_DIR` | 数据目录 | `/opt/render/project/app_data` |

## ⚠️ 注意事项

1. **免费版限制**:
   - 实例会在 15 分钟无活动后休眠
   - 首次访问可能需要 30-60 秒启动
   - 每月有 750 小时的免费额度

2. **数据持久化**:
   - Render 免费版不提供持久化磁盘
   - 数据存储在内存中，重启后会丢失
   - 如需持久化，请使用 Render 的 Disk 功能（付费）

3. **API 配额**:
   - 通义千问 API 有免费额度限制
   - 请在阿里云控制台查看配额使用情况

## 🔄 更新部署

修改代码后推送到 GitHub，Render 会自动触发重新部署。

## 📝 查看日志

在 Render Dashboard 中:
1. 点击您的服务
2. 选择 "Logs" 标签
3. 实时查看应用日志

## 🛑 停止服务

在 Render Dashboard 中:
1. 点击您的服务
2. 点击 "Stop" 按钮
