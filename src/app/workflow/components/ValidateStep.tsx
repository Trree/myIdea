'use client';

import { useState } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import DemandValidator from '@/components/DemandValidator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Edit3, Download } from 'lucide-react';
import { ValidationResult } from '@/types';

export default function ValidateStep() {
  const { state, updateValidateData, saveValidationResult } = useWorkflow();
  
  const selectedIdea = state.data.generate?.selectedIdea;
  const chatHistory = state.data.refine?.chatHistory || [];
  const validateData = state.data.validate;
  const originalDemand = validateData?.originalDemand || '';
  const editedDemand = validateData?.editedDemand;
  const validationResult = validateData?.result;
  
  const [isEditingDemand, setIsEditingDemand] = useState(false);
  const [demandText, setDemandText] = useState(editedDemand || originalDemand);
  
  const handleDemandSave = () => {
    updateValidateData({
      editedDemand: demandText,
    });
    setIsEditingDemand(false);
  };
  
  const handleValidationComplete = (result: ValidationResult) => {
    saveValidationResult(result);
  };
  
  const handleExportWorkflow = () => {
    // 导出完整工作流为Markdown
    const markdown = generateWorkflowMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${selectedIdea?.title || 'untitled'}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const generateWorkflowMarkdown = () => {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    return `# 商业创意工作流报告

**生成时间**: ${timestamp}

## 第一步：创意生成

### 选中的创意
**标题**: ${selectedIdea?.title || '未选择'}
**描述**: ${selectedIdea?.description || ''}
**目标市场**: ${selectedIdea?.targetMarket || ''}
**收入模式**: ${selectedIdea?.revenueModel || ''}
**核心功能**: ${selectedIdea?.keyFeatures?.join(', ') || ''}

## 第二步：创意精炼

### 对话轮数
共进行了 ${chatHistory.length} 轮苏格拉底式对话

### 对话记录
${chatHistory.map((msg, index) => 
  `**${msg.role === 'user' ? '用户' : 'AI'}**: ${msg.content}`
).join('\n\n')}

## 第三步：需求验证

### 需求描述
${editedDemand || originalDemand || ''}

### 验证结果
${validationResult ? `
**综合评分**: ${validationResult.score}/100
**是否真需求**: ${validationResult.isRealDemand ? '是' : '否'}
**频率**: ${validationResult.frequency}
**痛点强度**: ${validationResult.painPoint}
**付费意愿**: ${validationResult.paymentWillingness}

**分析说明**:
${validationResult.reasoning}

**行动计划**:
${validationResult.actionPlan.map((action, index) => `${index + 1}. ${action}`).join('\n')}
` : '尚未完成验证'}

---
*本报告由AI商业创意生成器工作流系统生成*
`;
  };
  
  const currentDemand = editedDemand || originalDemand;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 步骤介绍 */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <CheckCircle className="w-5 h-5" />
            第三步：验证需求
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            科学评估需求的真实性和市场价值，避免伪需求陷阱
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* 工作流进度回顾 */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            📊 工作流进度回顾
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">选中创意</h4>
              <p className="text-blue-700 dark:text-blue-300">{selectedIdea?.title || '未选择'}</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">对话轮数</h4>
              <p className="text-blue-700 dark:text-blue-300">{chatHistory.length} 轮</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 需求描述编辑 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              需求描述
            </span>
            {!isEditingDemand && currentDemand && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDemand(true)}
              >
                编辑需求
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {isEditingDemand ? '编辑需求描述以获得更准确的验证结果' : '基于对话历史自动合成的需求描述'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingDemand ? (
            <div className="space-y-4">
              <Textarea
                value={demandText}
                onChange={(e) => setDemandText(e.target.value)}
                rows={8}
                className="w-full"
                placeholder="输入需求描述..."
              />
              <div className="flex gap-2">
                <Button onClick={handleDemandSave}>
                  保存需求
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDemandText(editedDemand || originalDemand);
                    setIsEditingDemand(false);
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : currentDemand ? (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{currentDemand}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无需求描述</p>
              <p className="text-sm mt-2">请先完成前面的步骤或手动输入需求描述</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 需求验证器 */}
      {currentDemand && !isEditingDemand && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 需求验证</CardTitle>
            <CardDescription>
              使用AI分析需求的真实性和市场价值
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemandValidator
              prePopulatedDemand={currentDemand}
              onValidationComplete={handleValidationComplete}
            />
          </CardContent>
        </Card>
      )}
      
      {/* 工作流完成 */}
      {validationResult && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              🎉 工作流已完成
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              恭喜！你已经完成了从创意生成到需求验证的完整流程
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validationResult.score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">综合评分</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{chatHistory.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">对话轮数</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {validationResult.isRealDemand ? '真需求' : '伪需求'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">需求判断</div>
                </div>
              </div>
              
              <Button onClick={handleExportWorkflow} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                导出完整工作流报告
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 使用提示 */}
      {!validationResult && currentDemand && !isEditingDemand && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                💡
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  开始验证
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  点击"开始验证"按钮来分析需求的真实性。验证完成后可以导出完整的工作流报告。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}