'use client';

import Link from 'next/link';
import { Lightbulb, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AI Business Ideas</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              使用人工智能生成创新商业创意。支持 DeepSeek、Qwen、GPT-4、Claude 等多种大模型。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#generator"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  生成创意
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  如何使用
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  功能特色
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">支持的模型</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>DeepSeek Chat</li>
              <li>Qwen (通义千问)</li>
              <li>GPT-4 / GPT-3.5</li>
              <li>Claude 3</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} AI Business Ideas Generator. 保留所有权利。
          </p>
          <p className="mt-2">
            使用 Next.js + LiteLLM 构建 ·{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              查看源代码
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
