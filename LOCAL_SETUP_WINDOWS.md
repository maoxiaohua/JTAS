# Windows本地开发环境启动指南

## 前置要求检查

首先确保您的Windows系统已安装以下工具：

```bash
# 检查Java版本 (需要JDK 17+)
java -version

# 检查Maven版本 (需要3.8+)
mvn -version

# 检查Node.js版本 (需要18+)
node -v
npm -v
```

如果没有安装，请先安装：
- **Java 17**: `winget install Microsoft.OpenJDK.17`
- **Maven**: `winget install Apache.Maven`  
- **Node.js**: `winget install OpenJS.Node.js`

## 🚀 快速启动步骤

### 1. 启动数据库服务 (使用Docker)

```bash
# 进入项目目录
cd C:\Users\admin\Documents\JTAS

# 只启动数据库和Redis (不启动应用)
docker-compose up -d postgres redis

# 检查服务状态
docker-compose ps
```

如果没有Docker，可以使用本地PostgreSQL：
```bash
# 创建数据库
createdb -U postgres jtas_db

# 连接数据库并创建用户
psql -U postgres -d jtas_db -c "CREATE USER jtas_user WITH PASSWORD 'jtas_password';"
psql -U postgres -d jtas_db -c "GRANT ALL PRIVILEGES ON DATABASE jtas_db TO jtas_user;"
```

### 2. 启动后端服务

```bash
# 在项目根目录
cd C:\Users\admin\Documents\JTAS

# 设置环境变量 (Windows CMD)
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=jtas_db
set DB_USERNAME=jtas_user
set DB_PASSWORD=jtas_password
set REDIS_HOST=localhost
set REDIS_PORT=6379

# 或者使用PowerShell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="jtas_db"
$env:DB_USERNAME="jtas_user"
$env:DB_PASSWORD="jtas_password"
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"

# 构建并启动后端
mvn clean package -DskipTests
mvn spring-boot:run
```

### 3. 启动前端服务 (新开一个终端)

```bash
# 进入前端目录
cd C:\Users\admin\Documents\JTAS\frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 4. 验证服务启动

```bash
# 检查后端API (应该返回健康状态)
curl http://localhost:8080/api/v1/actuator/health

# 或在浏览器中访问
# http://localhost:8080/api/v1/swagger-ui.html
```

前端服务启动后会自动打开浏览器：`http://localhost:3000`

## 🔧 故障排除

### 问题1: 端口被占用
```bash
# 检查端口占用 (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :5432

# 杀死占用进程
taskkill /PID [进程ID] /F
```

### 问题2: 数据库连接失败
```bash
# 检查PostgreSQL是否运行
docker-compose logs postgres

# 手动连接测试
psql -h localhost -p 5432 -U jtas_user -d jtas_db
```

### 问题3: 前端启动失败
```bash
# 清理node_modules重新安装
cd frontend
rmdir /s node_modules
del package-lock.json
npm install
```

## 📝 环境变量配置文件

创建 `application-local.yml` 文件：
```yaml
# src/main/resources/application-local.yml
server:
  port: 8080

spring:
  profiles:
    active: local
  datasource:
    url: jdbc:postgresql://localhost:5432/jtas_db
    username: jtas_user
    password: jtas_password
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
  redis:
    host: localhost
    port: 6379

logging:
  level:
    com.jtas: DEBUG
    org.springframework.web: DEBUG
```

然后使用本地配置启动：
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```