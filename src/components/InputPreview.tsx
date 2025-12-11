'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Lightbulb, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

interface InputPreviewProps {
  interests: string;
  generationType: string;
}

interface PreviewInsight {
  type: 'suggestion' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  message: string;
}

export default function InputPreview({ interests, generationType }: InputPreviewProps) {
  const [insights, setInsights] = useState<PreviewInsight[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (!interests.trim()) {
      setInsights([]);
      setKeywords([]);
      return;
    }

    // 提取关键词
    const extractedKeywords = interests
      .split(/[,，、\s]+/)
      .filter(word => word.length > 1)
      .slice(0, 5);
    setKeywords(extractedKeywords);

    // 生成智能提示
    const newInsights: PreviewInsight[] = [];

    // 检查输入长度
    if (interests.length < 10) {
      newInsights.push({
        type: 'suggestion',
        icon: <Lightbulb className="w-4 h-4" />,
        title: '建议补充更多信息',
        message: '添加更多具体的技能、兴趣或行业信息，可以获得更精准的创意'
      });
    }

    // 检查是否包含技术关键词
    const techKeywords = ['AI', '人工智能', '机器学习', '区块链', '物联网', 'IoT', '大数据', '云计算'];
    const hasTech = techKeywords.some(keyword => 
      interests.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasTech) {
      newInsights.push({
        type: 'info',
        icon: <TrendingUp className="w-4 h-4" />,
        title: '科技领域机会',
        message: '您关注的技术领域正在快速发展，适合创新型商业模式'
      });
    }

    // 检查是否包含多个领域
    if (extractedKeywords.length >= 3) {
      newInsights.push({
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: '跨领域创新',
        message: '多领域结合往往能产生独特的商业机会'
      });
    }

    // 根据生成类型给出建议
    if (generationType === 'trending') {
      newInsights.push({
        type: 'info',
        icon: <Users className="w-4 h-4" />,
        title: '趋势导向',
        message: '将为您生成符合当前市场趋势的热门创意'
      });
    } else if (generationType === 'innovative') {
      newInsights.push({
        type: 'info',
        icon: <Lightbulb className="w-4 h-4" />,
        title: '创新导向',
        message: '将为您生成具有突破性和创新性的商业想法'
      });
    }

    // 检查是否过于宽泛
    const broadTerms = ['商业', '赚钱', '创业', '生意'];
    const hasBroadTerms = broadTerms.some(term => 
      interests.toLowerCase().includes(term)
    );
    
    if (hasBroadTerms && extractedKeywords.length < 3) {
      newInsights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: '建议更具体',
        message: '尝试描述具体的技能、兴趣或目标行业，避免过于宽泛的词汇'
      });
    }

    setInsights(newInsights.slice(0, 3)); // 最多显示3个提示
  }, [interests, generationType]);

  if (!interests.trim()) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-4 pb-4">
        <div className="space-y-4">
          {/* 关键词提取 */}
          {keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                识别的关键领域
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 智能提示 */}
          {insights.length > 0 && (
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    insight.type === 'suggestion' 
                      ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800' 
                      : insight.type === 'warning'
                      ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'
                      : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className={`p-1 rounded ${
                    insight.type === 'suggestion' 
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' 
                      : insight.type === 'warning'
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                      : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h5 className={`text-sm font-medium mb-1 ${
                      insight.type === 'suggestion' 
                        ? 'text-amber-900 dark:text-amber-100' 
                        : insight.type === 'warning'
                        ? 'text-orange-900 dark:text-orange-100'
                        : 'text-green-900 dark:text-green-100'
                    }`}>
                      {insight.title}
                    </h5>
                    <p className={`text-xs ${
                      insight.type === 'suggestion' 
                        ? 'text-amber-700 dark:text-amber-300' 
                        : insight.type === 'warning'
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 预期结果提示 */}
          <div className="text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 基于当前输入，预计生成 3-5 个高质量创意
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}