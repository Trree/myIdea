'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, AlertCircle, Download, Copy, CheckCircle } from 'lucide-react';
import IdeaCard from './IdeaCard';
import InputPreview from './InputPreview';
import type {
  GenerationType,
  BusinessIdea,
  GenerateIdeaRequest,
} from '@/types';
import { GENERATION_TYPES, SUPPORTED_MODELS } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { exportIdeasToMarkdown, downloadTextFile, copyToClipboard } from '@/lib/utils/export';
import { IdeaGeneratorSkeleton } from './ui/skeleton';

interface IdeaGeneratorProps {
  workflowMode?: boolean;
  onIdeaSelected?: (idea: BusinessIdea, index: number) => void;
}

export default function IdeaGenerator({
  workflowMode = false,
  onIdeaSelected
}: IdeaGeneratorProps = {}) {
  const { selectedModel, setSelectedModel, addToHistory } = useApp();
  const [interests, setInterests] = useState('');
  const [generationType, setGenerationType] =
    useState<GenerationType>('trending');
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setIdeas([]);

    try {
      const request: GenerateIdeaRequest = {
        interests,
        generationType,
        model: selectedModel,
        stream: false,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败');
      }

      const data = await response.json();
      setIdeas(data.ideas || []);

      // Add to history
      if (data.ideas && data.ideas.length > 0) {
        addToHistory({
          interests,
          generationType,
          model: selectedModel,
          ideas: data.ideas,
        });
      }
    } catch (err) {
      console.error('生成错误:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const markdown = exportIdeasToMarkdown(ideas);
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const markdown = exportIdeasToMarkdown(ideas);
    const timestamp = new Date().getTime();
    downloadTextFile(markdown, `business-ideas-${timestamp}.md`);
  };

  return (
    <section id="generator" className={workflowMode ? "py-0" : "py-16 sm:py-24 bg-gray-50 dark:bg-gray-900"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 简化的表单卡片 */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 工作流模式下隐藏标题 */}
              {!workflowMode && (
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">
                    <Sparkles className="inline-block h-8 w-8 mr-2 text-yellow-500" />
                    商业创意生成器
                  </h2>
                  <p className="text-muted-foreground">
                    输入您的兴趣、技能或行业，选择生成类型，让 AI 为您创造独特的商业创意
                  </p>
                </div>
              )}

              {/* 简化的兴趣输入 */}
              <div className="space-y-3">
                <Label htmlFor="interests" className="text-base font-semibold">
                  描述您的兴趣、技能或想要探索的领域 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="interests"
                  placeholder="例如：人工智能教育、可持续农业、健康科技、在线学习平台..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  required
                  maxLength={500}
                  disabled={isLoading}
                  className="text-base py-3 px-4 h-auto"
                />
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>
                    <strong>提示：</strong>越具体越好！可以结合多个领域，比如"AI + 教育"或"环保 + 科技"
                  </span>
                </div>
              </div>

              {/* 简化的创意类型选择 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">选择创意方向</Label>
                <RadioGroup
                  value={generationType}
                  onValueChange={(value) =>
                    setGenerationType(value as GenerationType)
                  }
                  disabled={isLoading}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {Object.entries(GENERATION_TYPES).map(([key, config]) => (
                    <div key={key} className="relative">
                      <RadioGroupItem
                        value={key}
                        id={key}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={key}
                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <span className="text-2xl">{config.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{config.label}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {config.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* 简化的模型选择 - 只显示推荐模型 */}
              <div className="space-y-3">
                <Label htmlFor="model" className="text-base font-semibold">AI 模型</Label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={isLoading}
                >
                  <SelectTrigger id="model" className="h-12">
                    <SelectValue placeholder="选择AI模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 只显示推荐模型，减少选择复杂度 */}
                    {SUPPORTED_MODELS.recommended.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.label}</span>
                          {model.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {model.badge}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    
                    {/* 高级选项折叠 */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-2">
                      更多选项
                    </div>
                    {SUPPORTED_MODELS.international.slice(0, 2).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <span className="text-xs text-muted-foreground">
                            · {model.provider}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  推荐使用 DeepSeek 或 Qwen，在中文场景下表现优秀
                </p>
              </div>

              {/* 优化的提交按钮 */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-semibold py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || !interests.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI正在为您生成创意...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    生成我的商业创意
                  </>
                )}
              </Button>
              
              {/* 生成提示 */}
              {!isLoading && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    通常需要 5-15 秒生成 3-5 个高质量创意
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 实时输入预览和反馈 */}
        {interests.trim() && !isLoading && ideas.length === 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <InputPreview
              interests={interests}
              generationType={generationType}
            />
          </div>
        )}

        {/* 优化的错误处理 */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      创意生成遇到问题
                    </h3>
                    <p className="text-red-800 dark:text-red-200 mb-3">
                      {error}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        💡 <strong>解决建议：</strong>
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                        <li>• 检查网络连接是否正常</li>
                        <li>• 确认已正确配置 API Key</li>
                        <li>• 尝试简化输入内容</li>
                        <li>• 稍后重试或选择其他模型</li>
                      </ul>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => setError(null)}
                    >
                      重新尝试
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 优化的结果展示 */}
        {ideas.length > 0 && (
          <div className="max-w-7xl mx-auto">
            {/* 成功提示和操作区 */}
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-1">
                        🎉 成功生成 {ideas.length} 个创意！
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        {workflowMode
                          ? "选择一个最感兴趣的创意，开始深入探索"
                          : "探索这些创新想法，找到最适合您的商业机会"
                        }
                      </p>
                    </div>
                  </div>

                  {/* 导出按钮 - 非工作流模式显示 */}
                  {!workflowMode && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        disabled={copySuccess}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        {copySuccess ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            复制全部
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadMarkdown}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 创意卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ideas.map((idea, index) => (
                <IdeaCard
                  key={index}
                  idea={idea}
                  index={index}
                  workflowMode={workflowMode}
                  onSelect={onIdeaSelected ? () => onIdeaSelected(idea, index) : undefined}
                />
              ))}
            </div>

            {/* 工作流模式的选择提示 */}
            {workflowMode && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      选择您最感兴趣的创意
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                      点击任意创意卡片来选择它，然后进入下一步进行深入探索和优化
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>选择后将自动进入精炼阶段</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 非工作流模式的更多操作 */}
            {!workflowMode && (
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setIdeas([]);
                    window.scrollTo({
                      top: document.getElementById('generator')?.offsetTop || 0,
                      behavior: 'smooth',
                    });
                  }}
                  className="px-8"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成更多创意
                </Button>
                <p className="text-sm text-muted-foreground">
                  不满意这些创意？调整输入内容重新生成
                </p>
              </div>
            )}
          </div>
        )}

        {/* 优化的加载状态 */}
        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      AI 正在为您生成创意...
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                      基于您的输入，我们正在创造独特的商业机会
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span>预计需要 5-15 秒</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 加载时的骨架屏 */}
            <div className="mt-8">
              <IdeaGeneratorSkeleton />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
