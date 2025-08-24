import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Typography,
  Alert,
  Spin,
  Select,
  DatePicker,
  Button,
  Tooltip
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import { DashboardMetrics } from '../../types';
import apiService from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface StatCardProps {
  title: string;
  value: number | string;
  precision?: number;
  suffix?: string;
  prefix?: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  precision,
  suffix,
  prefix,
  trend,
  loading
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? (
      <RiseOutlined style={{ color: '#52c41a' }} />
    ) : (
      <FallOutlined style={{ color: '#ff4d4f' }} />
    );
  };

  const getTrendColor = () => {
    if (!trend) return undefined;
    return trend > 0 ? '#52c41a' : '#ff4d4f';
  };

  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        suffix={suffix}
        prefix={prefix}
        loading={loading}
      />
      {trend && (
        <div style={{ marginTop: 8 }}>
          <Text style={{ color: getTrendColor() }}>
            {getTrendIcon()} {Math.abs(trend)}%
          </Text>
        </div>
      )}
    </Card>
  );
};

const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardMetrics[]>([]);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardMetrics(timeRange);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // 计算汇总统计
  const totalTickets = dashboardData.reduce((sum, item) => sum + item.totalTickets, 0);
  const totalAiTickets = dashboardData.reduce((sum, item) => sum + item.aiTickets, 0);
  const avgAiProcessingTime = dashboardData
    .filter(item => item.aiAvgTime)
    .reduce((sum, item, _, arr) => sum + item.aiAvgTime! / arr.length, 0);
  const avgManualProcessingTime = dashboardData
    .filter(item => item.manualAvgTime)
    .reduce((sum, item, _, arr) => sum + item.manualAvgTime! / arr.length, 0);
  const avgCompletionRate = dashboardData
    .filter(item => item.completionRate)
    .reduce((sum, item, _, arr) => sum + item.completionRate! / arr.length, 0);

  // 表格列配置
  const columns = [
    {
      title: '处理人员',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <strong>{text}</strong>
        </Space>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '总工单数',
      dataIndex: 'totalTickets',
      key: 'totalTickets',
      sorter: (a: DashboardMetrics, b: DashboardMetrics) => a.totalTickets - b.totalTickets,
      render: (value: number) => (
        <Statistic value={value} valueStyle={{ fontSize: '14px' }} />
      )
    },
    {
      title: 'AI分单',
      dataIndex: 'aiTickets',
      key: 'aiTickets',
      sorter: (a: DashboardMetrics, b: DashboardMetrics) => a.aiTickets - b.aiTickets,
      render: (value: number, record: DashboardMetrics) => (
        <Space direction="vertical" size="small">
          <Text>{value}</Text>
          <Progress
            percent={Math.round((value / record.totalTickets) * 100)}
            size="small"
            status="active"
          />
        </Space>
      )
    },
    {
      title: 'AI平均时间',
      dataIndex: 'aiAvgTime',
      key: 'aiAvgTime',
      sorter: (a: DashboardMetrics, b: DashboardMetrics) => (a.aiAvgTime || 0) - (b.aiAvgTime || 0),
      render: (value: number) => (
        value ? (
          <Tooltip title={`${value} 分钟`}>
            <Space>
              <ClockCircleOutlined />
              <Text>{Math.round(value / 60 * 10) / 10}h</Text>
            </Space>
          </Tooltip>
        ) : <Text type="secondary">-</Text>
      )
    },
    {
      title: '传统平均时间',
      dataIndex: 'manualAvgTime',
      key: 'manualAvgTime',
      sorter: (a: DashboardMetrics, b: DashboardMetrics) => (a.manualAvgTime || 0) - (b.manualAvgTime || 0),
      render: (value: number) => (
        value ? (
          <Tooltip title={`${value} 分钟`}>
            <Space>
              <ClockCircleOutlined />
              <Text>{Math.round(value / 60 * 10) / 10}h</Text>
            </Space>
          </Tooltip>
        ) : <Text type="secondary">-</Text>
      )
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      sorter: (a: DashboardMetrics, b: DashboardMetrics) => (a.completionRate || 0) - (b.completionRate || 0),
      render: (value: number) => (
        value ? (
          <Progress
            type="circle"
            size="small"
            percent={Math.round(value)}
            status={value >= 80 ? 'success' : value >= 60 ? 'active' : 'exception'}
          />
        ) : <Text type="secondary">-</Text>
      )
    },
    {
      title: '效率评分',
      dataIndex: 'efficiencyScore',
      key: 'efficiencyScore',
      sorter: (a: DashboardMetrics, b: DashboardMetrics) => (a.efficiencyScore || 0) - (b.efficiencyScore || 0),
      render: (value: number) => (
        value ? (
          <Space>
            <Progress
              type="circle"
              size="small"
              percent={Math.round(value)}
              status={value >= 80 ? 'success' : value >= 60 ? 'active' : 'exception'}
            />
            <Text strong>{Math.round(value)}</Text>
          </Space>
        ) : <Text type="secondary">-</Text>
      )
    }
  ];

  // 准备图表数据
  const departmentData = dashboardData.reduce((acc, item) => {
    const existing = acc.find(d => d.department === item.department);
    if (existing) {
      existing.tickets += item.totalTickets;
      existing.aiTickets += item.aiTickets;
    } else {
      acc.push({
        department: item.department,
        tickets: item.totalTickets,
        aiTickets: item.aiTickets
      });
    }
    return acc;
  }, [] as Array<{ department: string; tickets: number; aiTickets: number }>);

  const efficiencyComparisonData = dashboardData
    .filter(item => item.aiAvgTime && item.manualAvgTime)
    .map(item => ({
      assignee: item.assigneeName,
      AI分单: Math.round(item.aiAvgTime! / 60 * 10) / 10,
      传统分单: Math.round(item.manualAvgTime! / 60 * 10) / 10
    }));

  const pieChartData = [
    { type: 'AI分单', value: totalAiTickets },
    { type: '传统分单', value: totalTickets - totalAiTickets }
  ];

  const lineChartConfig = {
    data: efficiencyComparisonData,
    xField: 'assignee',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const columnChartConfig = {
    data: departmentData.map(item => [
      { department: item.department, type: '总工单', count: item.tickets },
      { department: item.department, type: 'AI分单', count: item.aiTickets }
    ]).flat(),
    xField: 'department',
    yField: 'count',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };

  const pieChartConfig = {
    data: pieChartData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部控制区 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>效率分析仪表板</Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value={7}>最近7天</Option>
              <Option value={30}>最近30天</Option>
              <Option value={90}>最近90天</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="总工单数"
            value={totalTickets}
            prefix={<CheckCircleOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="AI分单占比"
            value={totalTickets > 0 ? Math.round((totalAiTickets / totalTickets) * 100) : 0}
            suffix="%"
            prefix={<RiseOutlined />}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="AI平均处理时间"
            value={Math.round(avgAiProcessingTime / 60 * 10) / 10}
            precision={1}
            suffix="小时"
            prefix={<ClockCircleOutlined />}
            trend={avgManualProcessingTime > 0 ? 
              Math.round(((avgManualProcessingTime - avgAiProcessingTime) / avgManualProcessingTime) * 100) : 0
            }
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="平均完成率"
            value={Math.round(avgCompletionRate)}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            loading={loading}
          />
        </Col>
      </Row>

      {/* 告警信息 */}
      {avgAiProcessingTime > 0 && avgManualProcessingTime > 0 && (
        <Row style={{ marginBottom: '24px' }}>
          <Col span={24}>
            {avgAiProcessingTime < avgManualProcessingTime ? (
              <Alert
                message="AI分单效果显著"
                description={`AI分单平均处理时间比传统分单快 ${Math.round(((avgManualProcessingTime - avgAiProcessingTime) / avgManualProcessingTime) * 100)}%`}
                type="success"
                showIcon
                closable
              />
            ) : (
              <Alert
                message="分单效果需要优化"
                description="AI分单平均处理时间未显著优于传统分单，建议检查分单算法"
                type="warning"
                showIcon
                closable
              />
            )}
          </Col>
        </Row>
      )}

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="部门工单分布" loading={loading}>
            <Column {...columnChartConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="分单方式分布" loading={loading}>
            <Pie {...pieChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 效率对比图表 */}
      {efficiencyComparisonData.length > 0 && (
        <Row style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card title="AI vs 传统分单效率对比" loading={loading}>
              <Line {...lineChartConfig} height={300} />
            </Card>
          </Col>
        </Row>
      )}

      {/* 详细数据表格 */}
      <Row>
        <Col span={24}>
          <Card title="处理人员详细数据" loading={loading}>
            <Table
              columns={columns}
              dataSource={dashboardData}
              rowKey="assigneeName"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`
              }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;