import { BusinessIdea, ChatMessage } from '@/types';

/**
 * 从创意生成苏格拉底式对话话题
 */
export function synthesizeTopicFromIdea(idea: BusinessIdea): string {
  return `${idea.title}: ${idea.description}

**目标市场**: ${idea.targetMarket}
**收入模式**: ${idea.revenueModel}
**核心功能**: ${idea.keyFeatures.join(', ')}

让我们深入探讨这个创意，了解目标用户的真实需求，并思考如何在竞争中脱颖而出。`;
}

/**
 * 从聊天历史合成需求描述
 */
export function synthesizeDemandFromChat(
  chatHistory: ChatMessage[],
  originalIdea: BusinessIdea
): string {
  const insights = extractInsightsFromChat(chatHistory);
  
  return `基于深入对话分析，${originalIdea.targetMarket}面临以下挑战：

**核心痛点**: ${insights.painPoints.join('、')}

**现有解决方案**: ${insights.currentSolutions.join('、')} - 但它们存在${insights.gaps.join('、')}等不足。

**提议解决方案**: ${originalIdea.title}，通过${insights.valueProps.join('、')}来解决这些问题。

**付费意愿**: 目标用户愿意为${originalIdea.revenueModel}付费，因为${insights.paymentJustification}。

**市场机会**: ${insights.marketOpportunity}`;
}

/**
 * 从聊天历史中提取洞察
 */
export function extractInsightsFromChat(chatHistory: ChatMessage[]): ChatInsights {
  // 这里实现简化的NLP提取逻辑
  // 在实际项目中，可以使用更复杂的AI分析
  
  const userMessages = chatHistory.filter(msg => msg.role === 'user');
  const assistantMessages = chatHistory.filter(msg => msg.role === 'assistant');
  
  // 简化的关键词提取
  const allText = userMessages.map(msg => msg.content).join(' ');
  
  return {
    painPoints: extractPainPoints(allText),
    currentSolutions: extractCurrentSolutions(allText),
    gaps: extractGaps(allText),
    valueProps: extractValueProps(allText),
    paymentJustification: extractPaymentJustification(allText),
    marketOpportunity: extractMarketOpportunity(allText),
  };
}

interface ChatInsights {
  painPoints: string[];
  currentSolutions: string[];
  gaps: string[];
  valueProps: string[];
  paymentJustification: string;
  marketOpportunity: string;
}

// 简化的提取函数（实际项目中可以使用AI进行更智能的分析）
function extractPainPoints(text: string): string[] {
  const painKeywords = ['困难', '问题', '挑战', '痛点', '不便', '麻烦'];
  // 简化实现
  return ['时间成本高', '效率低下', '用户体验差'];
}

function extractCurrentSolutions(text: string): string[] {
  return ['传统方法', '现有工具', '人工处理'];
}

function extractGaps(text: string): string[] {
  return ['功能单一', '成本过高', '学习门槛高'];
}

function extractValueProps(text: string): string[] {
  return ['智能化处理', '个性化体验', '成本优化'];
}

function extractPaymentJustification(text: string): string {
  return '能够显著提升效率并节省时间成本';
}

function extractMarketOpportunity(text: string): string {
  return '市场需求旺盛，竞争对手解决方案存在明显不足';
}