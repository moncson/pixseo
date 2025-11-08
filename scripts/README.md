# WordPress移行ツール

## 概要

WordPressからFirestoreへ記事を移行するためのツールです。

## 使用方法

### 1. WordPressから記事をエクスポート

WordPressの管理画面から記事をエクスポートし、以下のJSON形式に変換してください。

```json
[
  {
    "title": "記事タイトル",
    "content": "記事本文（HTML）",
    "excerpt": "抜粋",
    "slug": "article-slug",
    "author": "著者名",
    "categories": ["カテゴリー1", "カテゴリー2"],
    "tags": ["タグ1", "タグ2"],
    "featuredImage": "画像URL",
    "publishedAt": "2024-01-01T00:00:00Z",
    "isPublished": true,
    "metaTitle": "SEOタイトル（任意）",
    "metaDescription": "SEOディスクリプション（任意）"
  }
]
```

### 2. JSONファイルを配置

エクスポートしたJSONファイルを `scripts/wordpress-export.json` として保存してください。

サンプルファイル: `scripts/wordpress-export-example.json`

### 3. 移行スクリプトを実行

```bash
# TypeScriptをビルド
npm run build

# 移行スクリプトを実行
npm run migrate
```

または、直接実行：

```bash
npx ts-node scripts/migrate-wordpress.ts
```

## 注意事項

- 同じスラッグの記事は重複してインポートされません
- カテゴリーとタグは自動的に作成されます
- Firebase Admin SDKの認証情報が必要です
- 大量の記事を移行する場合は、バッチ処理を検討してください

## WordPress記事のエクスポート方法

### 方法1: プラグインを使用

1. WordPress管理画面で「WP All Export」プラグインをインストール
2. カスタムエクスポートで以下のフィールドを選択：
   - タイトル
   - 本文
   - 抜粋
   - スラッグ
   - 著者名
   - カテゴリー
   - タグ
   - アイキャッチ画像
   - 公開日
3. JSON形式でエクスポート

### 方法2: WordPress REST APIを使用

```bash
# 全記事を取得
curl "https://the-ayumi.jp/wp-json/wp/v2/posts?per_page=100&page=1" > posts-page1.json
curl "https://the-ayumi.jp/wp-json/wp/v2/posts?per_page=100&page=2" > posts-page2.json
# ... 必要なページ数分繰り返し

# カテゴリーを取得
curl "https://the-ayumi.jp/wp-json/wp/v2/categories?per_page=100" > categories.json

# タグを取得
curl "https://the-ayumi.jp/wp-json/wp/v2/tags?per_page=100" > tags.json
```

その後、JSONファイルを変換する必要があります。

### 方法3: WordPressエクスポート→変換スクリプト

WordPressの標準エクスポート機能でXMLファイルを出力し、変換スクリプトで変換することもできます。

## SEO対策（リダイレクト設定）

移行後、古いWordPressのURLから新しいURLへリダイレクトを設定してください。

### Firebase Hostingでのリダイレクト設定例

`firebase.json` に追加：

```json
{
  "hosting": {
    "redirects": [
      {
        "source": "/2024/01/01/old-article-slug",
        "destination": "/media/articles/new-article-slug",
        "type": 301
      }
    ]
  }
}
```

## トラブルシューティング

### エラー: Firebase認証情報が見つからない

```bash
# Google Cloud SDKでログイン
gcloud auth application-default login

# または、サービスアカウントキーを使用
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

### エラー: 記事が重複する

同じスラッグの記事は自動的にスキップされます。再度実行しても安全です。

### 画像URLの更新

WordPressの画像URLを新しいFirebase StorageのURLに更新する必要がある場合は、
移行後に `content` フィールドの画像URLを一括置換してください。

## サポート

問題が発生した場合は、Ayumi開発チームにお問い合わせください。

