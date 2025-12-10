'use client';

import { useEffect } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { synthesizeTopicFromIdea } from '@/lib/workflow/dataTransformers';
import IdeaGenerator from '@/components/IdeaGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BusinessIdea } from '@/types';

export default function GenerateStep() {
  const { state, selectIdea, updateRefineData, goToNextStep } = useWorkflow();
  
  const selectedIdea = state.data.generate?.selectedIdea;
  const ideas = state.data.generate?.ideas || [];
  
  // 当选择创意时，自动生成精炼话题
  useEffect(() => {
    if (selectedIdea) {
      const topic = synthesizeTopicFromIdea(selectedIdea);
      updateRefineData({
        originalTopic: topic,
        mode: 'refine',
        chatHistory: [],
        startedAt: Date.now(),
      });
    }
  }, [selectedIdea, updateRefineData]);
  
  const handleIdeaSelect = (idea: BusinessIdea, index: number) => {
    selectIdea(idea, index);
  };
  
  const handleContinue = () => {
    if (selectedIdea) {
      goToNextStep();
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 步骤介绍 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Sparkles className="w-5 h-5" />
            第一步：生成商业创意
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            使用AI生成多个商业创意，选择最感兴趣的一个进入下一步精炼过程
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* 创意生成器 */}
      <IdeaGenerator 
        workflowMode={true}
        onIdeaSelected={handleIdeaSelect}
      />
      
      {/* 选中的创意预览 */}
      {selectedIdea && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              ✅ 已选择创意
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              这个创意将在下一步中进行深入精炼
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  {selectedIdea.title}
                </h3>
                <p className="text-green-800 dark:text-green-200 mb-4">
                  {selectedIdea.description}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">目标市场</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{selectedIdea.targetMarket}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">收入模式</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{selectedIdea.revenueModel}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">核心功能</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIdea.keyFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-green-200 dark:border-green-800">
                <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700">
                  继续精炼这个创意
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 使用提示 */}
      {!selectedIdea && ideas.length > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                💡
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  选择一个创意继续
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  点击任意创意卡片来选择它，然后我们将进入苏格拉底式对话来深化这个想法。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}