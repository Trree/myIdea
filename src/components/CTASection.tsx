'use client';

import { Button } from './ui/button';
import { Rocket } from 'lucide-react';

export default function CTASection() {
  const scrollToGenerator = () => {
    const generator = document.getElementById('generator');
    generator?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            准备好打造下一个大事业了吗？
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100">
            立即使用 AI 生成您的专属商业创意，开启创业之旅。
            完全免费，支持多种大模型。
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 h-auto"
            onClick={scrollToGenerator}
          >
            <Rocket className="mr-2 h-5 w-5" />
            开始生成创意
          </Button>
        </div>
      </div>
    </section>
  );
}
