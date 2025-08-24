import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  DatePicker,
  Input,
  Button,
  Select,
  Typography,
  Divider,
  Statistic,
  Progress,
  Alert,
  Space,
  Table,
  Tag,
  Tooltip,
  Spin,
  message
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  CompareOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Line, Column, Gauge } from '@ant-design/charts';
import dayjs from 'dayjs';
import { AnalysisRequest, ComparisonResult, AssigneeInfo } from '../../types';
import apiService from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ComparisonCardProps {
  title: string;
  aiValue: number;
  manualValue: number;
  improvement: number;
  unit: string;
  isTimeMetric?: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  aiValue,
  manualValue,
  improvement,
  unit,
  isTimeMetric = false
}) => {
  const getImprovementColor = () => {
    if (isTimeMetric) {
      return improvement < 0 ? '#52c41a' : '#ff4d4f';
    } else {
      return improvement > 0 ? '#52c41a' : '#ff4d4f';
    }
  };

  const getImprovementText = () => {
    const absImprovement = Math.abs(improvement);
    if (isTimeMetric) {
      return improvement < 0 ? `减少 ${absImprovement}%` : `增加 ${absImprovement}%`;
    } else {
      return improvement > 0 ? `提升 ${absImprovement}%` : `下降 ${absImprovement}%`;
    }
  };

  return (
    <Card>
      <Typography.Title level={5}>{title}</Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="AI分单"
            value={aiValue}
            suffix={unit}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="传统分单"
            value={manualValue}
            suffix={unit}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>
      <Divider style={{ margin: '12px 0' }} />
      <Text style={{ color: getImprovementColor(), fontWeight: 'bold' }}>
        {getImprovementText()}
      </Text>
    </Card>
  );
};

const ComparisonAnalysis: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [assignees, setAssignees] = useState<AssigneeInfo[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
    // 设置默认日期范围为最近30天
    form.setFieldsValue({
      dateRange: [dayjs().subtract(30, 'day'), dayjs()],
      analysisName: `效率对比分析_${dayjs().format('YYYY-MM-DD')}`
    });
  }, [form]);

  const loadFilterOptions = async () => {
    try {
      const [assigneesData, departmentsData] = await Promise.all([
        apiService.getAssignees(),
        apiService.getDepartments()
      ]);
      setAssignees(assigneesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const handleAnalysis = async (values: any) => {
    try {
      setAnalyzing(true);
      
      const request: AnalysisRequest = {
        analysisName: values.analysisName,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        assigneeIds: values.assigneeIds,
        departments: values.departments,
        priorities: values.priorities,
        ticketTypes: values.ticketTypes
      };

      const result = await apiService.performComparison(request);
      setComparisonResult(result);
      message.success('分析完成');
    } catch (error) {
      message.error('分析失败，请重试');
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async (format: 'PDF' | 'EXCEL') => {
    if (!comparisonResult) return;

    try {
      setLoading(true);
      const request: AnalysisRequest = {
        analysisName: comparisonResult.analysisName,
        startDate: comparisonResult.dateRangeStart,
        endDate: comparisonResult.dateRangeEnd
      };

      const blob = await apiService.exportReport(request, format);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${comparisonResult.analysisName}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success(`${format}报告导出成功`);
    } catch (error) {
      message.error('导出失败');
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 准备图表数据
  const getComparisonChartData = () => {
    if (!comparisonResult) return [];
    
    return [
      {
        metric: '平均处理时间',
        AI分单: Math.round(comparisonResult.aiMetrics.avgProcessingTime / 60 * 10) / 10,
        传统分单: Math.round(comparisonResult.manualMetrics.avgProcessingTime / 60 * 10) / 10,
        unit: '小时'
      },
      {
        metric: '平均响应时间',
        AI分单: Math.round(comparisonResult.aiMetrics.avgResponseTime / 60 * 10) / 10,
        传统分单: Math.round(comparisonResult.manualMetrics.avgResponseTime / 60 * 10) / 10,
        unit: '小时'
      },
      {
        metric: '完成率',
        AI分单: comparisonResult.aiMetrics.completionRate,
        传统分单: comparisonResult.manualMetrics.completionRate,
        unit: '%'
      },
      {
        metric: '客户满意度',
        AI分单: comparisonResult.aiMetrics.customerSatisfaction,
        传统分单: comparisonResult.manualMetrics.customerSatisfaction,
        unit: '分'
      }
    ];
  };

  const chartData = getComparisonChartData();
  
  const columnChartConfig = {
    data: chartData.map(item => [
      { metric: item.metric, type: 'AI分单', value: item.AI分单 },
      { metric: item.metric, type: '传统分单', value: item.传统分单 }
    ]).flat(),
    xField: 'metric',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ['#1890ff', '#722ed1'],
  };

  // 统计显著性仪表盘配置
  const significanceGaugeConfig = {
    percent: comparisonResult ? (1 - comparisonResult.statisticalSignificance) : 0,
    range: {
      color: '#1890ff',
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '36px',
          lineHeight: '36px',
          color: '#1890ff',
        },
        formatter: ({ percent }: { percent: number }) => `${Math.round(percent * 100)}%`,
      },
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>AI vs 传统分单效率对比分析</Title>
      
      {/* 分析配置表单 */}
      <Card title="分析配置" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAnalysis}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="analysisName"
                label="分析名称"
                rules={[{ required: true, message: '请输入分析名称' }]}
              >
                <Input placeholder="请输入分析名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="dateRange"
                label="分析时间范围"
                rules={[{ required: true, message: '请选择时间范围' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="departments" label="部门筛选">
                <Select
                  mode="multiple"
                  placeholder="选择部门（可多选）"
                  allowClear
                >
                  {departments.map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="assigneeIds" label="处理人员筛选">
                <Select
                  mode="multiple"
                  placeholder="选择处理人员（可多选）"
                  allowClear
                >
                  {assignees.map(assignee => (
                    <Option key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.department})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="priorities" label="优先级筛选">
                <Select
                  mode="multiple"
                  placeholder="选择优先级（可多选）"
                  allowClear
                >
                  <Option value="CRITICAL">紧急</Option>
                  <Option value="HIGH">高</Option>
                  <Option value="MEDIUM">中</Option>
                  <Option value="LOW">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<CompareOutlined />}
                loading={analyzing}
                size="large"
              >
                开始分析
              </Button>
              {comparisonResult && (
                <>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('PDF')}
                    loading={loading}
                  >
                    导出PDF
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('EXCEL')}
                    loading={loading}
                  >
                    导出Excel
                  </Button>
                </>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {analyzing && (
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: '16px' }}>
              正在分析数据，请稍候...
            </Paragraph>
          </div>
        </Card>
      )}

      {/* 分析结果 */}
      {comparisonResult && (
        <>
          {/* 分析概要 */}
          <Card title="分析概要" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col xs={24} md={16}>
                <Paragraph>
                  <Text strong>分析名称：</Text>{comparisonResult.analysisName}<br />
                  <Text strong>分析时间：</Text>{comparisonResult.dateRangeStart} 至 {comparisonResult.dateRangeEnd}<br />
                  <Text strong>样本大小：</Text>AI分单 {comparisonResult.sampleSizes.ai} 个，传统分单 {comparisonResult.sampleSizes.manual} 个<br />
                  <Text strong>置信度：</Text>{comparisonResult.confidenceLevel}%
                </Paragraph>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4}>统计显著性</Title>
                  <Gauge {...significanceGaugeConfig} height={150} />
                  <Text type="secondary">
                    {comparisonResult.statisticalSignificance < 0.05 ? '结果具有统计显著性' : '结果不具有统计显著性'}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* 核心指标对比 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <ComparisonCard
                title="平均处理时间"
                aiValue={Math.round(comparisonResult.aiMetrics.avgProcessingTime / 60 * 10) / 10}
                manualValue={Math.round(comparisonResult.manualMetrics.avgProcessingTime / 60 * 10) / 10}
                improvement={comparisonResult.improvements.processing_time}
                unit="小时"
                isTimeMetric={true}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ComparisonCard
                title="平均响应时间"
                aiValue={Math.round(comparisonResult.aiMetrics.avgResponseTime / 60 * 10) / 10}
                manualValue={Math.round(comparisonResult.manualMetrics.avgResponseTime / 60 * 10) / 10}
                improvement={comparisonResult.improvements.response_time}
                unit="小时"
                isTimeMetric={true}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ComparisonCard
                title="完成率"
                aiValue={comparisonResult.aiMetrics.completionRate}
                manualValue={comparisonResult.manualMetrics.completionRate}
                improvement={comparisonResult.improvements.completion_rate}
                unit="%"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ComparisonCard
                title="客户满意度"
                aiValue={comparisonResult.aiMetrics.customerSatisfaction}
                manualValue={comparisonResult.manualMetrics.customerSatisfaction}
                improvement={comparisonResult.improvements.customer_satisfaction}
                unit="分"
              />
            </Col>
          </Row>

          {/* 结果解读 */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Card title="分析结论">
                {comparisonResult.improvements.processing_time < -5 && (
                  <Alert
                    message="AI分单效果显著"
                    description={`相比传统分单方式，AI自动分单在处理时间上有显著改进，平均快了 ${Math.abs(comparisonResult.improvements.processing_time).toFixed(1)}%`}
                    type="success"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                )}
                
                {comparisonResult.improvements.completion_rate > 5 && (
                  <Alert
                    message="完成率显著提升"
                    description={`AI分单的工单完成率比传统分单高 ${comparisonResult.improvements.completion_rate.toFixed(1)}%`}
                    type="success"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                )}

                {comparisonResult.statisticalSignificance > 0.05 && (
                  <Alert
                    message="统计显著性不足"
                    description="当前数据量可能不足以得出统计上显著的结论，建议扩大样本范围或延长观察时间"
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                )}

                <Paragraph>
                  <Text strong>建议：</Text>
                  {comparisonResult.improvements.processing_time < 0 ? 
                    '继续优化AI分单算法，保持优势。' : 
                    '需要重新评估AI分单策略，考虑算法优化。'
                  }
                  {comparisonResult.improvements.completion_rate > 0 ? 
                    '当前分单策略在完成率方面表现良好。' : 
                    '建议检查工单分配的合理性和处理人员负载。'
                  }
                </Paragraph>
              </Card>
            </Col>
          </Row>

          {/* 对比图表 */}
          <Row gutter={16}>
            <Col span={24}>
              <Card title="指标对比图表">
                <Column {...columnChartConfig} height={400} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default ComparisonAnalysis;