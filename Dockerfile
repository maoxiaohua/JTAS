# JTAS Python Flask Backend
FROM python:3.11-slim

LABEL maintainer="JTAS Team"
LABEL description="JIRA Task Automation System - Python Flask Backend"

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements.txt并安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app.py start.py ./
COPY templates/ templates/
COPY merged_ticket_assignments.csv ./

# 创建非root用户
RUN useradd -m -u 1000 jtas && chown -R jtas:jtas /app
USER jtas

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/metrics || exit 1

# 启动应用
CMD ["python", "app.py"]