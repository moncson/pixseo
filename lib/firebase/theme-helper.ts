import { adminDb } from './admin';
import { Theme, defaultTheme } from '@/types/theme';

// Themeキャッシュ（5分間）
const themeCache = new Map<string, { theme: Theme; timestamp: number }>();
const THEME_CACHE_TTL = 5 * 60 * 1000; // 5分

/**
 * mediaIdからTheme情報を取得（キャッシュ付き）
 */
export async function getTheme(mediaId: string): Promise<Theme> {
  try {
    // キャッシュチェック
    const cached = themeCache.get(mediaId);
    if (cached && Date.now() - cached.timestamp < THEME_CACHE_TTL) {
      return cached.theme;
    }

    // Firestoreから取得
    const tenantDoc = await adminDb.collection('mediaTenants').doc(mediaId).get();
    
    if (!tenantDoc.exists) {
      return defaultTheme;
    }

    const data = tenantDoc.data();
    const theme: Theme = {
      ...defaultTheme,
      ...(data?.theme || {}),
    };

    // キャッシュに保存
    themeCache.set(mediaId, {
      theme,
      timestamp: Date.now(),
    });

    return theme;
  } catch (error) {
    console.error('[getTheme] Error:', error);
    return defaultTheme;
  }
}

/**
 * Themeからスタイル文字列を生成
 */
export function generateThemeStyles(theme: Theme): string {
  return `
    :root {
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --accent-color: ${theme.accentColor};
      --background-color: ${theme.backgroundColor};
      --header-background-color: ${theme.headerBackgroundColor};
      --footer-background-color: ${theme.footerBackgroundColor};
      --block-background-color: ${theme.blockBackgroundColor};
      --link-color: ${theme.linkColor};
      --link-hover-color: ${theme.linkHoverColor};
      --border-color: ${theme.borderColor};
      --shadow-color: ${theme.shadowColor};
      --h2-color: ${theme.h2Color};
      --h2-background-color: ${theme.h2BackgroundColor || 'transparent'};
      --h2-left-border-color: ${theme.h2LeftBorderColor || 'transparent'};
      --h2-bottom-border-color: ${theme.h2BottomBorderColor || 'transparent'};
      --h3-color: ${theme.h3Color};
      --h3-background-color: ${theme.h3BackgroundColor || 'transparent'};
      --h3-left-border-color: ${theme.h3LeftBorderColor || 'transparent'};
      --h3-bottom-border-color: ${theme.h3BottomBorderColor || 'transparent'};
      --h4-color: ${theme.h4Color};
      --h4-background-color: ${theme.h4BackgroundColor || 'transparent'};
      --h4-left-border-color: ${theme.h4LeftBorderColor || 'transparent'};
      --h4-bottom-border-color: ${theme.h4BottomBorderColor || 'transparent'};
    }
  `;
}

/**
 * カスタムCSSとThemeスタイルを組み合わせる
 */
export function getCombinedStyles(theme: Theme): string {
  const themeStyles = generateThemeStyles(theme);
  const customCss = theme.customCss || '';
  
  return `
    ${themeStyles}
    ${customCss}
  `;
}

