'use client';

import { AppProvider } from '@/contexts/AppContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
