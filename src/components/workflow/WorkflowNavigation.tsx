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