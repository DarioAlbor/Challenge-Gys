import './styles/globals.scss';
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { Providers } from '@/lib/providers/notificationProvider';
import { NotificationProvider } from '@/components/notification';

export const metadata: Metadata = {
  title: "Challenge - Darío Albor",
  description: "Visit my Github: https://www.github.com/darioalbor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.className}`}>
      <body>
        <Providers>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}