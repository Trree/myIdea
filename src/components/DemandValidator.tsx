'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, TrendingUp, Users, DollarSign, Search, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ValidationResult {
  isRealDemand: boolean;
  score: number;
  frequency: 'high' | 'medium' | 'low';
  painPoint: 'strong' | 'medium' | 'weak';
  paymentWillingness: 'high' | 'medium' | 'low';
  reasoning: string;
  actionPlan: string[];
}

interface DemandValidatorProps {
  prePopulatedDemand?: string;
  onValidationComplete?: (result: ValidationResult) => void;
}

export default function DemandValidator({ prePopulatedDemand, onValidationComplete }: DemandValidatorProps) {
  const [demand, setDemand] = useState(prePopulatedDemand || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!demand.trim()) {
      setError('请输入需求描述');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/validate-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demand }),
      });

      if (!response.ok) {
        throw new Error('验证失败，请重试');
      }

      const data = await response.json();
      setResult(data);
      onValidationComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证过程出错，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 当预填充需求改变时更新demand
  useEffect(() => {
    if (prePopulatedDemand) {
      setDemand(prePopulatedDemand);
    }
  }, [prePopulatedDemand]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLevelBadge = (level: 'high' | 'medium' | 'low' | 'strong' | 'medium' | 'weak') => {
    const colors = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      strong: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      weak: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    const labels = {
      high: '高',
      strong: '强',
      medium: '中',
      low: '低',
      weak: '弱',
    };
    return <Badge className={colors[level]}>{labels[level]}</Badge>;
  };

  // 生成 Google Trends 搜索 URL
  const getTrendsUrl = () => {
    const query = encodeURIComponent(demand);
    return `https://trends.google.com/trends/explore?q=${query}&geo=CN`;
  };

  // 生成 Reddit 搜索 URL
  const getRedditUrl = () => {
    const query = encodeURIComponent(demand);
    return `https://www.reddit.com/search/?q=${query}`;
  };

  // 生成 X (Twitter) 搜索 URL
  const getTwitterUrl = () => {
    const query = encodeURIComponent(demand);
    return `https://twitter.com/search?q=${query}&f=live`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          需求验证工具
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          科学判断需求真伪，避免伪需求陷阱。基于高频度、痛点强度和付费意愿三维度评估。
        </p>
      </div>

      {/* 真假需求判断标准 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            真假需求判断标准
          </CardTitle>
          <CardDescription>
            通过三个核心维度科学评估需求价值
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 真需求 */}
            <div className="p-4 border-2 border-green-500 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">真需求</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">高频</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      用户经常遇到这个问题，持续且重复发生
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">痛点</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      问题带来明显困扰，影响工作/生活效率
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">付费意愿</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      用户愿意为解决方案支付合理费用
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 假需求 */}
            <div className="p-4 border-2 border-red-500 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">假需求</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">偶尔</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      只是偶尔遇到，不是日常高频问题
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">兴趣</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      只是好奇或觉得有趣，缺乏真正痛点
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">无付费意愿</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      希望免费或价格极低，不愿为价值付费
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 需求输入表单 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>输入需求描述</CardTitle>
          <CardDescription>
            请详细描述您要验证的需求，包括目标用户、问题场景等信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="demand">需求描述</Label>
              <Input
                id="demand"
                placeholder="例如：为远程团队提供实时协作白板工具"
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                className="mt-2"
                disabled={!!prePopulatedDemand}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button
              onClick={handleValidate}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI 分析中...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  开始验证
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 验证结果 */}
      {result && (
        <div className="space-y-6">
          {/* 综合评分 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.isRealDemand ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                验证结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">综合评分</span>
                    <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}分
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        result.score >= 70
                          ? 'bg-green-600'
                          : result.score >= 40
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">频率</p>
                    {getLevelBadge(result.frequency)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">痛点</p>
                    {getLevelBadge(result.painPoint)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">付费意愿</p>
                    {getLevelBadge(result.paymentWillingness)}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">分析说明</h4>
                  <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{result.reasoning}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 趋势和社区观察 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                趋势与社区观察
              </CardTitle>
              <CardDescription>
                通过公开数据验证需求热度和讨论活跃度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Google Trends */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Google Trends 搜索趋势
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    查看该需求的全球搜索趋势，了解关注度变化
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href={getTrendsUrl()} target="_blank" rel="noopener noreferrer">
                      在 Google Trends 查看
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {/* Reddit */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Reddit 社区讨论
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    查看 Reddit 上相关讨论，了解用户真实痛点和需求
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href={getRedditUrl()} target="_blank" rel="noopener noreferrer">
                      在 Reddit 搜索
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {/* X (Twitter) */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    X (Twitter) 实时讨论
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    查看 X 上的实时讨论，了解当前热度和用户反馈
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href={getTwitterUrl()} target="_blank" rel="noopener noreferrer">
                      在 X 搜索
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 实操清单 */}
          <Card>
            <CardHeader>
              <CardTitle>实操清单</CardTitle>
              <CardDescription>
                根据验证结果，这里是您接下来应该采取的具体行动
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {result.actionPlan.map((action, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-sm pt-0.5">{action}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 使用提示 */}
      {!result && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              💡 使用提示
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• 需求描述越详细，AI 分析越准确</p>
            <p>• 建议包含：目标用户、使用场景、要解决的问题</p>
            <p>• 验证后务必查看 Google Trends 和社区讨论数据</p>
            <p>• 关注社区讨论的频率和情感倾向</p>
            <p>• 真需求通常会有大量用户主动寻求解决方案</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
