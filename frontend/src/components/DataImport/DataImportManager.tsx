import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Upload,
  Button,
  Table,
  Progress,
  Typography,
  Space,
  Tag,
  Alert,
  Modal,
  Form,
  Select,
  Divider,
  message,
  Tooltip,
  Statistic,
  Steps,
  Descriptions
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { ImportLog } from '../../types';
import apiService from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;
const { Step } = Steps;

interface ImportProgress {
  currentProgress: number;
  totalRecords: number;
  processedRecords: number;
  currentStage: string;
  estimatedCompletion?: string;
}

const DataImportManager: React.FC = () => {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportLog | null>(null);
  const [progressModal, setProgressModal] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validationModal, setValidationModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [statistics, setStatistics] = useState<any>({});

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadImportLogs();
    loadStatistics();
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const loadImportLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getImportLogs(0, 20);
      setImportLogs(response.content);
    } catch (error) {
      message.error('获取导入记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await apiService.getImportStatistics(30);
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  const handleUpload: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json,.csv,.xlsx',
    beforeUpload: async (file) => {
      // 先进行数据验证
      try {
        const validationResult = await apiService.validateData(file);
        setValidationResult(validationResult);
        
        if (!validationResult.isValid) {
          setValidationModal(true);
          return false; // 阻止上传
        }
        
        return true;
      } catch (error) {
        message.error('文件验证失败');
        return false;
      }
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setUploading(true);
        const result = await apiService.uploadFile(file as File, 'JIRA_TICKETS');
        
        message.success('文件上传成功，开始导入数据');
        
        // 开始监控导入进度
        if (result.status === 'IN_PROGRESS') {
          startProgressMonitoring(result.id);
        }
        
        loadImportLogs();
        onSuccess?.(result);
      } catch (error) {
        message.error('文件上传失败');
        onError?.(error as Error);
      } finally {
        setUploading(false);
      }
    }
  };

  const startProgressMonitoring = (importId: number) => {
    setSelectedImport({ id: importId } as ImportLog);
    setProgressModal(true);
    
    // 每2秒更新一次进度
    progressIntervalRef.current = setInterval(async () => {
      try {
        const progress = await apiService.getImportProgress(importId);
        setImportProgress(progress as ImportProgress);
        
        // 如果完成或失败，停止监控
        if (progress.currentStage === 'COMPLETED' || progress.currentStage === 'FAILED') {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          
          setTimeout(() => {
            setProgressModal(false);
            loadImportLogs();
          }, 2000);
        }
      } catch (error) {
        console.error('获取进度失败:', error);
      }
    }, 2000);
  };

  const handleValidationConfirm = async () => {
    setValidationModal(false);
    
    if (validationResult?.warnings?.length > 0) {
      Modal.confirm({
        title: '发现数据质量问题',
        content: (
          <div>
            <Paragraph>检测到以下警告，是否继续导入？</Paragraph>
            <ul>
              {validationResult.warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        ),
        onOk: () => {
          message.info('继续上传文件（此功能需要在实际实现中处理）');
        }
      });
    }
  };

  const handleRetry = async (importId: number) => {
    try {
      await apiService.retryImport(importId);
      message.success('重新开始导入');
      loadImportLogs();
    } catch (error) {
      message.error('重试失败');
    }
  };

  const handleDelete = async (importId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条导入记录吗？',
      onOk: async () => {
        try {
          await apiService.deleteImport(importId, false);
          message.success('删除成功');
          loadImportLogs();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleDownloadTemplate = async (templateType: string, format: string) => {
    try {
      const blob = await apiService.downloadTemplate(templateType, format);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateType}_template.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('模板下载成功');
    } catch (error) {
      message.error('模板下载失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'PENDING': { color: 'processing', text: '待处理' },
      'IN_PROGRESS': { color: 'processing', text: '处理中' },
      'SUCCESS': { color: 'success', text: '成功' },
      'FAILED': { color: 'error', text: '失败' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getProgressSteps = (stage: string) => {
    const stages = ['PARSING', 'VALIDATING', 'IMPORTING', 'COMPLETED'];
    const stageNames = ['解析文件', '数据验证', '导入数据', '完成'];
    
    const currentStepIndex = stages.indexOf(stage);
    
    return (
      <Steps current={currentStepIndex} status={stage === 'FAILED' ? 'error' : 'process'}>
        {stageNames.map((name, index) => (
          <Step key={index} title={name} />
        ))}
      </Steps>
    );
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string) => (
        <Space>
          <FileTextOutlined />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '导入类型',
      dataIndex: 'importType',
      key: 'importType',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '记录统计',
      key: 'records',
      render: (record: ImportLog) => (
        <Space direction="vertical" size="small">
          <Text>总计: {record.recordsProcessed}</Text>
          <Text type="success">成功: {record.recordsSuccess}</Text>
          {record.recordsFailed > 0 && (
            <Text type="danger">失败: {record.recordsFailed}</Text>
          )}
        </Space>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'fileSizeBytes',
      key: 'fileSizeBytes',
      render: (size: number) => {
        const sizeInMB = (size / 1024 / 1024).toFixed(2);
        return `${sizeInMB} MB`;
      }
    },
    {
      title: '导入时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: ImportLog) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedImport(record);
                // 这里可以打开详情模态框
              }}
            />
          </Tooltip>
          {record.status === 'FAILED' && (
            <Tooltip title="重试导入">
              <Button 
                icon={<ReloadOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleRetry(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="删除记录">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>数据导入管理</Title>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总导入次数"
              value={statistics.total_imports || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="成功率"
              value={statistics.success_rate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="处理记录数"
              value={statistics.total_records_processed || 0}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="成功记录数"
              value={statistics.total_records_success || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 文件上传区域 */}
      <Card title="数据导入" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Dragger 
              {...handleUpload} 
              disabled={uploading}
              style={{ marginBottom: '16px' }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 JSON、CSV、Excel 格式的 JIRA 数据文件。
                文件将自动进行格式验证。
              </p>
            </Dragger>
            
            <Alert
              message="导入说明"
              description={
                <ul>
                  <li>支持的文件格式：JSON (.json)、CSV (.csv)、Excel (.xlsx)</li>
                  <li>文件大小限制：100MB</li>
                  <li>数据将自动验证格式和完整性</li>
                  <li>导入过程中可以实时查看进度</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title="数据模板" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadTemplate('JIRA_TICKETS', 'CSV')}
                >
                  下载工单模板(CSV)
                </Button>
                <Button
                  block
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadTemplate('JIRA_TICKETS', 'JSON')}
                >
                  下载工单模板(JSON)
                </Button>
                <Button
                  block
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadTemplate('ASSIGNEES', 'CSV')}
                >
                  下载人员模板(CSV)
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 导入记录表格 */}
      <Card title="导入记录" extra={
        <Button icon={<ReloadOutlined />} onClick={loadImportLogs}>
          刷新
        </Button>
      }>
        <Table
          columns={columns}
          dataSource={importLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 数据验证结果模态框 */}
      <Modal
        title="数据验证结果"
        open={validationModal}
        onCancel={() => setValidationModal(false)}
        onOk={handleValidationConfirm}
        okText="继续导入"
        cancelText="取消"
      >
        {validationResult && (
          <div>
            {validationResult.errors?.length > 0 && (
              <Alert
                message="数据验证失败"
                description={
                  <ul>
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            
            {validationResult.warnings?.length > 0 && (
              <Alert
                message="数据质量警告"
                description={
                  <ul>
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                }
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            {validationResult.statistics && (
              <Descriptions title="数据统计" bordered size="small">
                <Descriptions.Item label="总记录数">
                  {validationResult.statistics.total_records || 0}
                </Descriptions.Item>
                <Descriptions.Item label="AI分单">
                  {validationResult.statistics.ai_tickets || 0}
                </Descriptions.Item>
                <Descriptions.Item label="传统分单">
                  {validationResult.statistics.manual_tickets || 0}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>

      {/* 导入进度模态框 */}
      <Modal
        title="导入进度"
        open={progressModal}
        footer={null}
        closable={false}
        centered
        width={600}
      >
        {importProgress && (
          <div>
            {getProgressSteps(importProgress.currentStage)}
            
            <Divider />
            
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Statistic 
                  title="总记录数" 
                  value={importProgress.totalRecords}
                  prefix={<InfoCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="已处理" 
                  value={importProgress.processedRecords}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>
            
            <Progress 
              percent={Math.round(importProgress.currentProgress)}
              status={importProgress.currentStage === 'FAILED' ? 'exception' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068'
              }}
            />
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary">
                当前阶段: {importProgress.currentStage}
              </Text>
              {importProgress.estimatedCompletion && (
                <div>
                  <ClockCircleOutlined /> 预计完成时间: {new Date(importProgress.estimatedCompletion).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataImportManager;