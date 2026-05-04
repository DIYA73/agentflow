import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'agentflow — Visual AI Agent Builder',
  description: 'Build, chain, and deploy autonomous AI agents visually.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
