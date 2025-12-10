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
import type {
  GenerationType,
  BusinessIdea,
  GenerateIdeaRequest,
} from '@/types';
import { GENERATION_TYPES, SUPPORTED_MODELS } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { exportIdeasToMarkdown, downloadTextFile, copyToClipboard } from '@/lib/utils/export';
import { IdeaGeneratorSkeleton } from './ui/skeleton';

export default function IdeaGenerator() {
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
    <section id="generator" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Form Card */}
        <Card className="max-w-4xl mx-auto mb-12">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">
                  <Sparkles className="inline-block h-8 w-8 mr-2 text-yellow-500" />
                  商业创意生成器
                </h2>
                <p className="text-muted-foreground">
                  输入您的兴趣、技能或行业，选择生成类型，让 AI 为您创造独特的商业创意
                </p>
              </div>

              {/* Interests Input */}
              <div className="space-y-2">
                <Label htmlFor="interests">
                  您的兴趣、技能或行业 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="interests"
                  placeholder="例如：人工智能和教育、可持续农业、健康科技..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  required
                  maxLength={500}
                  disabled={isLoading}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  提示：越具体越好！可以包含多个关键词。
                </p>
              </div>

              {/* Generation Type */}
              <div className="space-y-3">
                <Label>选择创意类型</Label>
                <RadioGroup
                  value={generationType}
                  onValueChange={(value) =>
                    setGenerationType(value as GenerationType)
                  }
                  disabled={isLoading}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
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
                        className="flex flex-col items-start gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{config.icon}</span>
                          <span className="font-semibold">{config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {config.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model">选择 AI 模型</Label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={isLoading}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Recommended Models */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      推荐模型
                    </div>
                    {SUPPORTED_MODELS.recommended.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          {model.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {model.badge}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            · {model.provider}
                          </span>
                        </div>
                      </SelectItem>
                    ))}

                    {/* International Models */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      国际模型
                    </div>
                    {SUPPORTED_MODELS.international.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <span className="text-xs text-muted-foreground">
                            · {model.provider}
                          </span>
                        </div>
                      </SelectItem>
                    ))}

                    {/* Other Models */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      其他模型
                    </div>
                    {SUPPORTED_MODELS.other.map((model) => (
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
                <p className="text-xs text-muted-foreground">
                  💡 提示：DeepSeek 和 Qwen 在中文场景下表现优秀且价格实惠
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={isLoading || !interests.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    正在生成创意...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    生成商业创意
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                生成失败
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                {error}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                提示：请确保已正确配置相应模型的 API Key
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {ideas.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  🎉 为您生成了 {ideas.length} 个商业创意
                </h3>
                <p className="text-muted-foreground">
                  探索这些创新的商业想法，找到最适合您的那一个
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={copySuccess}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      复制
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea, index) => (
                <IdeaCard key={index} idea={idea} index={index} />
              ))}
            </div>

            {/* Generate More Button */}
            <div className="text-center mt-12">
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
              >
                生成更多创意
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <IdeaGeneratorSkeleton />}
      </div>
    </section>
  );
}
