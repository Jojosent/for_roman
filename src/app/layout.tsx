import type { Metadata, Viewport } from 'next';
import './globals.css';
import FloatingHearts from '@/components/FloatingHearts';
import AmbientSound from '@/components/AmbientSound';

export const metadata: Metadata = {
  title: 'Особенное приглашение для тебя ✨',
  description: 'Приглашение на незабываемое свидание ❤️',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💌</text></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fff1f2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#fff7f8] selection:bg-rose-200 selection:text-rose-900 relative">
        <FloatingHearts />
        <AmbientSound />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
