# 実装サマリー

## 実装完了した機能

### 1. AI記事生成機能

#### Grok APIによる記事生成
- **エンドポイント**: `/api/admin/articles/generate`
- **モデル**: `grok-4-latest` (Grok 4)
- **機能**: カテゴリ・タグ・トピックに基づいて記事の原案を自動生成

#### OpenAI APIによる記事リライト
- **エンドポイント**: `/api/admin/articles/rewrite`
- **モデル**: `gpt-4o` (GPT-4o)
- **機能**: 既存記事との重複を避けながら記事をリライト

#### 重複チェック
- **エンドポイント**: `/api/admin/articles/check-duplicate`
- **アルゴリズム**: Jaccard類似度 + Levenshtein距離
- **閾値**: 70%以上で重複と判定

### 2. AI画像生成機能

#### OpenAI DALL-Eによる画像生成
- **エンドポイント**: `/api/admin/images/generate`
- **モデル**: `dall-e-3`
- **機能**: プロンプトから画像を生成し、Firebase Storageに保存
- **サイズ**: 1024x1024, 1792x1024, 1024x1792

### 3. 画像処理

#### アイキャッチ画像
- **手動アップロード**: `/api/admin/upload-image`
- **AI生成**: `ImageGenerator`コンポーネント経由
- **保存先**: Firebase Storage (`articles/{timestamp}_{random}.{ext}`)

#### 本文中の画像
- **RichTextEditor**: ツールバーから画像を挿入可能
- **アップロードまたはURL指定**: 両方に対応

## セキュリティ

### Firebase Functions Secrets
- **Grok APIキー**: `GROK_API_KEY`シークレット
- **OpenAI APIキー**: `OPENAI_API_KEY`シークレット
- **実装**: `functions/src/index.ts`でシークレットを環境変数として設定

## 使用モデル

- **Grok**: `grok-4-latest` (Grok 4)
- **OpenAI**: `gpt-4o` (GPT-4o)
- **DALL-E**: `dall-e-3`

## 重複チェックロジック

### アルゴリズム

1. **Jaccard類似度**: 単語ベースの類似度
   - 共通単語数 / 全単語数

2. **Levenshtein距離**: 文字列の編集距離
   - 1 - (編集距離 / 最大長)

3. **最終類似度**: 2つの類似度の平均

### 判定基準

- **タイトル**: 最初の500文字で比較
- **本文**: 最初の500文字で比較
- **閾値**: 70%以上で重複と判定

詳細は `DUPLICATE_CHECK_LOGIC.md` を参照してください。

## 画像処理の流れ

### 手動アップロード
```
ファイル選択 → /api/admin/upload-image → Firebase Storage → 公開URL返却
```

### AI生成
```
プロンプト入力 → /api/admin/images/generate → DALL-E API → 画像ダウンロード → Firebase Storage → 公開URL返却
```

詳細は `IMAGE_PROCESSING.md` を参照してください。

## ファイル構成

### APIエンドポイント
- `app/api/admin/articles/generate/route.ts` - 記事生成
- `app/api/admin/articles/rewrite/route.ts` - 記事リライト
- `app/api/admin/articles/check-duplicate/route.ts` - 重複チェック
- `app/api/admin/images/generate/route.ts` - 画像生成
- `app/api/admin/upload-image/route.ts` - 画像アップロード

### コンポーネント
- `components/admin/ArticleGeneratorModal.tsx` - 記事生成モーダル
- `components/admin/ImageGenerator.tsx` - 画像生成コンポーネント
- `components/admin/RichTextEditor.tsx` - リッチテキストエディタ

### 設定ファイル
- `functions/src/index.ts` - Firebase Functions設定（シークレット管理）

## 設定手順

1. **Firebase Secretsの設定**
```bash
firebase functions:secrets:set GROK_API_KEY
firebase functions:secrets:set OPENAI_API_KEY
```

2. **デプロイ**
```bash
firebase deploy --only functions
```

3. **ローカル開発**
`.env.local`にAPIキーを設定

詳細は `FIREBASE_SECRETS_SETUP.md` を参照してください。

