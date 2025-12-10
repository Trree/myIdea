'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, Send, Lightbulb, Target, RotateCcw, AlertCircle, Download, Copy, CheckCircle } from 'lucide-react';
import type { ChatMessage, SocraticMode, SocraticRequest, SocraticResponse } from '@/types';
import { SUPPORTED_MODELS } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { exportChatToMarkdown, downloadTextFile, copyToClipboard } from '@/lib/utils/export';

interface SocraticChatProps {
  defaultMode?: SocraticMode;
}

export default function SocraticChat({ defaultMode = 'brainstorm' }: SocraticChatProps) {
  const { selectedModel, setSelectedModel } = useApp();
  const [mode, setMode] = useState<SocraticMode>(defaultMode);
  const [topic, setTopic] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = async () => {
    if (!topic.trim()) return;

    setError(null);
    setHasStarted(true);
    setMessages([]);
    setCurrentSuggestions([]);

    // 生成第一个问题
    await generateNextQuestion([]);
  };

  const generateNextQuestion = async (history: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: SocraticRequest = {
        mode,
        topic,
        history,
        model: selectedModel,
      };

      const response = await fetch('/api/socratic-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成问题失败');
      }

      const data: SocraticResponse = await response.json();

      // 添加 AI 的问题到对话历史
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.question,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('生成问题错误:', err);
      setError(err instanceof Error ? err.message : '生成问题失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setUserInput('');
    setCurrentSuggestions([]);

    // 生成下一个问题
    await generateNextQuestion(newHistory);
  };

  const handleReset = () => {
    setHasStarted(false);
    setMessages([]);
    setUserInput('');
    setCurrentSuggestions([]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyToClipboard = async () => {
    const markdown = exportChatToMarkdown(topic, mode, messages);
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const markdown = exportChatToMarkdown(topic, mode, messages);
    const timestamp = new Date().getTime();
    const modeLabel = mode === 'brainstorm' ? 'brainstorm' : 'refine';
    downloadTextFile(markdown, `socratic-chat-${modeLabel}-${timestamp}.md`);
  };

  if (!hasStarted) {
    return (
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Title */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                    苏格拉底式追问
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    通过层层追问，激发创意或完善需求
                  </p>
                </div>

                {/* Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">选择模式</Label>
                  <RadioGroup
                    value={mode}
                    onValueChange={(value) => setMode(value as SocraticMode)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="relative">
                      <RadioGroupItem
                        value="brainstorm"
                        id="brainstorm"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="brainstorm"
                        className="flex flex-col items-start gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          <span className="font-semibold">头脑风暴</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          通过追问拓展思维，激发更多创意想法
                        </p>
                      </Label>
                    </div>

                    <div className="relative">
                      <RadioGroupItem
                        value="refine"
                        id="refine"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="refine"
                        className="flex flex-col items-start gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 dark:peer-data-[state=checked]:bg-green-900/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">需求完善</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          通过追问明确需求，完善你的想法
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Topic Input */}
                <div className="space-y-3">
                  <Label htmlFor="topic" className="text-base font-semibold">
                    {mode === 'brainstorm' ? '你想探索的话题' : '你想完善的需求'}
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={
                      mode === 'brainstorm'
                        ? '例如：如何创新教育科技产品'
                        : '例如：开发一个帮助用户学习编程的 App'
                    }
                    className="text-base"
                  />
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <Label htmlFor="model" className="text-base font-semibold">
                    选择 AI 模型
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUPPORTED_MODELS).map(([category, models]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                            {category === 'recommended'
                              ? '推荐'
                              : category === 'international'
                              ? '国际模型'
                              : '其他'}
                          </div>
                          {models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              <div className="flex items-center gap-2">
                                <span>{model.label}</span>
                                {model.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {model.badge}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStart}
                  disabled={!topic.trim()}
                  className="w-full"
                  size="lg"
                >
                  开始对话
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                {mode === 'brainstorm' ? (
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Target className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {mode === 'brainstorm' ? '头脑风暴' : '需求完善'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Export Buttons */}
                {messages.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      disabled={copySuccess}
                      className="flex-1 sm:flex-none"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">复制</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadMarkdown}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4 sm:mr-0" />
                      <span className="sm:hidden ml-2">下载</span>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 sm:flex-none">
                  <RotateCcw className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">重新开始</span>
                  <span className="sm:hidden">重置</span>
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      思考中...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {currentSuggestions.length > 0 && !isLoading && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                  💡 思考提示：
                </p>
                <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-400">
                  {currentSuggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 sticky bottom-0 bg-background pt-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入你的回答..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
