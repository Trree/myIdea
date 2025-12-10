import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/litellm';
import { buildSocraticPrompt, SOCRATIC_SYSTEM_PROMPTS } from '@/lib/prompts';
import { z } from 'zod';
import type { SocraticRequest, SocraticResponse, ChatMessage } from '@/types';

// ============================================
// 请求验证 Schema
// ============================================

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
});

const RequestSchema = z.object({
  mode: z.enum(['brainstorm', 'refine']),
  topic: z.string().min(1, '请输入话题或需求').max(500, '输入内容过长'),
  history: z.array(ChatMessageSchema),
  model: z.string().optional().default('deepseek-chat'),
});

// ============================================
// POST /api/socratic-question - 生成苏格拉底式追问
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);
    const { mode, topic, history, model } = validatedData;

    // 构建对话历史文本
    const conversationHistory = formatConversationHistory(history);

    // 构建 Prompt
    const prompt = buildSocraticPrompt(mode, topic, conversationHistory);
    const systemPrompt = SOCRATIC_SYSTEM_PROMPTS[mode];

    console.log(`[API] 苏格拉底追问请求: mode=${mode}, model=${model}`);

    // 调用 LLM
    const result = await llmClient.generateWithRetry({
      prompt,
      model,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 800,
    });

    // 解析 JSON 结果
    const response = parseResponseFromLLM(result);

    console.log(`[API] 成功生成追问: ${response.question}`);

    return NextResponse.json({
      ...response,
      model,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API] 苏格拉底追问错误:', error);

    // Zod 验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '请求参数无效',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // 其他错误
    const errorMessage = error instanceof Error ? error.message : '生成追问失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================
// 格式化对话历史
// ============================================

function formatConversationHistory(history: ChatMessage[]): string {
  if (history.length === 0) {
    return '（这是对话的开始）';
  }

  return history
    .map((msg) => {
      const label = msg.role === 'user' ? '用户' : 'AI';
      return `${label}: ${msg.content}`;
    })
    .join('\n\n');
}

// ============================================
// 解析 AI 响应
// ============================================

function parseResponseFromLLM(response: string): SocraticResponse {
  try {
    // 清理响应（移除可能的 markdown 代码块标记）
    let cleaned = response.trim();

    // 移除 ```json 和 ``` 标记
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // 解析 JSON
    const parsed = JSON.parse(cleaned);

    // 验证结构
    if (!parsed.question || typeof parsed.question !== 'string') {
      throw new Error('响应格式无效：缺少 question 字段');
    }

    return {
      question: String(parsed.question),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map(String)
        : undefined,
      insights: parsed.insights ? String(parsed.insights) : undefined,
    };
  } catch (error) {
    console.error('[API] 解析响应失败:', error);
    console.error('[API] 原始响应:', response);
    throw new Error(`解析 AI 响应失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// ============================================
// GET /api/socratic-question - 健康检查
// ============================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Socratic Questioning API',
    version: '1.0.0',
    modes: ['brainstorm', 'refine'],
  });
}
