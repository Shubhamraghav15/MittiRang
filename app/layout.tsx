import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
// deploy
export const metadata: Metadata = {
  title: 'Mittirang - Walk The Art',
  description: 'Discover our curated collection of premium footwear inspired by natural tones and crafted for modern living. Where earth meets elegance.',
  keywords: 'footwear, shoes, premium, natural, earthy, elegant, Mittirang',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
