'use client';

import { AppProvider } from '@/contexts/AppContext';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <WorkflowProvider>
        {children}
      </WorkflowProvider>
    </AppProvider>
  );
}
