# WordPress記事移行ガイド

## 📖 概要

既存のWordPressサイト（https://the-ayumi.jp）から記事をFirestoreに移行する手順を説明します。

## 🚀 移行方法（推奨）

### ステップ1: WordPressから記事を取得

```bash
cd /Users/moncson/Downloads/ayumi
npm run fetch-wordpress
```

このコマンドは以下を自動で実行します：
- WordPress REST APIから全記事を取得
- カテゴリーとタグを取得
- アイキャッチ画像URLを取得
- 移行用のJSON形式に変換
- `scripts/wordpress-export.json` に保存

### ステップ2: データを確認

```bash
# 取得した記事データを確認
cat scripts/wordpress-export.json | jq length  # 記事数を表示
cat scripts/wordpress-export.json | jq '.[0]'  # 最初の記事を表示
```

### ステップ3: Firestoreに移行

```bash
npm run migrate
```

このコマンドは以下を実行します：
- カテゴリーとタグを自動作成（存在しない場合）
- 記事をFirestoreに追加
- 重複チェック（スラッグで判定）

## 🔄 代替方法

### 方法A: 手動でWordPress REST APIを使用

```bash
# 記事を取得（ページごと）
curl "https://the-ayumi.jp/wp-json/wp/v2/posts?per_page=100&page=1" > posts-page1.json
curl "https://the-ayumi.jp/wp-json/wp/v2/posts?per_page=100&page=2" > posts-page2.json
# ... 必要なページ数分繰り返し

# カテゴリーを取得
curl "https://the-ayumi.jp/wp-json/wp/v2/categories?per_page=100" > categories.json

# タグを取得
curl "https://the-ayumi.jp/wp-json/wp/v2/tags?per_page=100" > tags.json

# メディア（画像）を取得
curl "https://the-ayumi.jp/wp-json/wp/v2/media?per_page=100&page=1" > media.json
```

その後、取得したJSONを `scripts/wordpress-export.json` の形式に変換する必要があります。

### 方法B: WordPressプラグインを使用

1. WordPress管理画面にログイン
2. **WP All Export** プラグインをインストール
3. カスタムエクスポートで以下のフィールドを選択：
   - タイトル
   - 本文
   - 抜粋
   - スラッグ
   - 著者名
   - カテゴリー
   - タグ
   - アイキャッチ画像URL
   - 公開日
   - 公開ステータス
4. JSON形式でエクスポート
5. 形式を調整して `scripts/wordpress-export.json` に保存

## 📄 JSONフォーマット

`scripts/wordpress-export.json` は以下の形式である必要があります：

```json
[
  {
    "title": "記事タイトル",
    "content": "<p>記事本文（HTML形式）</p>",
    "excerpt": "記事の抜粋",
    "slug": "article-slug-url",
    "author": "著者名",
    "categories": ["カテゴリー1", "カテゴリー2"],
    "tags": ["タグ1", "タグ2", "タグ3"],
    "featuredImage": "https://example.com/image.jpg",
    "publishedAt": "2024-01-01T00:00:00Z",
    "isPublished": true,
    "metaTitle": "SEOタイトル（任意）",
    "metaDescription": "SEOディスクリプション（任意）"
  }
]
```

サンプルファイル: `scripts/wordpress-export-example.json`

## ⚠️ 注意事項

### 移行前の確認事項

1. **バックアップ**: Firestoreのデータをバックアップしてください
2. **重複チェック**: 同じスラッグの記事は自動的にスキップされます
3. **画像URL**: WordPress上の画像URLがそのまま使用されます
4. **HTML変換**: 記事本文のHTMLはそのまま保存されます

### 画像の扱い

- WordPress上の画像URLがそのまま使用されます
- 画像を新しいFirebase Storageに移行する場合は、別途対応が必要です
- 画像URLの一括置換が必要な場合はお知らせください

### カテゴリーとタグ

- WordPressのカテゴリー名とタグ名がそのまま使用されます
- スラッグは自動生成されます（小文字、ハイフン区切り）
- 既存のカテゴリー・タグと重複する場合は、既存のものが使用されます

## 🔧 トラブルシューティング

### エラー: Firebase認証情報が見つからない

```bash
# Google Cloud SDKでログイン
gcloud auth application-default login

# または、サービスアカウントキーを使用
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### エラー: WordPress APIに接続できない

```bash
# WordPressサイトのREST APIが有効か確認
curl "https://the-ayumi.jp/wp-json/wp/v2/posts?per_page=1"
```

もしエラーが返る場合：
1. WordPress REST APIが無効化されていないか確認
2. アクセス制限がかかっていないか確認
3. 手動でブラウザからアクセスして確認

### 記事数が300件より少ない

WordPress REST APIはページネーションがあるため、複数回実行が必要です。
`fetch-wordpress.ts` スクリプトは自動的に全ページを取得しますが、
最大50ページ（5000記事）までの制限があります。

それ以上の記事がある場合は、スクリプトの `page > 50` の条件を変更してください。

### 移行後の確認

```bash
# 管理画面で記事数を確認
# https://ayumi-f6bd2-admin.web.app/admin

# または、Firebaseコンソールで確認
# https://console.firebase.google.com/project/ayumi-f6bd2/firestore
```

## 📊 移行後の作業

### 1. URLリダイレクト設定

古いWordPressのURLから新しいURLへリダイレクトを設定：

```json
// firebase.json に追加
{
  "hosting": {
    "redirects": [
      {
        "source": "/2024/:month/:day/:slug",
        "destination": "/media/articles/:slug",
        "type": 301
      }
    ]
  }
}
```

### 2. 内部リンクの更新

記事内の内部リンクを一括置換する必要がある場合は、
Firestore上で一括更新スクリプトを実行できます。

### 3. SEO対策

- Google Search Consoleでサイトマップを再送信
- リダイレクトが正しく動作しているか確認
- 301リダイレクトのステータスコードを確認

## 💡 ヒント

### 段階的移行

大量の記事がある場合は、段階的に移行することをお勧めします：

1. まず10記事だけ移行してテスト
2. 問題がなければ100記事移行
3. 最後に全記事を移行

### カスタムフィールド

WordPressのカスタムフィールドを移行する場合は、
スクリプトを修正する必要があります。お知らせください。

### 画像の最適化

移行後、画像をFirebase Storageに移行して最適化することをお勧めします：
- WebP形式への変換
- レスポンシブ画像の生成
- CDN配信

## 📞 サポート

移行中に問題が発生した場合は、エラーメッセージと共にお知らせください。

