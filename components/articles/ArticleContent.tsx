'use client';

import { useEffect } from 'react';
import parse from 'html-react-parser';
import YouTubeEmbed from './YouTubeEmbed';
import ShortCodeRenderer from './ShortCodeRenderer';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  useEffect(() => {
    // スクロール位置を保存・復元（ページ遷移時）
    return () => {
      // クリーンアップ
    };
  }, []);

  // ショートコードを処理
  const processedContent = ShortCodeRenderer.process(content);

  // HTMLをパースしてReactコンポーネントに変換
  const options = {
    replace: (domNode: any) => {
      // YouTube埋め込みを検出して変換
      if (domNode.name === 'iframe' && domNode.attribs?.src?.includes('youtube.com')) {
        const youtubeId = extractYouTubeId(domNode.attribs.src);
        if (youtubeId) {
          return <YouTubeEmbed videoId={youtubeId} />;
        }
      }
      // 参照元のスタイリング
      if (domNode.name === 'p' && domNode.children?.[0]?.data?.includes('参照：')) {
        return (
          <p className="reference">
            {domNode.children.map((child: any, index: number) => (
              <span key={index}>{child.data || child.children}</span>
            ))}
          </p>
        );
      }
      return undefined;
    },
  };

  return (
    <div className="prose prose-lg max-w-none">
      {parse(processedContent, options)}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}


