'use client';

import Link from 'next/link';
import { Lightbulb, Menu, X, Moon, Sun, Workflow } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useApp } from '@/contexts/AppContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AI Business Ideas</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/workflow"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <Workflow className="h-4 w-4" />
              智能工作流
            </Link>
            <Link
              href="/#generator"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              生成创意
            </Link>
            <Link
              href="/brainstorm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              苏格拉底追问
            </Link>
            <Link
              href="/validate-demand"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              需求验证
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              如何使用
            </Link>
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              功能特色
            </Link>
          </nav>

          {/* Theme Toggle & CTA Button (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="切换主题"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button asChild>
              <Link href="/workflow">开始工作流</Link>
            </Button>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="切换主题"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/workflow"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Workflow className="h-4 w-4" />
                智能工作流
              </Link>
              <Link
                href="/#generator"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                生成创意
              </Link>
              <Link
                href="/brainstorm"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                苏格拉底追问
              </Link>
              <Link
                href="/validate-demand"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                需求验证
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                如何使用
              </Link>
              <Link
                href="/#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                功能特色
              </Link>
              <Button asChild className="w-full">
                <Link href="/workflow" onClick={() => setMobileMenuOpen(false)}>
                  开始工作流
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
