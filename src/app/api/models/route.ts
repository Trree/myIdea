import { NextResponse } from 'next/server';
import { SUPPORTED_MODELS, ALL_MODELS } from '@/types';

// ============================================
// GET /api/models - 获取可用模型列表
// ============================================

export async function GET() {
  try {
    // 检查哪些模型已配置 API Key
    const availableModels = ALL_MODELS.map((model) => ({
      ...model,
      available: isModelAvailable(model.value),
    }));

    return NextResponse.json({
      models: availableModels,
      grouped: {
        recommended: SUPPORTED_MODELS.recommended.map((m) => ({
          ...m,
          available: isModelAvailable(m.value),
        })),
        international: SUPPORTED_MODELS.international.map((m) => ({
          ...m,
          available: isModelAvailable(m.value),
        })),
        other: SUPPORTED_MODELS.other.map((m) => ({
          ...m,
          available: isModelAvailable(m.value),
        })),
      },
      defaultModel: process.env.DEFAULT_MODEL || 'deepseek-chat',
    });
  } catch (error) {
    console.error('[API] 获取模型列表失败:', error);
    return NextResponse.json(
      { error: '获取模型列表失败' },
      { status: 500 }
    );
  }
}

// ============================================
// 检查模型是否可用
// ============================================

function isModelAvailable(model: string): boolean {
  // DeepSeek
  if (model.startsWith('deepseek')) {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  // Qwen
  if (model.startsWith('qwen')) {
    return !!(process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY);
  }

  // OpenAI
  if (model.startsWith('gpt')) {
    return !!process.env.OPENAI_API_KEY;
  }

  // Claude
  if (model.startsWith('claude')) {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  // Gemini
  if (model.startsWith('gemini')) {
    return !!process.env.GOOGLE_API_KEY;
  }

  // Groq
  if (model.startsWith('groq/')) {
    return !!process.env.GROQ_API_KEY;
  }

  // Ollama (假设本地运行)
  if (model.startsWith('ollama/')) {
    return !!process.env.OLLAMA_BASE_URL;
  }

  return false;
}
