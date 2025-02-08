'use client';
import { NotificationProvider } from '@/components/notification';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}