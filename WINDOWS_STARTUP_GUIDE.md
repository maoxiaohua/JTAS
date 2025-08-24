# JTAS Windows 启动指南

## 🚀 快速启动

### 方式一：一键启动（推荐）
```bash
# 运行调试启动脚本
debug-and-start.bat
```

### 方式二：分步启动
```bash
# 1. 检查系统环境
check-system.bat

# 2. 启动所有服务
start-all-services.bat

# 3. 或分别启动
start-backend-fixed.bat      # 后端服务
start-frontend-fixed.bat     # 前端服务
```

### 方式三：手动启动
```bash
# 后端
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 前端 (新终端)
cd frontend
npm start
```

## 🔧 常见问题解决

### 问题1: 前端无法访问 "localhost 拒绝了我们的连接请求"

**原因**: 前端服务未启动或端口被占用

**解决方案**:
1. 检查前端服务是否启动：
   ```bash
   netstat -ano | findstr :3000
   ```

2. 手动启动前端：
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. 如果端口被占用，终止占用进程：
   ```bash
   # 查找占用进程
   netstat -ano | findstr :3000
   # 终止进程 (PID是最后一列数字)
   taskkill /PID <PID号> /F
   ```

4. 使用测试页面验证：
   ```
   双击打开: test-frontend.html
   ```

### 问题2: 后端API无响应

**解决方案**:
1. 检查后端是否启动：
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. 检查Java环境：
   ```bash
   java -version
   mvn -version
   ```

3. 重新编译启动：
   ```bash
   mvn clean package -DskipTests
   mvn spring-boot:run
   ```

### 问题3: 数据库连接失败

**解决方案**:
1. 启动Docker数据库：
   ```bash
   docker-compose up -d postgres redis
   ```

2. 或安装本地PostgreSQL：
   - 下载: https://www.postgresql.org/download/windows/
   - 创建数据库和用户：
     ```sql
     CREATE DATABASE jtas_db;
     CREATE USER jtas_user WITH PASSWORD 'jtas_password';
     GRANT ALL PRIVILEGES ON DATABASE jtas_db TO jtas_user;
     ```

### 问题4: npm install 失败

**解决方案**:
```bash
cd frontend
# 清理缓存
npm cache clean --force
# 删除node_modules
rmdir /s node_modules
del package-lock.json
# 重新安装
npm install --legacy-peer-deps
```

### 问题5: 防火墙阻止访问

**解决方案** (需管理员权限):
```bash
# 允许端口3000和8080
netsh advfirewall firewall add rule name="JTAS-Backend" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="JTAS-Frontend" dir=in action=allow protocol=TCP localport=3000
```

## 📊 验证系统正常运行

### 1. 访问地址
- 🌐 前端界面: http://localhost:3000
- 🔧 后端API: http://localhost:8080
- 📚 API文档: http://localhost:8080/swagger-ui.html
- 🧪 测试页面: 打开 test-frontend.html

### 2. 健康检查
```bash
# 后端健康检查
curl http://localhost:8080/actuator/health

# 前端检查 (返回HTML即正常)
curl http://localhost:3000

# API功能检查
curl http://localhost:8080/analysis/dashboard?days=7
```

### 3. 端口监听确认
```bash
netstat -ano | findstr :3000    # 前端
netstat -ano | findstr :8080    # 后端
netstat -ano | findstr :5432    # PostgreSQL
netstat -ano | findstr :6379    # Redis
```

## 🛠️ 开发环境要求

### 必需软件
- **Java 17+** `winget install Microsoft.OpenJDK.17`
- **Maven 3.8+** `winget install Apache.Maven`
- **Node.js 18+** `winget install OpenJS.Node.js`

### 可选软件
- **Docker Desktop** `winget install Docker.DockerDesktop`
- **PostgreSQL** (如不使用Docker)
- **Redis** (如不使用Docker)

## 📝 日志和调试

### 日志位置
- **后端日志**: logs/jtas-application.log
- **前端日志**: 浏览器控制台
- **启动日志**: debug.log

### 调试模式
```bash
# 后端调试模式
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dlogging.level.com.jtas=DEBUG

# 前端调试模式
cd frontend
set REACT_APP_DEBUG=true && npm start
```

## 🔄 重置和清理

### 完全重置
```bash
# 停止所有服务
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul

# 清理编译文件
mvn clean
cd frontend && rmdir /s node_modules

# 重新开始
debug-and-start.bat
```

### 清理Docker
```bash
docker-compose down
docker-compose up -d postgres redis
```

## 💡 性能优化

### 内存设置
```bash
# 增加Maven内存
set MAVEN_OPTS=-Xmx2g -XX:MaxPermSize=256m

# 增加Node.js内存
set NODE_OPTIONS=--max-old-space-size=4096
```

### 关闭不必要服务
- 关闭杀毒软件实时监控（临时）
- 关闭Windows Defender实时保护（临时）
- 关闭其他IDE或开发工具

## 🆘 应急方案

如果所有方法都不行：

1. **使用测试页面**: 打开 `test-frontend.html` 验证后端API
2. **只启动后端**: 通过 `http://localhost:8080/swagger-ui.html` 测试API
3. **联系支持**: 提供 debug.log 文件内容
4. **Docker部署**: `docker-compose up` 一键部署完整环境

---

## 📞 技术支持

如果遇到问题，请提供以下信息：
1. Windows版本
2. debug.log 文件内容
3. 错误截图
4. 执行的具体命令

**记住**: 大多数问题都是环境配置问题，按照本指南step by step执行通常能解决！