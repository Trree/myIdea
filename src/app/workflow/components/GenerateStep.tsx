'use client';

import { useEffect, useState } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { synthesizeTopicFromIdea } from '@/lib/workflow/dataTransformers';
import IdeaGenerator from '@/components/IdeaGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { BusinessIdea } from '@/types';

export default function GenerateStep() {
  const { state, selectIdea, updateRefineData, goToNextStep } = useWorkflow();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const selectedIdea = state.data.generate?.selectedIdea;
  const ideas = state.data.generate?.ideas || [];
  
  // 当选择创意时，自动生成精炼话题并显示成功动画
  useEffect(() => {
    if (selectedIdea) {
      const topic = synthesizeTopicFromIdea(selectedIdea);
      updateRefineData({
        originalTopic: topic,
        mode: 'refine',
        chatHistory: [],
        startedAt: Date.now(),
      });
      
      // 显示成功动画
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => setShowSuccessAnimation(false), 2000);
      return () => clearTimeout(timer);
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 简化的步骤介绍 */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
          <Sparkles className="w-7 h-7" />
          生成您的商业创意
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          让AI为您创造独特的商业机会，选择最感兴趣的一个开始您的创业之旅
        </p>
        
        {/* 进度指示器 */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">第1步：生成创意</span>
          </div>
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-500">第2步：精炼创意</span>
          </div>
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <CheckCircle className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-500">第3步：验证需求</span>
          </div>
        </div>
      </div>
      
      {/* 创意生成器 */}
      <IdeaGenerator
        workflowMode={true}
        onIdeaSelected={handleIdeaSelect}
      />
      
      {/* 优化的选中创意预览 */}
      {selectedIdea && (
        <Card className={`border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 transition-all duration-500 ${
          showSuccessAnimation ? 'scale-105 shadow-lg' : 'scale-100'
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <div className={`transition-all duration-500 ${showSuccessAnimation ? 'animate-bounce' : ''}`}>
                ✅
              </div>
              创意已选择
              {showSuccessAnimation && (
                <div className="ml-auto">
                  <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              太好了！这个创意将在下一步中进行深入精炼和优化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 创意标题和描述 */}
              <div className="p-4 bg-white dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3 flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 mt-1 text-green-600" />
                  {selectedIdea.title}
                </h3>
                <p className="text-green-800 dark:text-green-200 leading-relaxed">
                  {selectedIdea.description}
                </p>
              </div>
              
              {/* 关键信息网格 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    🎯 目标市场
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{selectedIdea.targetMarket}</p>
                </div>
                <div className="p-3 bg-white dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    💰 收入模式
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{selectedIdea.revenueModel}</p>
                </div>
              </div>
              
              {/* 核心功能标签 */}
              <div className="p-3 bg-white dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  ⚡ 核心功能
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIdea.keyFeatures.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* 增强的继续按钮区域 */}
              <div className="pt-6 border-t border-green-200 dark:border-green-800 space-y-4">
                {/* 下一步预览 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        第2步：精炼创意
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        通过苏格拉底式AI对话，深入探索您的创意，发现更多商业机会和实施细节
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 主要继续按钮 */}
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:via-green-800 hover:to-emerald-800 text-white font-bold py-4 text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <Target className="w-6 h-6" />
                    <span>开始精炼这个创意</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Button>
                
                {/* 激励性描述 */}
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    🚀 让AI帮您发现创意的无限潜力
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    平均用时：5-10分钟 • 个性化对话 • 深度洞察
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 优化的使用提示 */}
      {!selectedIdea && ideas.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-lg">
                  选择一个创意开始您的创业之旅
                </h4>
                <p className="text-amber-700 dark:text-amber-300 mb-3">
                  点击任意创意卡片来选择它。选择后，我们将通过智能对话帮助您深化和完善这个想法。
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>提示：选择最让您兴奋和感兴趣的创意</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 空状态提示 */}
      {!selectedIdea && ideas.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              准备生成您的第一个创意
            </h3>
            <p className="text-blue-700 dark:text-blue-300 max-w-md mx-auto">
              填写上方表单，描述您的兴趣和技能，让AI为您创造独特的商业机会
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}