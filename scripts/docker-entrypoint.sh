#!/bin/bash
set -e

# JTAS Docker启动脚本
# 支持跨平台部署 (Windows -> Debian12)

echo "=== JTAS Backend Starting ==="
echo "Platform: $(uname -a)"
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "Available Memory: $(free -h | grep Mem | awk '{print $2}' 2>/dev/null || echo 'N/A')"
echo "Current Time: $(date)"
echo "================================="

# 等待数据库就绪
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local max_attempts=30
    local attempt=1
    
    echo "等待 $service ($host:$port) 就绪..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            echo "$service 已就绪!"
            return 0
        fi
        
        echo "尝试 $attempt/$max_attempts: $service 未就绪，等待5秒..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "错误: $service 在 $((max_attempts * 5)) 秒后仍未就绪"
    return 1
}

# 检查必需的环境变量
check_required_env() {
    local required_vars=(
        "DB_HOST"
        "DB_NAME" 
        "DB_USERNAME"
        "DB_PASSWORD"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo "错误: 以下环境变量未设置:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
}

# 动态生成数据库URL
generate_db_url() {
    export DATABASE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true"
    echo "数据库连接URL: $DATABASE_URL"
}

# 设置JVM内存参数
setup_jvm_memory() {
    # 获取容器可用内存 (如果可用)
    if [ -r /sys/fs/cgroup/memory/memory.limit_in_bytes ]; then
        local memory_limit=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
        if [ $memory_limit -lt 9223372036854775807 ]; then  # 不是默认的最大值
            local memory_mb=$((memory_limit / 1024 / 1024))
            local heap_size=$((memory_mb * 80 / 100))  # 使用80%的内存作为堆
            
            export JAVA_OPTS="-Xms${heap_size}m -Xmx${heap_size}m $JAVA_OPTS"
            echo "检测到内存限制: ${memory_mb}MB, 设置堆大小: ${heap_size}MB"
        fi
    fi
}

# 创建必要的目录
create_directories() {
    local dirs=(
        "/app/logs"
        "/app/uploads" 
        "/app/temp"
        "/app/config"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo "创建目录: $dir"
        fi
    done
}

# 执行数据库健康检查
db_health_check() {
    echo "执行数据库连接测试..."
    
    # 使用Java连接测试数据库
    java -cp app.jar -Dloader.main=com.jtas.util.DatabaseHealthCheck \
         org.springframework.boot.loader.PropertiesLauncher \
         "$DATABASE_URL" "$DB_USERNAME" "$DB_PASSWORD" || {
        echo "警告: 数据库连接测试失败，应用可能无法正常启动"
        return 1
    }
    
    echo "数据库连接测试成功!"
    return 0
}

# 预热应用 (可选)
warmup_application() {
    if [ "$ENABLE_WARMUP" = "true" ]; then
        echo "启用应用预热..."
        
        # 在后台启动应用进行预热
        timeout 30 java $JAVA_OPTS -jar app.jar --spring.main.web-application-type=none \
                                                --spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration || true
        
        echo "应用预热完成"
    fi
}

# 主启动流程
main() {
    echo "开始启动流程..."
    
    # 1. 检查环境变量
    check_required_env
    
    # 2. 生成数据库连接URL
    generate_db_url
    
    # 3. 创建必要目录
    create_directories
    
    # 4. 设置JVM内存
    setup_jvm_memory
    
    # 5. 等待依赖服务
    if [ -n "$DB_HOST" ]; then
        wait_for_service "$DB_HOST" "${DB_PORT:-5432}" "PostgreSQL"
    fi
    
    if [ -n "$REDIS_HOST" ]; then
        wait_for_service "$REDIS_HOST" "${REDIS_PORT:-6379}" "Redis"
    fi
    
    # 6. 数据库健康检查
    if [ "$SKIP_DB_CHECK" != "true" ]; then
        db_health_check || echo "跳过数据库检查错误，继续启动..."
    fi
    
    # 7. 应用预热 (可选)
    warmup_application
    
    # 8. 启动应用
    echo "启动JTAS后端服务..."
    echo "Java选项: $JAVA_OPTS"
    echo "Spring配置: $SPRING_PROFILES_ACTIVE"
    
    # 如果是容器的主进程，使用exec替换shell进程
    if [ $$ -eq 1 ]; then
        exec "$@"
    else
        "$@"
    fi
}

# 信号处理
cleanup() {
    echo "收到终止信号，正在优雅关闭..."
    
    # 如果有Java进程在运行，发送TERM信号
    if [ -n "$JAVA_PID" ]; then
        kill -TERM $JAVA_PID 2>/dev/null || true
        wait $JAVA_PID 2>/dev/null || true
    fi
    
    echo "应用已关闭"
    exit 0
}

# 注册信号处理器
trap cleanup SIGTERM SIGINT

# 如果有参数传入，执行主流程
if [ $# -gt 0 ]; then
    main
    
    # 如果第一个参数是java命令，启动应用并保存PID
    if [ "$1" = "java" ]; then
        "$@" &
        JAVA_PID=$!
        wait $JAVA_PID
    else
        "$@"
    fi
else
    echo "用法: $0 <command> [args...]"
    exit 1
fi