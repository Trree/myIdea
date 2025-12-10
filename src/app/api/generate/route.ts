import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/litellm';
import { buildPrompt, SYSTEM_PROMPT } from '@/lib/prompts';
import { z } from 'zod';
import type { GenerateIdeaRequest, BusinessIdea } from '@/types';

// ============================================
// 请求验证 Schema
// ============================================

const RequestSchema = z.object({
  interests: z.string().min(1, '请输入您的兴趣或技能').max(500, '输入内容过长'),
  generationType: z.enum(['trending', 'random', 'niche', 'innovation', 'scalability']),
  model: z.string().optional().default('deepseek-chat'),
  stream: z.boolean().optional().default(false),
});

// ============================================
// POST /api/generate - 生成商业创意
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);
    const { interests, generationType, model, stream } = validatedData;

    // 构建 Prompt
    const prompt = buildPrompt(interests, generationType);

    console.log(`[API] 生成请求: model=${model}, type=${generationType}`);

    // 流式响应
    if (stream) {
      return handleStreamResponse(prompt, model);
    }

    // 非流式响应
    return handleNormalResponse(prompt, model);
  } catch (error) {
    console.error('[API] 生成错误:', error);

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
    const errorMessage = error instanceof Error ? error.message : '生成失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================
// 非流式响应处理
// ============================================

async function handleNormalResponse(prompt: string, model: string) {
  try {
    const result = await llmClient.generateWithRetry({
      prompt,
      model,
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.8,
      maxTokens: 3000,
    });

    // 解析 JSON 结果
    const ideas = parseIdeasFromResponse(result);

    console.log(`[API] 成功生成 ${ideas.length} 个创意`);

    return NextResponse.json({
      ideas,
      model,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] 生成失败:', error);
    throw error;
  }
}

// ============================================
// 流式响应处理
// ============================================

async function handleStreamResponse(prompt: string, model: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = '';

        for await (const chunk of llmClient.generateStream({
          prompt,
          model,
          systemPrompt: SYSTEM_PROMPT,
          temperature: 0.8,
          maxTokens: 3000,
        })) {
          fullResponse += chunk;

          // 发送每个 chunk
          const data = JSON.stringify({ content: chunk });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }

        // 尝试解析完整响应
        try {
          const ideas = parseIdeasFromResponse(fullResponse);
          const finalData = JSON.stringify({ ideas, done: true });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
        } catch (parseError) {
          console.error('[API] 流式响应解析失败:', parseError);
          const errorData = JSON.stringify({
            error: '解析响应失败',
            rawResponse: fullResponse,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('[API] 流式生成错误:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const errorData = JSON.stringify({ error: errorMessage });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ============================================
// 解析 AI 响应
// ============================================

function parseIdeasFromResponse(response: string): BusinessIdea[] {
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
    if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
      throw new Error('响应格式无效：缺少 ideas 数组');
    }

    // 验证每个创意的必需字段
    const ideas: BusinessIdea[] = parsed.ideas.map((idea: any, index: number) => {
      if (!idea.title || !idea.targetMarket || !idea.revenueModel) {
        throw new Error(`创意 ${index + 1} 缺少必需字段`);
      }

      return {
        title: String(idea.title),
        targetMarket: String(idea.targetMarket),
        revenueModel: String(idea.revenueModel),
        keyFeatures: Array.isArray(idea.keyFeatures)
          ? idea.keyFeatures.map(String)
          : [],
        description: String(idea.description || ''),
        marketSize: idea.marketSize ? String(idea.marketSize) : undefined,
        competition: idea.competition ? String(idea.competition) : undefined,
      };
    });

    return ideas;
  } catch (error) {
    console.error('[API] 解析响应失败:', error);
    console.error('[API] 原始响应:', response);
    throw new Error(`解析 AI 响应失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// ============================================
// GET /api/generate - 健康检查
// ============================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Business Idea Generator API',
    version: '1.0.0',
  });
}
