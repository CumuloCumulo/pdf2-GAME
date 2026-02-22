# 🐳 Render Docker 部署指南

使用 Docker 部署到 Render 更简单，环境一致性更好。

## 🚀 快速部署

### 步骤一：推送配置到 GitHub

```bash
git add render-docker.yaml Dockerfile.render
git commit -m "Add Render Docker deployment config"
git push
```

### 步骤二：在 Render 创建服务

1. 访问 **https://dashboard.render.com/**
2. 点击 **"New +"** → 选择 **"Web Service"**
3. 连接 GitHub，选择 `pdf2-GAME` 仓库
4. 配置：
   ```
   Name: pdf2-game-docker
   Runtime: Docker
   Build Context: /
   DockerfilePath: Dockerfile.render
   ```
5. 添加环境变量：
   ```
   LLM_API_KEY = sk-cb7796a824324a6b8c27e85d79d948d3
   LLM_BASE_URL = https://dashscope.aliyuncs.com/compatible-mode/v1
   LLM_MODEL_VISION = qwen-vl-max
   APP_DATA_DIR = /app/app_data
   ```
6. 点击 **"Create Web Service"**

## 📋 两种部署方式对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| **Docker** | 环境一致、依赖完整、可测试 | 构建稍慢、镜像较大 |
| **Python** | 构建快、镜像小 | 依赖可能不完整 |

## ✅ Docker vs Python 部署

| 项目 | Python 部署 | Docker 部署 |
|------|-------------|-------------|
| 配置文件 | `render.yaml` | `render-docker.yaml` |
| 依赖管理 | requirements.txt | Dockerfile.render |
| 构建时间 | ~1-2 分钟 | ~2-3 分钟 |
| 环境隔离 | ❌ | ✅ |
| 本地测试 | 需本地环境 | Docker 可完全复现 |

## 🎯 推荐选择

- **开发/测试**：使用 Python 部署（更快）
- **生产环境**：使用 Docker 部署（更稳定）

## 🐛 故障排查

### 构建失败

1. 检查 Dockerfile.render 语法
2. 查看 Render 构建日志
3. 确认 requirements.txt 正确

### 运行时错误

1. 检查环境变量是否正确设置
2. 查看应用日志
3. 确认 API Key 有效

## 📝 使用 render-docker.yaml（自动部署）

也可以使用 Blueprint 自动部署：

1. 重命名 `Dockerfile.render` 为 `Dockerfile`（备份原 Dockerfile）
2. 使用 `render-docker.yaml` 创建 Blueprint
3. Render 会自动识别 Docker 配置
