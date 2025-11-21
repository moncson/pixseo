import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // 本番環境のベースURL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pixseo.cloud';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      // AI検索エンジン向けの許可設定
      {
        userAgent: 'GPTBot', // OpenAI
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Claude-Web', // Anthropic Claude
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'anthropic-ai', // Anthropic AI
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'PerplexityBot', // Perplexity
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Googlebot', // Google
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Bingbot', // Bing
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Slurp', // Yahoo
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'DuckDuckBot', // DuckDuckGo
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'facebookexternalhit', // Facebook
        allow: '/',
      },
      {
        userAgent: 'Twitterbot', // Twitter
        allow: '/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
  };
}

