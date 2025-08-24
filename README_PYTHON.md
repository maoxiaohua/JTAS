# JIRA效率分析系统 - Python版本

🚀 **简单高效的JIRA工单效率分析工具**

## ✨ 功能特色

- 📊 **直观仪表板**: 实时显示关键效率指标
- 🤖 **AI vs 人工对比**: 智能分单与人工分单效果对比
- 📁 **多格式数据导入**: 支持CSV、Excel、JSON格式
- 📈 **可视化图表**: 交互式图表展示分析结果
- 📋 **Excel报告导出**: 一键导出详细分析报告
- 💻 **现代Web界面**: 响应式设计，支持移动端

## 🛠️ 快速启动

### 方法一：一键启动（推荐）
```bash
python start.py
```

### 方法二：手动启动
```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 启动应用
python app.py
```

### 访问系统
- 🌐 **主界面**: http://localhost:5000
- 📊 **API接口**: http://localhost:5000/api/metrics

## 📋 系统要求

- Python 3.8+
- 现代浏览器（Chrome、Firefox、Edge）

## 📊 核心指标

- **总工单数**: 系统处理的工单总量
- **AI分单数量**: 使用AI智能分单的工单数
- **人工分单数量**: 人工手动分单的工单数
- **完成率**: 工单完成百分比
- **平均处理时间**: AI vs 人工平均处理时间对比
- **效率提升**: AI相比人工的效率提升百分比

## 📁 数据导入

### 支持的文件格式
- **CSV**: 逗号分隔值文件
- **Excel**: .xlsx格式
- **JSON**: 结构化JSON数据

### 必需的数据字段
```
ticket_id              # 工单ID
jira_key              # JIRA工单键
summary               # 工单摘要
assignee_employee_id  # 处理人员ID
priority              # 优先级 (LOW/MEDIUM/HIGH/CRITICAL)
status               # 状态 (OPEN/RESOLVED/CLOSED)
assignment_method    # 分单方式 (AI/MANUAL)
created_time         # 创建时间
assigned_time        # 分配时间
resolved_time        # 解决时间
actual_processing_minutes  # 实际处理时间(分钟)
```

### 示例数据格式 (CSV)
```csv
ticket_id,jira_key,summary,assignee_employee_id,priority,status,assignment_method,created_time,actual_processing_minutes
TICKET-001,PROJ-1001,系统登录问题,EMP001,HIGH,RESOLVED,AI,2024-01-15 10:00:00,120
TICKET-002,PROJ-1002,数据库优化,EMP002,MEDIUM,RESOLVED,MANUAL,2024-01-15 11:00:00,180
```

## 🎯 使用场景

1. **效率分析**: 对比AI分单与人工分单的效率差异
2. **工作负载分析**: 查看各处理人员的工作分配情况  
3. **趋势分析**: 追踪处理效率的时间变化趋势
4. **决策支持**: 为改进分单策略提供数据支持

## 📈 API接口

- `GET /api/metrics` - 获取效率指标
- `GET /api/charts/comparison` - AI vs 人工对比图表数据
- `GET /api/charts/workload` - 工作负载分布图表数据
- `POST /api/upload` - 上传数据文件
- `GET /api/export/excel` - 导出Excel报告

## 🔧 自定义开发

### 添加新的分析指标
在 `app.py` 的 `calculate_efficiency_metrics()` 函数中添加新的计算逻辑。

### 添加新的图表类型
1. 在 `app.py` 中创建新的API端点
2. 在 `dashboard.html` 中添加对应的前端展示

### 数据处理扩展
在 `api_upload()` 函数中添加更多的数据预处理逻辑。

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 更改端口
   python -c "from app import app; app.run(port=5001)"
   ```

2. **依赖安装失败**
   ```bash
   # 升级pip
   python -m pip install --upgrade pip
   
   # 使用国内镜像
   pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```

3. **文件上传失败**
   - 检查文件格式是否正确
   - 确保文件包含必需的数据字段
   - 检查文件大小是否过大

## 📞 技术支持

如有问题，请检查：
1. Python版本是否为3.8+
2. 所有依赖是否正确安装
3. 数据文件格式是否符合要求

---

**享受高效的JIRA分析体验！** 🎉