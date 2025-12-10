import SocraticChat from '@/components/SocraticChat';

export const metadata = {
  title: '苏格拉底式追问 - AI创意生成器',
  description: '通过苏格拉底式的层层追问，激发创意头脑风暴或完善你的需求想法',
};

export default function BrainstormPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <SocraticChat />
    </main>
  );
}
