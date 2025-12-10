'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  WorkflowState,
  WorkflowStep,
  GenerateStepData,
  RefineStepData,
  ValidateStepData,
} from '@/types/workflow';
import {
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
    setState((prev: WorkflowState) => {
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
    setState((prev: WorkflowState) => {
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
    setState((prev: WorkflowState) => {
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
    setState((prev: WorkflowState) => {
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
    setState((prev: WorkflowState) => ({
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
    setState((prev: WorkflowState) => ({
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
    setState((prev: WorkflowState) => ({
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
