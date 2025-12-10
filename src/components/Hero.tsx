'use client';

import { Sparkles, TrendingUp, Target, Rocket } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-16 sm:py-24 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.04] dark:bg-grid-white/[0.02]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              支持 DeepSeek、Qwen、GPT-4、Claude 等多种 AI 模型
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            AI Business Idea{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            基于人工智能生成创新商业创意。只需输入您的兴趣、技能或行业，
            即可获得个性化的创业想法。
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg p-4 border shadow-sm"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
        </div>
      </div>
    </section>
  );
}

const stats = [
  { icon: Sparkles, value: '10+', label: 'AI 模型' },
  { icon: TrendingUp, value: '5', label: '生成类型' },
  { icon: Target, value: '精准', label: '个性化' },
  { icon: Rocket, value: '快速', label: '秒级响应' },
];
