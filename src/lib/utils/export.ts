import type { BusinessIdea, ChatMessage } from '@/types';

/**
 * 将创意列表导出为 Markdown 格式
 */
export function exportIdeasToMarkdown(ideas: BusinessIdea[]): string {
  let markdown = '# AI 生成的商业创意\n\n';
  markdown += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += '---\n\n';

  ideas.forEach((idea, index) => {
    markdown += `## ${index + 1}. ${idea.title}\n\n`;
    markdown += `**描述**: ${idea.description}\n\n`;
    markdown += `**目标市场**: ${idea.targetMarket}\n\n`;
    markdown += `**收入模式**: ${idea.revenueModel}\n\n`;

    if (idea.keyFeatures && idea.keyFeatures.length > 0) {
      markdown += `**核心特色**:\n`;
      idea.keyFeatures.forEach((feature) => {
        markdown += `- ${feature}\n`;
      });
      markdown += '\n';
    }

    if (idea.marketSize) {
      markdown += `**市场规模**: ${idea.marketSize}\n\n`;
    }

    if (idea.competition) {
      markdown += `**竞争分析**: ${idea.competition}\n\n`;
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * 将对话记录导出为 Markdown 格式
 */
export function exportChatToMarkdown(
  topic: string,
  mode: string,
  messages: ChatMessage[]
): string {
  let markdown = `# 苏格拉底式对话记录\n\n`;
  markdown += `**主题**: ${topic}\n`;
  markdown += `**模式**: ${mode === 'brainstorm' ? '头脑风暴' : '需求完善'}\n`;
  markdown += `**时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += '---\n\n';

  messages.forEach((message, index) => {
    const role = message.role === 'assistant' ? 'AI' : '用户';
    markdown += `### ${role}\n\n`;
    markdown += `${message.content}\n\n`;
  });

  return markdown;
}

/**
 * 下载文本文件
 */
export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
