# JIRA效率分析系统部署指南

## 部署环境要求

### 开发环境 (Windows)
- **操作系统**: Windows 10/11 Professional
- **Java**: JDK 17+
- **Maven**: 3.8+
- **Node.js**: 18+ (用于前端开发)
- **Docker Desktop**: 4.0+ (可选，用于容器化测试)

### 生产环境 (Debian 12)
- **操作系统**: Debian 12 (Bookworm) 
- **内存**: 最低 4GB，推荐 8GB+
- **存储**: 最低 50GB 可用空间
- **网络**: 稳定的网络连接
- **Docker**: 20.10+ + Docker Compose v2

## 跨平台迁移步骤

### 1. Windows开发环境搭建

```bash
# 安装Java 17
winget install Microsoft.OpenJDK.17

# 验证安装
java -version
javac -version

# 安装Maven
winget install Apache.Maven

# 验证Maven安装
mvn -version

# 克隆项目
git clone <repository-url>
cd JTAS

# 构建项目
mvn clean package -DskipTests
```

### 2. 本地开发运行

```bash
# 启动数据库 (使用Docker)
docker-compose up -d postgres redis

# 等待数据库启动
timeout 30 # 等待30秒

# 运行后端应用
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 验证运行
curl http://localhost:8080/api/v1/actuator/health
```

### 3. Debian 12生产环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动并启用Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
newgrp docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 4. 项目部署到Debian

#### 方式一：使用预构建镜像 (推荐)

```bash
# 创建项目目录
sudo mkdir -p /opt/jtas
sudo chown $USER:$USER /opt/jtas
cd /opt/jtas

# 复制项目文件
scp -r user@windows-machine:/path/to/JTAS/* ./

# 或从Git仓库拉取
git clone <repository-url> .

# 设置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 启动服务
docker-compose --profile prod up -d

# 查看服务状态
docker-compose ps
```

#### 方式二：本地构建镜像

```bash
# 构建Docker镜像
docker build -t jtas-backend:latest .

# 启动完整服务栈
docker-compose up -d

# 查看日志
docker-compose logs -f jtas-backend
```

## 环境配置

### 环境变量配置 (.env文件)

```bash
# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_NAME=jtas_db
DB_USERNAME=jtas_user
DB_PASSWORD=your_secure_password

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# 应用配置
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# JIRA集成
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret

# 监控配置 (可选)
GRAFANA_PASSWORD=your_grafana_password

# SSL证书路径 (生产环境)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key
```

### 数据库初始化

```bash
# 连接到PostgreSQL容器
docker-compose exec postgres psql -U jtas_user -d jtas_db

# 验证数据库结构
\dt

# 查看初始数据
SELECT COUNT(*) FROM assignee_info;
```

## 服务管理

### Docker Compose命令

```bash
# 启动所有服务
docker-compose up -d

# 启动特定配置 (开发模式)
docker-compose --profile dev up -d

# 启动生产环境配置
docker-compose --profile prod up -d

# 启动监控服务
docker-compose --profile monitoring up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service-name]

# 重启服务
docker-compose restart [service-name]

# 停止服务
docker-compose down

# 停止并删除数据卷 (谨慎使用)
docker-compose down -v
```

### 系统服务配置 (Systemd)

创建系统服务文件：

```bash
# 创建服务文件
sudo nano /etc/systemd/system/jtas.service
```

```ini
[Unit]
Description=JIRA Task Automation System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/jtas
ExecStart=/usr/local/bin/docker-compose --profile prod up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# 启用服务
sudo systemctl daemon-reload
sudo systemctl enable jtas.service
sudo systemctl start jtas.service

# 检查状态
sudo systemctl status jtas.service
```

## 数据备份和恢复

### 数据库备份

```bash
# 创建备份目录
mkdir -p /opt/jtas/backups

# 创建备份脚本
cat > /opt/jtas/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/jtas/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/jtas_backup_${DATE}.sql"

# 创建数据库备份
docker-compose exec -T postgres pg_dump -U jtas_user jtas_db > "$BACKUP_FILE"

# 压缩备份文件
gzip "$BACKUP_FILE"

# 保留最近7天的备份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "备份完成: ${BACKUP_FILE}.gz"
EOF

chmod +x /opt/jtas/scripts/backup.sh

# 设置定时备份
crontab -e
# 添加: 0 2 * * * /opt/jtas/scripts/backup.sh
```

### 数据恢复

```bash
# 停止应用服务
docker-compose stop jtas-backend

# 恢复数据库
gunzip -c /opt/jtas/backups/jtas_backup_YYYYMMDD_HHMMSS.sql.gz | \
docker-compose exec -T postgres psql -U jtas_user -d jtas_db

# 重启服务
docker-compose start jtas-backend
```

## 监控和日志

### 应用日志

```bash
# 查看应用日志
docker-compose logs -f jtas-backend

# 查看特定时间段日志
docker-compose logs --since 2024-01-01T00:00:00 jtas-backend

# 导出日志到文件
docker-compose logs jtas-backend > /tmp/jtas_logs.txt
```

### 系统监控

```bash
# 启动监控服务
docker-compose --profile monitoring up -d

# 访问Prometheus (端口9090)
# 访问Grafana (端口3001)

# 查看容器资源使用情况
docker stats
```

## 性能优化

### JVM调优

编辑 `docker-compose.yml` 中的 `JAVA_OPTS`:

```yaml
environment:
  JAVA_OPTS: >-
    -Xms2g -Xmx4g
    -XX:+UseG1GC
    -XX:MaxGCPauseMillis=200
    -XX:+UseStringDeduplication
    -Dfile.encoding=UTF-8
```

### 数据库优化

```sql
-- 连接到数据库
docker-compose exec postgres psql -U jtas_user -d jtas_db

-- 分析表统计信息
ANALYZE;

-- 查看慢查询
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 优化配置
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 4096;
```

## 故障排查

### 常见问题

1. **数据库连接失败**
```bash
# 检查数据库服务状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 测试连接
docker-compose exec postgres pg_isready -U jtas_user
```

2. **内存不足**
```bash
# 检查系统内存
free -h

# 检查Docker内存使用
docker stats

# 调整JVM堆大小
# 编辑docker-compose.yml中的JAVA_OPTS
```

3. **端口冲突**
```bash
# 检查端口占用
netstat -tulpn | grep :8080

# 修改docker-compose.yml中的端口映射
ports:
  - "8081:8080"  # 改为8081
```

### 日志级别调整

```yaml
# docker-compose.yml中添加
environment:
  LOGGING_LEVEL_COM_JTAS: DEBUG
  LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY: DEBUG
```

## 安全配置

### SSL/TLS配置

```bash
# 生成自签名证书 (开发环境)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key -out ssl/cert.pem

# 配置Nginx SSL (生产环境使用Let's Encrypt)
```

### 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 升级指南

### 应用升级

```bash
# 备份数据
./scripts/backup.sh

# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 滚动更新
docker-compose up -d --no-deps jtas-backend

# 验证升级
curl http://localhost:8080/api/v1/actuator/health
```

这个部署指南提供了从Windows开发环境到Debian 12生产环境的完整迁移方案，包括详细的配置、监控、备份和故障排查指导。