# AI記事生成機能のロジック説明

## 概要

この機能は、Grok APIとOpenAI APIを使用して記事の原案を自動生成し、既存記事との重複をチェック・回避する機能です。

## 現在の実装ロジック

### 1. 記事生成フロー（`/api/admin/articles/generate`）

```
ユーザー操作
  ↓
記事一覧ページで「AI記事生成」ボタンをクリック
  ↓
ArticleGeneratorModalが開く
  ↓
カテゴリ・タグ・トピックを選択
  ↓
「記事を生成」ボタンをクリック
  ↓
POST /api/admin/articles/generate
  ├─ 1. mediaIdをヘッダーから取得
  ├─ 2. カテゴリIDとタグIDから名前を取得（Firestore）
  ├─ 3. プロンプトを構築
  │   ├─ カテゴリ名
  │   ├─ タグ名
  │   ├─ トピック
  │   └─ 追加のコンテキスト
  ├─ 4. Grok APIを呼び出し
  │   ├─ エンドポイント: https://api.x.ai/v1/chat/completions
  │   ├─ モデル: grok-4-latest
  │   ├─ システムプロンプト: SEO記事作成の専門家
  │   └─ ユーザープロンプト: 上記で構築したプロンプト
  ├─ 5. 生成されたコンテンツを解析
  │   ├─ タイトルを抽出（正規表現）
  │   ├─ メタディスクリプションを抽出
  │   └─ 本文を抽出
  └─ 6. 重複チェックを実行（/api/admin/articles/check-duplicate）
  ↓
生成された記事データを返す
  ↓
ArticleGeneratorModalで表示・編集可能
```

### 2. 記事リライトフロー（`/api/admin/articles/rewrite`）

```
ユーザー操作
  ↓
生成された記事で「リライト」ボタンをクリック
  ↓
POST /api/admin/articles/rewrite
  ├─ 1. mediaIdと記事内容を取得
  ├─ 2. 既存の公開記事を取得（Firestore）
  ├─ 3. 既存記事タイトルをプロンプトに含める
  ├─ 4. OpenAI APIを呼び出し
  │   ├─ エンドポイント: https://api.openai.com/v1/chat/completions
  │   ├─ モデル: gpt-4-turbo-preview
  │   ├─ システムプロンプト: SEO記事リライトの専門家
  │   └─ ユーザープロンプト: 既存記事タイトル + リライト要件
  ├─ 5. リライトされたコンテンツを取得
  └─ 6. 重複度を計算（簡易版）
  ↓
リライトされた記事データを返す
```

### 3. 重複チェックフロー（`/api/admin/articles/check-duplicate`）

```
自動実行（記事生成後・リライト後）
  ↓
POST /api/admin/articles/check-duplicate
  ├─ 1. mediaIdと記事内容を取得
  ├─ 2. 既存の公開記事を取得（Firestore）
  ├─ 3. タイトルの類似度を計算
  │   └─ Jaccard類似度 + Levenshtein距離ベース
  ├─ 4. 本文の類似度を計算（最初の500文字）
  └─ 5. 類似度が70%以上の場合、重複として報告
  ↓
重複チェック結果を返す
```

## データフロー

### 入力データ
- `categoryIds`: カテゴリIDの配列
- `tagIds`: タグIDの配列
- `topic`: トピック（任意）
- `additionalContext`: 追加のコンテキスト（任意）

### 中間処理
1. **カテゴリ・タグ名の取得**: FirestoreからIDに対応する名前を取得
2. **プロンプト構築**: 取得した情報を元にプロンプトを構築
3. **API呼び出し**: Grok/OpenAI APIにリクエストを送信
4. **レスポンス解析**: 生成されたコンテンツを解析して構造化

### 出力データ
```typescript
{
  title: string;           // 記事タイトル
  excerpt: string;        // メタディスクリプション
  content: string;        // HTML形式の記事本文
  categoryIds: string[];  // 選択されたカテゴリID
  tagIds: string[];       // 選択されたタグID
}
```

## セキュリティ

### 現在の実装
- APIキーは環境変数（`process.env.GROK_API_KEY`、`process.env.OPENAI_API_KEY`）から取得
- サーバーサイドでのみ実行（Next.js API Routes）
- `mediaId`によるテナント分離

### 改善点（Firebase Functionsシークレット使用）
- Firebase Functionsのシークレット機能を使用してAPIキーを安全に管理
- 環境変数ではなく、Firebase Secrets Managerを使用

## エラーハンドリング

1. **APIキー未設定**: 500エラーを返す
2. **Grok/OpenAI APIエラー**: エラーレスポンスをログに記録し、500エラーを返す
3. **コンテンツ生成失敗**: 空のコンテンツの場合、500エラーを返す
4. **パターンマッチング失敗**: フォールバック処理で全体を本文として扱う

## パフォーマンス

- **Grok API**: 最大4000トークン、温度0.7
- **OpenAI API**: 最大4000トークン、温度0.7
- **重複チェック**: 最初の500文字のみ比較（パフォーマンス最適化）

## 今後の改善案

1. ストリーミング対応（生成中の進捗表示）
2. より高度な重複チェック（ベクトル類似度など）
3. 生成履歴の保存
4. 複数バージョンの生成と選択機能

