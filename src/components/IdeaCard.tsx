'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Target, DollarSign, Star, TrendingUp, Users, Heart } from 'lucide-react';
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
  const favorited = isFavorite(idea.title);

  const handleToggleFavorite = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    if (favorited) {
      removeFavorite(idea.title);
    } else {
      addFavorite(idea);
    }
  };

  return (
    <Card
      className={`h-full hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
        workflowMode ? 'cursor-pointer hover:border-blue-500 hover:shadow-blue-100 dark:hover:shadow-blue-900/20' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={workflowMode ? onSelect : undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl">{idea.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="h-8 w-8"
              aria-label={favorited ? '取消收藏' : '收藏'}
            >
              <Heart
                className={`h-5 w-5 transition-all ${
                  favorited
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                } ${isAnimating ? 'scale-125' : 'scale-100'}`}
              />
            </Button>
            <Badge variant="secondary">
              #{index + 1}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-2">{idea.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Target Market */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">目标市场</h4>
            <p className="text-sm text-muted-foreground">{idea.targetMarket}</p>
          </div>
        </div>

        {/* Revenue Model */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">盈利模式</h4>
            <p className="text-sm text-muted-foreground">{idea.revenueModel}</p>
          </div>
        </div>

        {/* Key Features */}
        {idea.keyFeatures && idea.keyFeatures.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-2">核心特色</h4>
              <ul className="space-y-1">
                {idea.keyFeatures.map((feature, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start">
                    <span className="mr-2 mt-1.5 h-1 w-1 rounded-full bg-purple-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Market Size */}
        {idea.marketSize && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">市场规模</h4>
              <p className="text-sm text-muted-foreground">{idea.marketSize}</p>
            </div>
          </div>
        )}

        {/* Competition */}
        {idea.competition && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 bg-red-50 dark:bg-red-950 rounded-lg">
              <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">竞争分析</h4>
              <p className="text-sm text-muted-foreground">{idea.competition}</p>
            </div>
          </div>
        )}
        
        {/* Workflow Mode Selection Button */}
        {workflowMode && (
          <div className="pt-4 border-t">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              className="w-full"
              size="sm"
            >
              选择这个创意
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
