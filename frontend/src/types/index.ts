export interface AssigneeInfo {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  skillLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT' | 'LEAD';
  specialization: string[];
  isActive: boolean;
}

export interface TicketRecord {
  id: number;
  ticketId: string;
  jiraKey: string;
  summary: string;
  description?: string;
  reporter: string;
  assignee: AssigneeInfo;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ticketType: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  resolution?: string;
  createdTime: string;
  assignedTime?: string;
  firstResponseTime?: string;
  resolvedTime?: string;
  closedTime?: string;
  loggedTimeMinutes: number;
  estimatedTimeMinutes?: number;
  actualProcessingMinutes?: number;
  assignmentMethod: 'AI' | 'MANUAL';
  assignmentReason?: string;
  locationCode?: string;
  environment?: string;
}

export interface DashboardMetrics {
  assigneeName: string;
  department: string;
  totalTickets: number;
  aiTickets: number;
  manualTickets: number;
  aiAvgTime?: number;
  manualAvgTime?: number;
  avgLoggedTime?: number;
  completionRate?: number;
  efficiencyScore?: number;
  workloadHours?: number;
  overtimeHours?: number;
}

export interface AnalysisRequest {
  analysisName: string;
  startDate: string;
  endDate: string;
  assigneeIds?: number[];
  departments?: string[];
  priorities?: string[];
  ticketTypes?: string[];
}

export interface AnalysisMetrics {
  avgProcessingTime: number;
  avgResponseTime: number;
  completionRate: number;
  totalTickets: number;
  customerSatisfaction: number;
}

export interface ComparisonResult {
  analysisName: string;
  analysisDate: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  aiMetrics: AnalysisMetrics;
  manualMetrics: AnalysisMetrics;
  improvements: {
    processing_time: number;
    response_time: number;
    completion_rate: number;
    customer_satisfaction: number;
  };
  statisticalSignificance: number;
  confidenceLevel: number;
  sampleSizes: {
    ai: number;
    manual: number;
  };
}

export interface EfficiencyTrend {
  periodStart: string;
  periodEnd: string;
  aiAvgProcessingTime: number;
  manualAvgProcessingTime: number;
  aiCompletionRate: number;
  manualCompletionRate: number;
}

export interface ImportLog {
  id: number;
  fileName: string;
  fileSizeBytes: number;
  importType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  date?: string;
}

export interface TrendChartData {
  date: string;
  aiProcessingTime: number;
  manualProcessingTime: number;
  aiCompletionRate: number;
  manualCompletionRate: number;
}

export interface WorkloadDistribution {
  assignee: string;
  department: string;
  currentTickets: number;
  avgProcessingTime: number;
  workloadLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'OVERLOADED';
  efficiency: number;
}

export type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

export interface FilterOptions {
  departments: string[];
  assignees: AssigneeInfo[];
  priorities: string[];
  statuses: string[];
  assignmentMethods: string[];
}

export interface AnalysisConfig {
  timeRange: TimeRange;
  customStartDate?: string;
  customEndDate?: string;
  selectedDepartments: string[];
  selectedAssignees: number[];
  selectedPriorities: string[];
  compareAI: boolean;
  compareManual: boolean;
  groupBy: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  defaultTimeRange: TimeRange;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  notificationEnabled: boolean;
}

// 状态管理接口
export interface AppState {
  // 用户状态
  user: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  } | null;
  
  // 应用配置
  config: {
    apiBaseUrl: string;
    version: string;
    buildTime: string;
  };
  
  // 筛选器状态
  filters: FilterOptions;
  
  // 分析配置
  analysisConfig: AnalysisConfig;
  
  // 用户偏好
  preferences: UserPreferences;
  
  // UI状态
  ui: {
    loading: boolean;
    sidebarCollapsed: boolean;
    currentPage: string;
    breadcrumbs: Array<{
      name: string;
      path: string;
    }>;
  };
}

export type ActionType = 
  | 'SET_USER'
  | 'SET_LOADING'
  | 'SET_FILTERS'
  | 'UPDATE_ANALYSIS_CONFIG'
  | 'UPDATE_PREFERENCES'
  | 'SET_SIDEBAR_COLLAPSED'
  | 'SET_CURRENT_PAGE'
  | 'UPDATE_BREADCRUMBS';