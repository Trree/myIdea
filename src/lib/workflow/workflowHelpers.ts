import {
  WorkflowState,
  WorkflowStep,
  StepStatus,
  WORKFLOW_STEPS,
  WorkflowPreview,
} from '@/types/workflow';

/**
 * 获取步骤编号（1-based）
 */
export function getStepNumber(step: WorkflowStep): number {
  return WORKFLOW_STEPS.indexOf(step) + 1;
}

/**
 * 获取下一个步骤
 */
export function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) {
    return null;
  }
  return WORKFLOW_STEPS[currentIndex + 1];
}

/**
 * 获取上一个步骤
 */
export function getPreviousStep(currentStep: WorkflowStep): WorkflowStep | null {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return WORKFLOW_STEPS[currentIndex - 1];
}

/**
 * 计算工作流进度（0-1）
 */
export function getProgress(state: WorkflowState): number {
  const totalSteps = WORKFLOW_STEPS.length;
  const completedCount = state.completedSteps.size;
  const currentStepProgress = state.completedSteps.has(state.currentStep) ? 0 : 0.5;

  return (completedCount + currentStepProgress) / totalSteps;
}

/**
 * 获取步骤状态
 */
export function getStepStatus(step: WorkflowStep, state: WorkflowState): StepStatus {
  if (state.completedSteps.has(step)) {
    return 'completed';
  }
  if (state.skippedSteps.has(step)) {
    return 'skipped';
  }
  if (step === state.currentStep) {
    return 'current';
  }
  return 'upcoming';
}

/**
 * 检查是否可以导航到指定步骤
 */
export function canNavigateToStep(targetStep: WorkflowStep, state: WorkflowState): boolean {
  // 总是可以回到已完成或跳过的步骤
  if (state.completedSteps.has(targetStep) || state.skippedSteps.has(targetStep)) {
    return true;
  }

  // 可以导航到当前步骤
  if (targetStep === state.currentStep) {
    return true;
  }

  // 可以前进到下一个步骤（如果当前步骤已完成）
  const nextStep = getNextStep(state.currentStep);
  if (targetStep === nextStep && state.completedSteps.has(state.currentStep)) {
    return true;
  }

  // 其他情况不允许跳转
  return false;
}

/**
 * 检查当前步骤是否可以跳过
 */
export function canSkipCurrentStep(state: WorkflowState): boolean {
  // 最后一步不能跳过
  if (state.currentStep === 'validate') {
    return false;
  }

  // 如果已经完成了当前步骤，不需要跳过
  if (state.completedSteps.has(state.currentStep)) {
    return false;
  }

  return true;
}

/**
 * 检查是否可以继续到下一步
 */
export function canContinue(state: WorkflowState): boolean {
  // 如果当前步骤已完成，可以继续
  if (state.completedSteps.has(state.currentStep)) {
    return true;
  }

  // 根据步骤检查是否满足继续条件
  switch (state.currentStep) {
    case 'generate':
      // 必须选择一个创意
      return !!state.data.generate?.selectedIdea;

    case 'refine':
      // 必须有聊天历史或跳过
      return (state.data.refine?.chatHistory?.length ?? 0) > 0 || state.skippedSteps.has('refine');

    case 'validate':
      // 最后一步，检查是否有验证结果
      return !!state.data.validate?.result;

    default:
      return false;
  }
}

/**
 * 检查是否可以返回上一步
 */
export function canGoBack(state: WorkflowState): boolean {
  return state.currentStep !== 'generate';
}

/**
 * 生成工作流预览信息
 */
export function generateWorkflowPreview(state: WorkflowState): WorkflowPreview {
  const ideaTitle = state.data.generate?.selectedIdea?.title || '未命名创意';
  const completedSteps = state.completedSteps.size;
  const totalSteps = WORKFLOW_STEPS.length;
  const currentStepNum = getStepNumber(state.currentStep);

  return {
    ideaTitle,
    currentStep: state.currentStep,
    progress: `${currentStepNum}/${totalSteps}`,
    completedSteps,
    totalSteps,
  };
}

/**
 * 检查工作流是否完成
 */
export function isWorkflowComplete(state: WorkflowState): boolean {
  // 所有步骤都必须完成（不能跳过最后一步）
  return state.completedSteps.size === WORKFLOW_STEPS.length;
}

/**
 * 计算工作流耗时（毫秒）
 */
export function getTimeSpent(state: WorkflowState): number {
  return Date.now() - state.startedAt;
}

/**
 * 格式化耗时为可读字符串
 */
export function formatTimeSpent(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

/**
 * 生成新的工作流ID
 */
export function generateWorkflowId(): string {
  return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 创建初始工作流状态
 */
export function createInitialWorkflowState(): WorkflowState {
  return {
    currentStep: 'generate',
    completedSteps: new Set(),
    skippedSteps: new Set(),
    data: {},
    history: [],
    workflowId: generateWorkflowId(),
    startedAt: Date.now(),
    lastModifiedAt: Date.now(),
    version: 1,
  };
}

/**
 * 验证工作流状态的完整性
 */
export function validateWorkflowState(state: any): state is WorkflowState {
  if (!state || typeof state !== 'object') return false;
  if (!WORKFLOW_STEPS.includes(state.currentStep)) return false;
  if (!state.workflowId || typeof state.workflowId !== 'string') return false;
  if (!state.startedAt || typeof state.startedAt !== 'number') return false;

  return true;
}

/**
 * 序列化工作流状态（用于localStorage）
 */
export function serializeWorkflowState(state: WorkflowState): string {
  const serializable = {
    ...state,
    completedSteps: Array.from(state.completedSteps),
    skippedSteps: Array.from(state.skippedSteps),
  };
  return JSON.stringify(serializable);
}

/**
 * 反序列化工作流状态
 */
export function deserializeWorkflowState(json: string): WorkflowState | null {
  try {
    const parsed = JSON.parse(json);
    const state: WorkflowState = {
      ...parsed,
      completedSteps: new Set(parsed.completedSteps || []),
      skippedSteps: new Set(parsed.skippedSteps || []),
    };

    return validateWorkflowState(state) ? state : null;
  } catch (error) {
    console.error('Failed to deserialize workflow state:', error);
    return null;
  }
}
