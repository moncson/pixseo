import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// フォント最適化（パフォーマンス向上）
const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap', // FOUTを避けるための設定
  variable: '--font-noto-sans-jp',
  preload: true,
});

export const metadata: Metadata = {
  title: "ふらっと。 | Ayumi Media",
  description: "バリアフリー情報メディア",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>{children}</body>
    </html>
  );
}


