import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/litellm';
import { z } from 'zod';

// ============================================
// 请求验证 Schema
// ============================================

const RequestSchema = z.object({
  demand: z.string().min(1, '请输入需求描述').max(1000, '需求描述过长'),
});

// ============================================
// 类型定义
// ============================================

interface ValidationResult {
  isRealDemand: boolean;
  score: number;
  frequency: 'high' | 'medium' | 'low';
  painPoint: 'strong' | 'medium' | 'weak';
  paymentWillingness: 'high' | 'medium' | 'low';
  reasoning: string;
  actionPlan: string[];
}

// ============================================
// POST /api/validate-demand - 验证需求真伪
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);
    const { demand } = validatedData;

    console.log(`[API] 需求验证请求: ${demand.substring(0, 50)}...`);

    // 构建 Prompt
    const prompt = buildValidationPrompt(demand);

    // 调用 AI 分析
    const result = await llmClient.generateWithRetry({
      prompt,
      model: 'deepseek-chat', // 使用默认模型
      systemPrompt: VALIDATION_SYSTEM_PROMPT,
      temperature: 0.3, // 较低温度，更客观的分析
      maxTokens: 2000,
    });

    // 解析结果
    const validation = parseValidationResult(result);

    console.log(`[API] 验证完成: score=${validation.score}, isReal=${validation.isRealDemand}`);

    return NextResponse.json(validation);
  } catch (error) {
    console.error('[API] 验证错误:', error);

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
    const errorMessage = error instanceof Error ? error.message : '验证失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================
// System Prompt - 验证需求
// ============================================

const VALIDATION_SYSTEM_PROMPT = `你是一位经验丰富的产品经理和商业分析师，擅长辨别真假需求。

你的任务是评估给定需求的真实性和商业价值，基于以下三个核心维度：

1. **频率 (Frequency)**
   - 高频：用户每天或每周多次遇到此问题
   - 中频：用户每月遇到几次此问题
   - 低频：用户偶尔或很少遇到此问题

2. **痛点强度 (Pain Point)**
   - 强：问题严重影响工作/生活效率，用户急需解决
   - 中：问题带来一定困扰，但可以接受
   - 弱：问题影响很小，更多是好奇或兴趣

3. **付费意愿 (Payment Willingness)**
   - 高：用户愿意支付合理价格（月费/年费）
   - 中：用户愿意支付较低价格或一次性费用
   - 低：用户只想要免费方案，不愿意付费

**判断标准：**
- 真需求 = 高频 + 强痛点 + 高付费意愿（至少两项达到高/强）
- 假需求 = 低频 + 弱痛点 + 低付费意愿（至少两项为低/弱）

请客观分析，给出综合评分（0-100分）和详细理由。`;

// ============================================
// 构建验证 Prompt
// ============================================

function buildValidationPrompt(demand: string): string {
  return `请分析以下需求的真实性和商业价值：

需求描述：
${demand}

请按照以下 JSON 格式返回分析结果：

\`\`\`json
{
  "isRealDemand": true/false,
  "score": 75,
  "frequency": "high/medium/low",
  "painPoint": "strong/medium/weak",
  "paymentWillingness": "high/medium/low",
  "reasoning": "详细说明为什么这是真需求或假需求，包括对三个维度的分析...",
  "actionPlan": [
    "第一步：具体行动建议...",
    "第二步：具体行动建议...",
    "第三步：具体行动建议...",
    "第四步：具体行动建议...",
    "第五步：具体行动建议..."
  ]
}
\`\`\`

**分析要求：**
1. 客观评估频率、痛点强度和付费意愿
2. reasoning 要具体，说明判断依据
3. actionPlan 要提供 5-8 个可执行的具体步骤
4. 如果是真需求，actionPlan 应该包括市场调研、MVP开发、用户测试等
5. 如果是假需求，actionPlan 应该建议重新评估、寻找真实痛点等

请只返回 JSON，不要添加其他解释。`;
}

// ============================================
// 解析验证结果
// ============================================

function parseValidationResult(response: string): ValidationResult {
  try {
    // 清理响应
    let cleaned = response.trim();

    // 移除 markdown 代码块标记
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // 解析 JSON
    const parsed = JSON.parse(cleaned);

    // 验证必需字段
    if (
      typeof parsed.isRealDemand !== 'boolean' ||
      typeof parsed.score !== 'number' ||
      !parsed.frequency ||
      !parsed.painPoint ||
      !parsed.paymentWillingness ||
      !parsed.reasoning ||
      !Array.isArray(parsed.actionPlan)
    ) {
      throw new Error('响应格式无效：缺少必需字段');
    }

    // 验证枚举值
    const validFrequency = ['high', 'medium', 'low'];
    const validPainPoint = ['strong', 'medium', 'weak'];
    const validPayment = ['high', 'medium', 'low'];

    if (!validFrequency.includes(parsed.frequency)) {
      throw new Error('frequency 值无效');
    }
    if (!validPainPoint.includes(parsed.painPoint)) {
      throw new Error('painPoint 值无效');
    }
    if (!validPayment.includes(parsed.paymentWillingness)) {
      throw new Error('paymentWillingness 值无效');
    }

    // 确保 score 在 0-100 之间
    const score = Math.max(0, Math.min(100, parsed.score));

    return {
      isRealDemand: parsed.isRealDemand,
      score,
      frequency: parsed.frequency,
      painPoint: parsed.painPoint,
      paymentWillingness: parsed.paymentWillingness,
      reasoning: String(parsed.reasoning),
      actionPlan: parsed.actionPlan.map((action: any) => String(action)),
    };
  } catch (error) {
    console.error('[API] 解析验证结果失败:', error);
    console.error('[API] 原始响应:', response);
    throw new Error(`解析 AI 响应失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// ============================================
// GET /api/validate-demand - 健康检查
// ============================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Demand Validation API',
    version: '1.0.0',
  });
}
