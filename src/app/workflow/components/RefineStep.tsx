'use client';

import { useEffect, useState } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { synthesizeDemandFromChat } from '@/lib/workflow/dataTransformers';
import SocraticChat from '@/components/SocraticChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, Edit3, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/types';

export default function RefineStep() {
  const { state, updateRefineData, updateValidateData, goToNextStep } = useWorkflow();
  
  const selectedIdea = state.data.generate?.selectedIdea;
  const refineData = state.data.refine;
  const originalTopic = refineData?.originalTopic || '';
  const editedTopic = refineData?.editedTopic;
  const chatHistory = refineData?.chatHistory || [];
  
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicText, setTopicText] = useState(editedTopic || originalTopic);
  
  // 当聊天完成时，自动生成需求描述
  useEffect(() => {
    if (chatHistory.length > 0 && selectedIdea) {
      const demand = synthesizeDemandFromChat(chatHistory, selectedIdea);
      updateValidateData({
        originalDemand: demand,
      });
    }
  }, [chatHistory, selectedIdea, updateValidateData]);
  
  const handleTopicSave = () => {
    updateRefineData({
      editedTopic: topicText,
    });
    setIsEditingTopic(false);
  };
  
  const handleChatComplete = (messages: ChatMessage[]) => {
    updateRefineData({
      chatHistory: messages,
      completedAt: Date.now(),
    });
  };
  
  const handleContinue = () => {
    if (chatHistory.length > 0) {
      goToNextStep();
    }
  };
  
  const currentTopic = editedTopic || originalTopic;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 步骤介绍 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <Target className="w-5 h-5" />
            第二步：精炼创意
          </CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            通过苏格拉底式对话深入探讨你的创意，发现潜在问题和改进机会
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* 选中创意回顾 */}
      {selectedIdea && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100 text-lg">
              📋 当前创意：{selectedIdea.title}
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              {selectedIdea.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {/* 话题编辑区 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              对话话题
            </span>
            {!isEditingTopic && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingTopic(true)}
              >
                编辑话题
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {isEditingTopic ? '编辑对话话题以引导讨论方向' : '基于你的创意自动生成的对话话题'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingTopic ? (
            <div className="space-y-4">
              <Textarea
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                rows={6}
                className="w-full"
                placeholder="输入对话话题..."
              />
              <div className="flex gap-2">
                <Button onClick={handleTopicSave}>
                  保存话题
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTopicText(editedTopic || originalTopic);
                    setIsEditingTopic(false);
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{currentTopic}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 苏格拉底式对话 */}
      {currentTopic && !isEditingTopic && (
        <Card>
          <CardHeader>
            <CardTitle>💬 苏格拉底式对话</CardTitle>
            <CardDescription>
              通过深入对话来完善你的创意，发现新的洞察
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocraticChat
              prePopulatedTopic={currentTopic}
              defaultMode="refine"
              onChatComplete={handleChatComplete}
            />
          </CardContent>
        </Card>
      )}
      
      {/* 对话完成提示 */}
      {chatHistory.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              ✅ 对话已完成
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              已进行 {chatHistory.length} 轮对话，可以继续到需求验证步骤
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700">
              继续到需求验证
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* 使用提示 */}
      {!chatHistory.length && currentTopic && !isEditingTopic && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                💡
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  开始对话
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  AI将通过提问帮助你深入思考创意的各个方面。建议进行5-10轮对话以获得充分的洞察。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}