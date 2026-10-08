import type { Metadata } from 'next';
import { Rajdhani, Inter } from 'next/font/google';
import './globals.css';

const displayFont = Rajdhani({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GD Arena | AI Voice-First Group Discussion Training',
  description: 'Practise high-stakes group discussions with AI participants and an autonomous moderator. Get unfiltered rubric evaluation and honest feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} dark`}>
      <body className="bg-[#07070a] text-slate-100 min-h-screen antialiased selection:bg-[#ff1e2d] selection:text-white">
        {children}
      </body>
    </html>
  );
}
