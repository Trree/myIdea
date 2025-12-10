import { BusinessIdea, ChatMessage, ValidationResult, GenerationType } from './index';

/**
 * 工作流步骤类型
 */
export type WorkflowStep = 'generate' | 'refine' | 'validate';

/**
 * 步骤状态
 */
export type StepStatus = 'upcoming' | 'current' | 'completed' | 'skipped';

/**
 * 导航动作类型
 */
export type NavigationAction = 'forward' | 'back' | 'skip' | 'jump';

/**
 * 工作流状态
 */
export interface WorkflowState {
  // 当前步骤
  currentStep: WorkflowStep;

  // 已完成的步骤
  completedSteps: Set<WorkflowStep>;

  // 已跳过的步骤
  skippedSteps: Set<WorkflowStep>;

  // 各步骤的数据
  data: {
    generate?: GenerateStepData;
    refine?: RefineStepData;
    validate?: ValidateStepData;
  };

  // 导航历史
  history: NavigationHistoryItem[];

  // 元数据
  workflowId: string;
  startedAt: number;
  lastModifiedAt: number;
  version: number;
}

/**
 * 第1步：生成创意的数据
 */
export interface GenerateStepData {
  // 生成的创意列表
  ideas: BusinessIdea[];

  // 选中的创意
  selectedIdea: BusinessIdea | null;

  // 选中的索引
  selectedIndex: number | null;

  // 生成参数
  generationParams: {
    interests: string;
    generationType: GenerationType;
    model: string;
  };

  // 时间戳
  generatedAt: number;
}

/**
 * 第2步：精炼创意的数据
 */
export interface RefineStepData {
  // 原始话题（自动生成）
  originalTopic: string;

  // 用户编辑后的话题
  editedTopic?: string;

  // 对话模式
  mode: 'brainstorm' | 'refine';

  // 聊天历史
  chatHistory: ChatMessage[];

  // 开始时间
  startedAt: number;

  // 完成时间
  completedAt?: number;
}

/**
 * 第3步：验证需求的数据
 */
export interface ValidateStepData {
  // 原始需求描述（自动合成）
  originalDemand: string;

  // 用户编辑后的需求
  editedDemand?: string;

  // 验证结果
  result: ValidationResult | null;

  // 验证时间
  validatedAt?: number;
}

/**
 * 导航历史记录项
 */
export interface NavigationHistoryItem {
  step: WorkflowStep;
  timestamp: number;
  action: NavigationAction;
}

/**
 * 保存的工作流（用于历史列表）
 */
export interface SavedWorkflow {
  workflowId: string;
  state: WorkflowState;
  savedAt: number;
  preview: WorkflowPreview;
}

/**
 * 工作流预览信息
 */
export interface WorkflowPreview {
  ideaTitle: string;
  currentStep: WorkflowStep;
  progress: string; // "1/3", "2/3", "3/3"
  completedSteps: number;
  totalSteps: number;
}

/**
 * 工作流导出格式
 */
export interface WorkflowExport {
  workflowId: string;
  exportedAt: number;
  completedAt?: number;

  // 各步骤数据
  generate?: GenerateStepData;
  refine?: RefineStepData;
  validate?: ValidateStepData;

  // 元数据
  metadata: {
    version: string;
    timeSpent: number; // 毫秒
  };
}

/**
 * 步骤信息
 */
export interface StepInfo {
  id: WorkflowStep;
  label: string;
  description: string;
  icon: string; // 图标名称
}

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  // 最大保存的工作流数量
  maxSavedWorkflows: number;

  // 自动保存间隔（毫秒）
  autoSaveInterval: number;

  // 是否启用自动保存
  enableAutoSave: boolean;

  // 是否在恢复时显示对话框
  showResumeDialog: boolean;
}

/**
 * 默认工作流配置
 */
export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  maxSavedWorkflows: 50,
  autoSaveInterval: 2000, // 2秒
  enableAutoSave: true,
  showResumeDialog: true,
};

/**
 * 步骤顺序
 */
export const WORKFLOW_STEPS: WorkflowStep[] = ['generate', 'refine', 'validate'];

/**
 * 步骤信息映射
 */
export const STEP_INFO: Record<WorkflowStep, StepInfo> = {
  generate: {
    id: 'generate',
    label: '生成创意',
    description: '使用 AI 生成商业创意',
    icon: 'Sparkles',
  },
  refine: {
    id: 'refine',
    label: '精炼创意',
    description: '通过苏格拉底式对话深化你的想法',
    icon: 'Target',
  },
  validate: {
    id: 'validate',
    label: '验证需求',
    description: '评估需求的可行性',
    icon: 'CheckCircle',
  },
};
