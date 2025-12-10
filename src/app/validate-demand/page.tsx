import DemandValidator from '@/components/DemandValidator';

export const metadata = {
  title: '需求验证 - AI创意生成器',
  description: '使用科学方法验证需求真伪：分析高频度、痛点强度和付费意愿，结合Google Trends和社区讨论数据',
};

export default function ValidateDemandPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <DemandValidator />
    </main>
  );
}
