# 多阶段构建 Dockerfile for JTAS Backend
# 支持跨平台部署 (Windows -> Debian12)

# 阶段1: 构建阶段
FROM maven:3.9.5-eclipse-temurin-17 AS builder

LABEL maintainer="JTAS Team <dev@jtas.com>"
LABEL description="JIRA Task Automation System - Backend Service"

# 设置工作目录
WORKDIR /app

# 复制Maven配置文件
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# 下载依赖 (利用Docker层缓存)
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src src

# 构建应用
RUN mvn clean package -DskipTests -B

# 阶段2: 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 安装必要的系统工具
RUN apk add --no-cache \
    curl \
    bash \
    tzdata \
    fontconfig \
    ttf-dejavu

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建应用用户
RUN addgroup -g 1000 jtas && \
    adduser -D -s /bin/bash -u 1000 -G jtas jtas

# 设置工作目录
WORKDIR /app

# 从构建阶段复制JAR文件
COPY --from=builder /app/target/*.jar app.jar

# 复制启动脚本和配置文件
COPY scripts/docker-entrypoint.sh /usr/local/bin/
COPY src/main/resources/application-docker.yml ./config/

# 创建必要的目录
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R jtas:jtas /app

# 设置脚本执行权限
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 切换到应用用户
USER jtas

# 暴露端口
EXPOSE 8080 8081

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/actuator/health || exit 1

# JVM调优参数
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:G1HeapRegionSize=16m \
               -XX:+UseStringDeduplication -XX:+OptimizeStringConcat \
               -XX:+UseCompressedOops -XX:+UseCompressedClassPointers \
               -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai \
               -Djava.awt.headless=true -Djava.net.preferIPv4Stack=true"

# Spring Boot配置
ENV SPRING_PROFILES_ACTIVE=docker
ENV SERVER_PORT=8080
ENV MANAGEMENT_SERVER_PORT=8081

# 使用entrypoint脚本启动
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["java", "-jar", "app.jar"]

# 元数据标签
LABEL org.opencontainers.image.title="JTAS Backend"
LABEL org.opencontainers.image.description="JIRA Task Automation System Backend Service"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="JTAS Team"
LABEL org.opencontainers.image.source="https://github.com/company/jtas"
LABEL org.opencontainers.image.licenses="MIT"