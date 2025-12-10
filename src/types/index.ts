// ============================================
// 核心类型定义
// ============================================

export type GenerationType =
  | 'trending'      // 趋势市场机会
  | 'random'        // 随机创业概念
  | 'niche'         // 小众市场创意
  | 'innovation'    // 创新颠覆
  | 'scalability';  // 可扩展性

export interface BusinessIdea {
  title: string;
  targetMarket: string;
  revenueModel: string;
  keyFeatures: string[];
  description: string;
  marketSize?: string;
  competition?: string;
}

export interface GenerateIdeaRequest {
  interests: string;
  generationType: GenerationType;
  model?: string;
  stream?: boolean;
}

export interface GenerateIdeaResponse {
  ideas: BusinessIdea[];
}

// ============================================
// 模型配置
// ============================================

export interface ModelInfo {
  value: string;
  label: string;
  provider: string;
  badge?: string;
  description?: string;
  pricing?: {
    input: number;  // CNY/百万 tokens
    output: number;
  };
}

export const SUPPORTED_MODELS: Record<string, ModelInfo[]> = {
  recommended: [
    {
      value: 'deepseek-chat',
      label: 'DeepSeek Chat',
      provider: 'DeepSeek',
      badge: '推荐',
      description: '性价比高，速度快',
      pricing: { input: 1, output: 2 },
    },
    {
      value: 'qwen-plus',
      label: 'Qwen Plus',
      provider: '通义千问',
      badge: '推荐',
      description: '平衡性能与成本',
      pricing: { input: 4, output: 12 },
    },
    {
      value: 'qwen-max',
      label: 'Qwen Max',
      provider: '通义千问',
      badge: '最强',
      description: '阿里云最强模型',
      pricing: { input: 40, output: 120 },
    },
  ],
  international: [
    {
      value: 'gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: '最先进的模型',
      pricing: { input: 70, output: 210 },
    },
    {
      value: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: '快速且经济',
      pricing: { input: 3.5, output: 7 },
    },
    {
      value: 'claude-3-opus-20240229',
      label: 'Claude 3 Opus',
      provider: 'Anthropic',
      description: '创意输出优秀',
      pricing: { input: 105, output: 315 },
    },
    {
      value: 'claude-3-sonnet-20240229',
      label: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      description: '平衡性能',
      pricing: { input: 21, output: 70 },
    },
  ],
  other: [
    {
      value: 'deepseek-coder',
      label: 'DeepSeek Coder',
      provider: 'DeepSeek',
      description: '代码生成专家',
      pricing: { input: 1, output: 2 },
    },
    {
      value: 'qwen-turbo',
      label: 'Qwen Turbo',
      provider: '通义千问',
      description: '极速响应',
      pricing: { input: 2, output: 6 },
    },
  ],
};

// 扁平化所有模型列表
export const ALL_MODELS = Object.values(SUPPORTED_MODELS).flat();

// ============================================
// 生成类型配置
// ============================================

export const GENERATION_TYPES: Record<GenerationType, { label: string; description: string; icon: string }> = {
  trending: {
    label: '趋势市场机会',
    description: '基于当前市场趋势生成创意',
    icon: '📈',
  },
  random: {
    label: '随机创业概念',
    description: '发现意想不到的商业点子',
    icon: '🎲',
  },
  niche: {
    label: '小众市场创意',
    description: '聚焦细分市场的机会',
    icon: '🎯',
  },
  innovation: {
    label: '创新颠覆',
    description: '突破性的创新商业模式',
    icon: '💡',
  },
  scalability: {
    label: '可扩展性',
    description: '高增长潜力的业务想法',
    icon: '🚀',
  },
};

// ============================================
// 苏格拉底式对话
// ============================================

export type SocraticMode = 'brainstorm' | 'refine';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SocraticRequest {
  mode: SocraticMode;
  topic: string;
  history: ChatMessage[];
  model?: string;
}

export interface SocraticResponse {
  question: string;
  suggestions?: string[];
  insights?: string;
}
