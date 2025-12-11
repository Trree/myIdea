'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Target, DollarSign, Star, TrendingUp, Users, Heart, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import type { BusinessIdea } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';

interface IdeaCardProps {
  idea: BusinessIdea;
  index: number;
  workflowMode?: boolean;
  onSelect?: () => void;
}

export default function IdeaCard({ idea, index, workflowMode = false, onSelect }: IdeaCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const favorited = isFavorite(idea.title);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    if (favorited) {
      removeFavorite(idea.title);
    } else {
      addFavorite(idea);
    }
  };

  const handleCardClick = () => {
    if (workflowMode && onSelect) {
      onSelect();
    }
  };

  return (
    <Card
      className={`h-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
        workflowMode
          ? 'cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:scale-[1.02] group'
          : 'hover:shadow-lg'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              {workflowMode && (
                <Badge variant="outline" className="text-xs">
                  点击选择
                </Badge>
              )}
            </div>
            <CardTitle className={`text-lg leading-tight ${workflowMode ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : ''}`}>
              {idea.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!workflowMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="h-8 w-8"
                aria-label={favorited ? '取消收藏' : '收藏'}
              >
                <Heart
                  className={`h-4 w-4 transition-all ${
                    favorited
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground hover:text-red-500'
                  } ${isAnimating ? 'scale-125' : 'scale-100'}`}
                />
              </Button>
            )}
            {workflowMode && isHovered && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {idea.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 核心信息网格 */}
        <div className="grid grid-cols-1 gap-3">
          {/* Target Market */}
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
              <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">目标市场</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">{idea.targetMarket}</p>
            </div>
          </div>

          {/* Revenue Model */}
          <div className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-950/30 rounded-lg">
            <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-md">
              <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">盈利模式</h4>
              <p className="text-xs text-green-700 dark:text-green-300">{idea.revenueModel}</p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        {idea.keyFeatures && idea.keyFeatures.length > 0 && (
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md">
                <Star className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-100">核心特色</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {idea.keyFeatures.slice(0, 3).map((feature, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  {feature}
                </Badge>
              ))}
              {idea.keyFeatures.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{idea.keyFeatures.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 额外信息 - 只在非工作流模式或有数据时显示 */}
        {!workflowMode && (
          <>
            {/* Market Size */}
            {idea.marketSize && (
              <div className="flex items-start gap-3 p-3 bg-orange-50/50 dark:bg-orange-950/30 rounded-lg">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-md">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-1">市场规模</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300">{idea.marketSize}</p>
                </div>
              </div>
            )}

            {/* Competition */}
            {idea.competition && (
              <div className="flex items-start gap-3 p-3 bg-red-50/50 dark:bg-red-950/30 rounded-lg">
                <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md">
                  <Users className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">竞争分析</h4>
                  <p className="text-xs text-red-700 dark:text-red-300">{idea.competition}</p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* 工作流模式的选择按钮 */}
        {workflowMode && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
              size="sm"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              选择这个创意
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              选择后进入精炼阶段
            </p>
          </div>
        )}

        {/* 非工作流模式的快速操作 */}
        {!workflowMode && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">AI生成</span>
              </div>
              <Badge variant="outline" className="text-xs">
                创意 #{index + 1}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
