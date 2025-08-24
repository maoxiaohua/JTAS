# JTAS 快速入门指南

## 系统简介

JTAS (JIRA Task Automation System) 是一个专业的JIRA工单效率分析系统，帮助团队分析AI分单与人工分单的效率差异，优化工作流程。

## 快速开始

### 1. 环境准备

确保您的系统已安装：
- Python 3.8+
- Node.js 16+
- npm 8+

### 2. 项目启动

#### 方式一：一键启动（推荐）
```bash
python start.py
```

#### 方式二：分别启动

**启动后端：**
```bash
pip install -r requirements.txt
python app.py
```

**启动前端：**
```bash
cd frontend
npm install
npm start
```

### 3. 访问系统

- 前端界面：http://localhost:3000
- 后端API：http://localhost:5000

## 功能使用

### 数据导入
1. **JIRA API导入**：配置JIRA服务器信息，直接从JIRA获取数据
2. **文件导入**：支持CSV、Excel格式文件导入

### 效率分析
- 对比AI分单与人工分单的平均处理时间
- 查看效率提升百分比和节省时间统计
- 生成详细的ROI分析报告

### 团队绩效
- 处理人员工作负载分布
- 个人效率排行
- 工单优先级分布统计

## 数据格式要求

### 必填字段
- `ticket_id`: 工单ID
- `assignment_method`: 分单方式 (AI/MANUAL)
- `actual_processing_minutes`: 处理时间（分钟）

### 可选字段
- `priority`: 优先级 (LOW/MEDIUM/HIGH/CRITICAL)
- `status`: 状态
- `assignee_employee_id`: 处理人员
- `created_time`: 创建时间
- `resolved_time`: 解决时间

## 常见问题

### Q: 支持哪些数据源？
A: 支持JIRA API直接连接和CSV/Excel文件导入。

### Q: 如何判断是AI分单还是人工分单？
A: 通过`assignment_method`字段区分，值为'AI'或'MANUAL'。

### Q: 系统如何计算效率提升？
A: 效率提升 = (人工平均时间 - AI平均时间) / 人工平均时间 × 100%

## 技术支持

如遇问题，请查看项目文档或提交Issue。