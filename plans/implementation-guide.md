# 🛠️ 工作流系统实施指南

## 📋 Phase 1: 基础架构实施

### 1.1 创建工作流类型定义

**文件**: `src/types/workflow.ts`

```typescript
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

export interface StepInfo {
  id: WorkflowStep;
  label: string;
  description: string;
  icon: string;
}
```

### 1.2 创建工作流辅助函数

**文件**: `src/lib/workflow/workflowHelpers.ts`

```typescript
import { WorkflowState, WorkflowStep, WORKFLOW_STEPS } from '@/types/workflow';

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
  
  return false;
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
```

### 1.3 创建数据转换器

**文件**: `src/lib/workflow/dataTransformers.ts`

```typescript
import { BusinessIdea, ChatMessage } from '@/types';

/**
 * 从创意生成苏格拉底式对话话题
 */
export function synthesizeTopicFromIdea(idea: BusinessIdea): string {
  return `${idea.title}: ${idea.description}

**目标市场**: ${idea.targetMarket}
**收入模式**: ${idea.revenueModel}
**核心功能**: ${idea.keyFeatures.join(', ')}

让我们深入探讨这个创意，了解目标用户的真实需求，并思考如何在竞争中脱颖而出。`;
}

/**
 * 从聊天历史合成需求描述
 */
export function synthesizeDemandFromChat(
  chatHistory: ChatMessage[],
  originalIdea: BusinessIdea
): string {
  const insights = extractInsightsFromChat(chatHistory);
  
  return `基于深入对话分析，${originalIdea.targetMarket}面临以下挑战：

**核心痛点**: ${insights.painPoints.join('、')}

**现有解决方案**: ${insights.currentSolutions.join('、')} - 但它们存在${insights.gaps.join('、')}等不足。

**提议解决方案**: ${originalIdea.title}，通过${insights.valueProps.join('、')}来解决这些问题。

**付费意愿**: 目标用户愿意为${originalIdea.revenueModel}付费，因为${insights.paymentJustification}。

**市场机会**: ${insights.marketOpportunity}`;
}

/**
 * 从聊天历史中提取洞察
 */
export function extractInsightsFromChat(chatHistory: ChatMessage[]): ChatInsights {
  // 这里实现简化的NLP提取逻辑
  // 在实际项目中，可以使用更复杂的AI分析
  
  const userMessages = chatHistory.filter(msg => msg.role === 'user');
  const assistantMessages = chatHistory.filter(msg => msg.role === 'assistant');
  
  // 简化的关键词提取
  const allText = userMessages.map(msg => msg.content).join(' ');
  
  return {
    painPoints: extractPainPoints(allText),
    currentSolutions: extractCurrentSolutions(allText),
    gaps: extractGaps(allText),
    valueProps: extractValueProps(allText),
    paymentJustification: extractPaymentJustification(allText),
    marketOpportunity: extractMarketOpportunity(allText),
  };
}

interface ChatInsights {
  painPoints: string[];
  currentSolutions: string[];
  gaps: string[];
  valueProps: string[];
  paymentJustification: string;
  marketOpportunity: string;
}

// 简化的提取函数（实际项目中可以使用AI进行更智能的分析）
function extractPainPoints(text: string): string[] {
  const painKeywords = ['困难', '问题', '挑战', '痛点', '不便', '麻烦'];
  // 简化实现
  return ['时间成本高', '效率低下', '用户体验差'];
}

function extractCurrentSolutions(text: string): string[] {
  return ['传统方法', '现有工具', '人工处理'];
}

function extractGaps(text: string): string[] {
  return ['功能单一', '成本过高', '学习门槛高'];
}

function extractValueProps(text: string): string[] {
  return ['智能化处理', '个性化体验', '成本优化'];
}

function extractPaymentJustification(text: string): string {
  return '能够显著提升效率并节省时间成本';
}

function extractMarketOpportunity(text: string): string {
  return '市场需求旺盛，竞争对手解决方案存在明显不足';
}
```

### 1.4 创建工作流Context

**文件**: `src/contexts/WorkflowContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  WorkflowState,
  WorkflowStep,
  GenerateStepData,
  RefineStepData,
  ValidateStepData,
  BusinessIdea,
  ChatMessage,
  ValidationResult,
} from '@/types';
import {
  createInitialWorkflowState,
  getNextStep,
  getPreviousStep,
  canNavigateToStep,
  canContinue,
  serializeWorkflowState,
  deserializeWorkflowState,
} from '@/lib/workflow/workflowHelpers';

/**
 * 工作流上下文类型
 */
interface WorkflowContextType {
  // 状态
  state: WorkflowState;
  isInWorkflowMode: boolean;
  
  // 导航
  goToStep: (step: WorkflowStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  skipCurrentStep: () => void;
  
  // 权限检查
  canGoToStep: (step: WorkflowStep) => boolean;
  canContinueToNext: () => boolean;
  
  // 数据管理 - Step 1
  updateGenerateData: (data: Partial<GenerateStepData>) => void;
  selectIdea: (idea: BusinessIdea, index: number) => void;
  
  // 数据管理 - Step 2
  updateRefineData: (data: Partial<RefineStepData>) => void;
  saveChat: (messages: ChatMessage[]) => void;
  
  // 数据管理 - Step 3
  updateValidateData: (data: Partial<ValidateStepData>) => void;
  saveValidationResult: (result: ValidationResult) => void;
  
  // 工作流控制
  startNewWorkflow: () => void;
  clearWorkflow: () => void;
  enterWorkflowMode: () => void;
  exitWorkflowMode: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const STORAGE_KEY = 'workflow:current';

/**
 * WorkflowProvider 组件
 */
export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkflowState>(createInitialWorkflowState);
  const [isInWorkflowMode, setIsInWorkflowMode] = useState(false);
  
  // 从 localStorage 加载工作流
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loadedState = deserializeWorkflowState(saved);
      if (loadedState) {
        setState(loadedState);
        console.log('Loaded workflow from localStorage:', loadedState.workflowId);
      }
    }
  }, []);
  
  // 自动保存到 localStorage（防抖 2秒）
  useEffect(() => {
    if (typeof window === 'undefined' || !isInWorkflowMode) return;
    
    const timer = setTimeout(() => {
      const serialized = serializeWorkflowState(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      console.log('Auto-saved workflow:', state.workflowId);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [state, isInWorkflowMode]);
  
  // 导航到指定步骤
  const goToStep = useCallback((targetStep: WorkflowStep) => {
    setState((prev) => {
      if (!canNavigateToStep(targetStep, prev)) {
        console.warn(`Cannot navigate to step: ${targetStep}`);
        return prev;
      }
      
      return {
        ...prev,
        currentStep: targetStep,
        history: [
          ...prev.history,
          {
            step: targetStep,
            timestamp: Date.now(),
            action: 'jump',
          },
        ],
        lastModifiedAt: Date.now(),
      };
    });
  }, []);
  
  // 前进到下一步
  const goToNextStep = useCallback(() => {
    setState((prev) => {
      const nextStep = getNextStep(prev.currentStep);
      if (!nextStep) {
        console.warn('Already at last step');
        return prev;
      }
      
      // 标记当前步骤为已完成
      const newCompletedSteps = new Set(prev.completedSteps);
      newCompletedSteps.add(prev.currentStep);
      
      return {
        ...prev,
        currentStep: nextStep,
        completedSteps: newCompletedSteps,
        history: [
          ...prev.history,
          {
            step: nextStep,
            timestamp: Date.now(),
            action: 'forward',
          },
        ],
        lastModifiedAt: Date.now(),
      };
    });
  }, []);
  
  // 返回上一步
  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      const prevStep = getPreviousStep(prev.currentStep);
      if (!prevStep) {
        console.warn('Already at first step');
        return prev;
      }
      
      return {
        ...prev,
        currentStep: prevStep,
        history: [
          ...prev.history,
          {
            step: prevStep,
            timestamp: Date.now(),
            action: 'back',
          },
        ],
        lastModifiedAt: Date.now(),
      };
    });
  }, []);
  
  // 跳过当前步骤
  const skipCurrentStep = useCallback(() => {
    setState((prev) => {
      const nextStep = getNextStep(prev.currentStep);
      if (!nextStep) return prev;
      
      const newSkippedSteps = new Set(prev.skippedSteps);
      newSkippedSteps.add(prev.currentStep);
      
      return {
        ...prev,
        currentStep: nextStep,
        skippedSteps: newSkippedSteps,
        history: [
          ...prev.history,
          {
            step: nextStep,
            timestamp: Date.now(),
            action: 'skip',
          },
        ],
        lastModifiedAt: Date.now(),
      };
    });
  }, []);
  
  // 更新生成步骤数据
  const updateGenerateData = useCallback((data: Partial<GenerateStepData>) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        generate: {
          ...prev.data.generate,
          ...data,
        } as GenerateStepData,
      },
      lastModifiedAt: Date.now(),
    }));
  }, []);
  
  // 选择创意
  const selectIdea = useCallback((idea: BusinessIdea, index: number) => {
    updateGenerateData({
      selectedIdea: idea,
      selectedIndex: index,
    });
  }, [updateGenerateData]);
  
  // 更新精炼步骤数据
  const updateRefineData = useCallback((data: Partial<RefineStepData>) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        refine: {
          ...prev.data.refine,
          ...data,
        } as RefineStepData,
      },
      lastModifiedAt: Date.now(),
    }));
  }, []);
  
  // 保存聊天历史
  const saveChat = useCallback((messages: ChatMessage[]) => {
    updateRefineData({
      chatHistory: messages,
      completedAt: Date.now(),
    });
  }, [updateRefineData]);
  
  // 更新验证步骤数据
  const updateValidateData = useCallback((data: Partial<ValidateStepData>) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        validate: {
          ...prev.data.validate,
          ...data,
        } as ValidateStepData,
      },
      lastModifiedAt: Date.now(),
    }));
  }, []);
  
  // 保存验证结果
  const saveValidationResult = useCallback((result: ValidationResult) => {
    updateValidateData({
      result,
      validatedAt: Date.now(),
    });
  }, [updateValidateData]);
  
  // 开始新的工作流
  const startNewWorkflow = useCallback(() => {
    const newState = createInitialWorkflowState();
    setState(newState);
    setIsInWorkflowMode(true);
    localStorage.setItem(STORAGE_KEY, serializeWorkflowState(newState));
  }, []);
  
  // 清除工作流
  const clearWorkflow = useCallback(() => {
    setState(createInitialWorkflowState());
    setIsInWorkflowMode(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  // 进入工作流模式
  const enterWorkflowMode = useCallback(() => {
    setIsInWorkflowMode(true);
  }, []);
  
  // 退出工作流模式
  const exitWorkflowMode = useCallback(() => {
    setIsInWorkflowMode(false);
  }, []);
  
  // 权限检查方法
  const canGoToStep = useCallback(
    (targetStep: WorkflowStep) => canNavigateToStep(targetStep, state),
    [state]
  );
  
  const canContinueToNext = useCallback(() => canContinue(state), [state]);
  
  const value: WorkflowContextType = {
    state,
    isInWorkflowMode,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    canGoToStep,
    canContinueToNext,
    updateGenerateData,
    selectIdea,
    updateRefineData,
    saveChat,
    updateValidateData,
    saveValidationResult,
    startNewWorkflow,
    clearWorkflow,
    enterWorkflowMode,
    exitWorkflowMode,
  };
  
  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

/**
 * useWorkflow hook
 */
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
}
```

## 📋 Phase 2: UI组件实施

### 2.1 创建工作流进度组件

**文件**: `src/components/workflow/WorkflowProgress.tsx`

```typescript
'use client';

import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { WorkflowStep, STEP_INFO, WORKFLOW_STEPS } from '@/types/workflow';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { cn } from '@/lib/utils';

export default function WorkflowProgress() {
  const { state, canGoToStep, goToStep } = useWorkflow();
  
  const getStepStatus = (step: WorkflowStep) => {
    if (state.completedSteps.has(step)) return 'completed';
    if (state.skippedSteps.has(step)) return 'skipped';
    if (step === state.currentStep) return 'current';
    return 'upcoming';
  };
  
  const getStepNumber = (step: WorkflowStep) => {
    return WORKFLOW_STEPS.indexOf(step) + 1;
  };
  
  const progress = (state.completedSteps.size / WORKFLOW_STEPS.length) * 100;
  
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              工作流进度
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% 完成
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {WORKFLOW_STEPS.map((step, index) => {
            const stepInfo = STEP_INFO[step];
            const status = getStepStatus(step);
            const canNavigate = canGoToStep(step);
            const stepNumber = getStepNumber(step);
            
            return (
              <div key={step} className="flex items-center">
                {/* Step Circle */}
                <button
                  onClick={() => canNavigate && goToStep(step)}
                  disabled={!canNavigate}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    {
                      // Completed
                      "bg-green-500 border-green-500 text-white": status === 'completed',
                      // Current
                      "bg-blue-500 border-blue-500 text-white": status === 'current',
                      // Skipped
                      "bg-yellow-500 border-yellow-500 text-white": status === 'skipped',
                      // Upcoming
                      "bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600": status === 'upcoming',
                      // Interactive
                      "hover:scale-105 cursor-pointer": canNavigate,
                      "cursor-not-allowed": !canNavigate,
                    }
                  )}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : status === 'skipped' ? (
                    <span className="text-xs font-bold">跳过</span>
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </button>
                
                {/* Step Info */}
                <div className="ml-3 flex-1">
                  <div className={cn(
                    "text-sm font-medium",
                    {
                      "text-green-700 dark:text-green-400": status === 'completed',
                      "text-blue-700 dark:text-blue-400": status === 'current',
                      "text-yellow-700 dark:text-yellow-400": status === 'skipped',
                      "text-gray-500 dark:text-gray-400": status === 'upcoming',
                    }
                  )}>
                    {stepInfo.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stepInfo.description}
                  </div>
                </div>
                
                {/* Arrow */}
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 2.2 创建工作流导航组件

**文件**: `src/components/workflow/WorkflowNavigation.tsx`

```typescript
'use client';

import { ArrowLeft, ArrowRight, SkipForward, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { STEP_INFO } from '@/types/workflow';

export default function WorkflowNavigation() {
  const {
    state,
    goToPreviousStep,
    goToNextStep,
    skipCurrentStep,
    canContinueToNext,
  } = useWorkflow();
  
  const currentStepInfo = STEP_INFO[state.currentStep];
  const canGoBack = state.currentStep !== 'generate';
  const canSkip = state.currentStep !== 'validate'; // 最后一步不能跳过
  const canContinue = canContinueToNext();
  
  // 显示当前选中的创意（如果有）
  const selectedIdea = state.data.generate?.selectedIdea;
  
  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={!canGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </Button>
            
            {/* Selected Idea Badge */}
            {selectedIdea && (
              <Badge variant="secondary" className="max-w-xs truncate">
                已选择: {selectedIdea.title}
              </Badge>
            )}
          </div>
          
          {/* Center: Current Step Info */}
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentStepInfo.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentStepInfo.description}
            </div>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Skip Button */}
            {canSkip && (
              <Button
                variant="ghost"
                onClick={skipCurrentStep}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                跳过此步
              </Button>
            )}
            
            {/* Save Button */}
            <Button
              variant="outline"
              onClick={() => {
                // 手动保存逻辑
                console.log('Manual save triggered');
              }}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </Button>
            
            {/* Continue Button */}
            <Button
              onClick={goToNextStep}
              disabled={!canContinue}
              className="flex items-center gap-2"
            >
              继续
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 创建工作流主页面

**文件**: `src/app/workflow/page.tsx`

```typescript
import { Metadata } from 'next';
import WorkflowContainer from './components/WorkflowContainer';

export const metadata: Metadata = {
  title: '智能工作流 - AI Business Idea Generator',
  description: '从创意生成到需求验证的完整引导式流程',
};

export default function WorkflowPage() {
  return <WorkflowContainer />;
}
```

**文件**: `src/app/workflow/components/WorkflowContainer.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import WorkflowProgress from '@/components/workflow/WorkflowProgress';
import WorkflowNavigation from '@/components/workflow/WorkflowNavigation';
import GenerateStep from './GenerateStep';
import RefineStep from './RefineStep';
import ValidateStep from './ValidateStep';

export default function WorkflowContainer() {
  const { state, enterWorkflowMode } = useWorkflow();
  
  useEffect(() => {
    // 进入工作流模式
    enterWorkflowMode();
    
    return () => {
      // 可选：退出时清理
    };
  }, [enterWorkflowMode]);
  
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'generate':
        return <GenerateStep />;
      case 'refine':
        return <RefineStep />;
      case 'validate':
        return <ValidateStep />;
      default:
        return <div>未知步骤</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Progress Header */}
      <WorkflowProgress />
      
      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {renderCurrentStep()}
        </div>
      </div>
      
      {/* Navigation Footer */}
      <WorkflowNavigation />
    </div>
  );
}
```

这个实施指南提供了详细的代码示例和实现步骤。每个组件都有明确的职责分工，确保系统的可维护性和可扩展性。接下来可以按照这个指南逐步实施各个阶段的功能。