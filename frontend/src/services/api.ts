import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  DashboardMetrics,
  ComparisonResult,
  EfficiencyTrend,
  AnalysisRequest,
  ImportLog,
  AssigneeInfo,
  ApiResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error.response?.status} - ${error.message}`);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // 仪表板相关API
  async getDashboardMetrics(days: number = 30): Promise<DashboardMetrics[]> {
    const response: AxiosResponse<DashboardMetrics[]> = await this.api.get(
      `/analysis/dashboard?days=${days}`
    );
    return response.data;
  }

  async getWorkloadDistribution(days: number = 7): Promise<DashboardMetrics[]> {
    const response: AxiosResponse<DashboardMetrics[]> = await this.api.get(
      `/analysis/workload-distribution?days=${days}`
    );
    return response.data;
  }

  async getPerformanceRanking(
    rankBy: string = 'EFFICIENCY_SCORE',
    limit: number = 10,
    days: number = 30
  ): Promise<DashboardMetrics[]> {
    const response: AxiosResponse<DashboardMetrics[]> = await this.api.get(
      `/analysis/performance-ranking?rankBy=${rankBy}&limit=${limit}&days=${days}`
    );
    return response.data;
  }

  // 效率分析API
  async performComparison(request: AnalysisRequest): Promise<ComparisonResult> {
    const response: AxiosResponse<ComparisonResult> = await this.api.post(
      '/analysis/compare',
      request
    );
    return response.data;
  }

  async getEfficiencyTrend(
    startDate: string,
    endDate: string,
    groupBy: string = 'WEEKLY'
  ): Promise<EfficiencyTrend[]> {
    const response: AxiosResponse<EfficiencyTrend[]> = await this.api.get(
      `/analysis/trend?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
    );
    return response.data;
  }

  async getAssigneeMetrics(
    assigneeId: number,
    startDate: string,
    endDate: string
  ): Promise<DashboardMetrics[]> {
    const response: AxiosResponse<DashboardMetrics[]> = await this.api.get(
      `/analysis/assignee/${assigneeId}/metrics?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getAiAssignmentAnalysis(
    startDate: string,
    endDate: string
  ): Promise<ComparisonResult> {
    const response: AxiosResponse<ComparisonResult> = await this.api.get(
      `/analysis/ai-assignment-analysis?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getBottleneckAnalysis(days: number = 30): Promise<DashboardMetrics[]> {
    const response: AxiosResponse<DashboardMetrics[]> = await this.api.get(
      `/analysis/bottleneck-analysis?days=${days}`
    );
    return response.data;
  }

  // 报告导出API
  async exportReport(
    request: AnalysisRequest,
    format: 'PDF' | 'EXCEL' = 'PDF'
  ): Promise<Blob> {
    const response = await this.api.post(
      `/analysis/export-report?format=${format}`,
      request,
      {
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // 数据导入API
  async uploadFile(
    file: File,
    importType: string = 'JIRA_TICKETS'
  ): Promise<ImportLog> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);

    const response: AxiosResponse<ImportLog> = await this.api.post(
      '/import/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  async getImportLogs(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<ImportLog>> {
    const response: AxiosResponse<PaginatedResponse<ImportLog>> = await this.api.get(
      `/import/logs?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getImportStatus(importId: number): Promise<ImportLog> {
    const response: AxiosResponse<ImportLog> = await this.api.get(
      `/import/status/${importId}`
    );
    return response.data;
  }

  async validateData(file: File): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    statistics: any;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // 处理人员管理API
  async getAssignees(): Promise<AssigneeInfo[]> {
    const response: AxiosResponse<AssigneeInfo[]> = await this.api.get('/assignees');
    return response.data;
  }

  async createAssignee(assignee: Omit<AssigneeInfo, 'id'>): Promise<AssigneeInfo> {
    const response: AxiosResponse<AssigneeInfo> = await this.api.post('/assignees', assignee);
    return response.data;
  }

  async updateAssignee(id: number, assignee: Partial<AssigneeInfo>): Promise<AssigneeInfo> {
    const response: AxiosResponse<AssigneeInfo> = await this.api.put(`/assignees/${id}`, assignee);
    return response.data;
  }

  async deleteAssignee(id: number): Promise<void> {
    await this.api.delete(`/assignees/${id}`);
  }

  // 系统配置API
  async getSystemHealth(): Promise<{
    status: string;
    components: Record<string, {
      status: string;
      details?: any;
    }>;
  }> {
    const response = await this.api.get('/actuator/health');
    return response.data;
  }

  async getSystemInfo(): Promise<{
    app: {
      name: string;
      version: string;
      buildTime: string;
    };
    java: {
      version: string;
      runtime: string;
    };
    system: {
      processors: number;
      memory: {
        total: number;
        free: number;
        max: number;
      };
    };
  }> {
    const response = await this.api.get('/actuator/info');
    return response.data;
  }

  // 数据筛选辅助API
  async getDepartments(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await this.api.get('/filters/departments');
    return response.data;
  }

  async getPriorities(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await this.api.get('/filters/priorities');
    return response.data;
  }

  async getTicketTypes(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await this.api.get('/filters/ticket-types');
    return response.data;
  }

  // 实时数据订阅 (WebSocket)
  subscribeToRealTimeUpdates(callback: (data: any) => void): WebSocket | null {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws/dashboard';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService;