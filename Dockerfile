FROM python:3.11-slim

# 国内镜像源 (阿里云内网)
RUN sed -i 's|deb.debian.org|mirrors.cloud.aliyuncs.com|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null; \
    sed -i 's|security.debian.org|mirrors.cloud.aliyuncs.com|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null

# 安装 uv (使用阿里云内网镜像)
RUN pip install --no-cache-dir -i http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com uv

WORKDIR /app
COPY . .

# 使用 uv 安装依赖 (阿里云内网镜像)
# 优先 requirements.txt (最可靠)，其次尝试 pyproject.toml，最后兜底
RUN if [ -f requirements.txt ]; then \
        uv pip install --system --index-url http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com -r requirements.txt; \
    elif [ -f pyproject.toml ]; then \
        uv pip install --system --index-url http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com . \
        || python -c "import tomllib;deps=tomllib.load(open('pyproject.toml','rb')).get('project',{}).get('dependencies',[]);print('\n'.join(deps))" > /tmp/_deps.txt \
        && uv pip install --system --index-url http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com -r /tmp/_deps.txt; \
    else \
        uv pip install --system --index-url http://mirrors.cloud.aliyuncs.com/pypi/simple/ --trusted-host mirrors.cloud.aliyuncs.com fastapi uvicorn openai; \
    fi

# 数据目录 (挂载外部卷，避开 /app/data 防止覆盖代码文件)
RUN mkdir -p /app/app_data

# 非 root 用户运行
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
