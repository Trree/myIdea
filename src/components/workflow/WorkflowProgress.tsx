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