'use client';

import { useEffect } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import WorkflowProgress from '@/components/workflow/WorkflowProgress';
import WorkflowNavigation from '@/components/workflow/WorkflowNavigation';
import GenerateStep from './GenerateStep';
import RefineStep from './RefineStep';
import ValidateStep from './ValidateStep';

export default function WorkflowContainer() {
  const { state, enterWorkflowMode, resetToFirstStep } = useWorkflow();
  
  useEffect(() => {
    // 进入工作流模式并确保从第一步开始
    enterWorkflowMode();
    resetToFirstStep();
    
    return () => {
      // 可选：退出时清理
    };
  }, [enterWorkflowMode, resetToFirstStep]);
  
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