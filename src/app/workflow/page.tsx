import { Metadata } from 'next';
import WorkflowContainer from './components/WorkflowContainer';

export const metadata: Metadata = {
  title: '智能工作流 - AI Business Idea Generator',
  description: '从创意生成到需求验证的完整引导式流程',
};

export default function WorkflowPage() {
  return <WorkflowContainer />;
}