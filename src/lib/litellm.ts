import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================
// 类型定义
// ============================================

interface GenerateParams {
  prompt: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ModelConfig {
  baseURL: string;
  apiKey: string;
  headers?: Record<string, string>;
}

// ============================================
// 统一 LLM 客户端
// ============================================

export class UnifiedLLMClient {
  /**
   * 获取模型配置
   */
  private getModelConfig(model: string): ModelConfig {
    // DeepSeek
    if (model.startsWith('deepseek')) {
      return {
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
      };
    }

    // Qwen / 通义千问
    if (model.startsWith('qwen')) {
      return {
        baseURL:
          process.env.QWEN_BASE_URL ||
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || '',
        headers: {
          'X-DashScope-SSE': 'enable',
        },
      };
    }

    // OpenAI
    if (model.startsWith('gpt')) {
      return {
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
      };
    }

    // Anthropic (Claude) - 需要特殊处理
    if (model.startsWith('claude')) {
      return {
        baseURL: 'https://api.anthropic.com',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      };
    }

    // Google Gemini
    if (model.startsWith('gemini')) {
      return {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: process.env.GOOGLE_API_KEY || '',
      };
    }

    // Groq
    if (model.startsWith('groq/')) {
      return {
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY || '',
      };
    }

    // Ollama (本地)
    if (model.startsWith('ollama/')) {
      return {
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        apiKey: 'ollama',
      };
    }

    throw new Error(`不支持的模型: ${model}`);
  }

  /**
   * 标准化模型名称
   */
  private normalizeModelName(model: string): string {
    // 移除前缀
    if (model.startsWith('ollama/')) {
      return model.replace('ollama/', '');
    }
    if (model.startsWith('groq/')) {
      return model.replace('groq/', '');
    }
    return model;
  }

  /**
   * 生成内容（非流式）
   */
  async generate(params: GenerateParams): Promise<string> {
    const {
      prompt,
      model,
      systemPrompt,
      temperature = 0.8,
      maxTokens = 3000,
    } = params;

    // Claude 使用官方 SDK
    if (model.startsWith('claude')) {
      return this.generateWithClaude(params);
    }

    const config = this.getModelConfig(model);

    // 验证 API Key
    if (!config.apiKey || config.apiKey === '') {
      throw new Error(`${model} 的 API Key 未配置。请检查环境变量。`);
    }

    // 使用 OpenAI 兼容接口
    const client = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      defaultHeaders: config.headers,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    try {
      const response = await client.chat.completions.create({
        model: this.normalizeModelName(model),
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('模型返回了空响应');
      }

      return content;
    } catch (error: any) {
      console.error('LLM 生成错误:', error);
      throw new Error(`生成失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 生成内容（流式）
   */
  async *generateStream(params: GenerateParams): AsyncGenerator<string> {
    const {
      prompt,
      model,
      systemPrompt,
      temperature = 0.8,
      maxTokens = 3000,
    } = params;

    // Claude 流式处理
    if (model.startsWith('claude')) {
      yield* this.generateStreamWithClaude(params);
      return;
    }

    const config = this.getModelConfig(model);

    // 验证 API Key
    if (!config.apiKey || config.apiKey === '') {
      throw new Error(`${model} 的 API Key 未配置。请检查环境变量。`);
    }

    const client = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      defaultHeaders: config.headers,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    try {
      const stream = await client.chat.completions.create({
        model: this.normalizeModelName(model),
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error: any) {
      console.error('LLM 流式生成错误:', error);
      throw new Error(`生成失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * Claude 专用生成方法
   */
  private async generateWithClaude(params: GenerateParams): Promise<string> {
    const {
      prompt,
      model,
      systemPrompt,
      temperature = 0.8,
      maxTokens = 3000,
    } = params;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY 未配置');
    }

    const client = new Anthropic({ apiKey });

    try {
      const response = await client.messages.create({
        model: model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Claude 返回了非文本响应');
      }

      return content.text;
    } catch (error: any) {
      console.error('Claude 生成错误:', error);
      throw new Error(`Claude 生成失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * Claude 流式生成
   */
  private async *generateStreamWithClaude(
    params: GenerateParams
  ): AsyncGenerator<string> {
    const {
      prompt,
      model,
      systemPrompt,
      temperature = 0.8,
      maxTokens = 3000,
    } = params;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY 未配置');
    }

    const client = new Anthropic({ apiKey });

    try {
      const stream = await client.messages.create({
        model: model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }
    } catch (error: any) {
      console.error('Claude 流式生成错误:', error);
      throw new Error(`Claude 生成失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 带重试的生成
   */
  async generateWithRetry(
    params: GenerateParams,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.generate(params);
      } catch (error: any) {
        lastError = error;
        console.error(`生成尝试 ${i + 1}/${maxRetries} 失败:`, error);

        // API Key 错误不重试
        if (
          error.message?.includes('API key') ||
          error.message?.includes('API Key') ||
          error.message?.includes('unauthorized')
        ) {
          throw error;
        }

        // 等待后重试
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw lastError || new Error('达到最大重试次数');
  }
}

// ============================================
// 导出单例
// ============================================

export const llmClient = new UnifiedLLMClient();
