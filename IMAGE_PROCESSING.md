# 画像処理の実装説明

## 概要

このプロジェクトでは、記事のアイキャッチ画像と本文中の画像を処理する機能を実装しています。

## 現在の実装

### 1. 画像アップロード（手動）

#### エンドポイント
- `/api/admin/upload-image`

#### 処理フロー
```
1. ファイルを受け取る（FormData）
2. ファイル名を生成（タイムスタンプ + ランダム文字列）
3. Firebase Storageにアップロード
4. 公開URLを生成して返す
```

#### 保存先
- `articles/{timestamp}_{randomString}.{extension}`

### 2. 画像生成（AI - DALL-E）

#### エンドポイント
- `/api/admin/images/generate`

#### 処理フロー
```
1. プロンプトを受け取る
2. OpenAI DALL-E APIを呼び出し
   ├─ モデル: dall-e-3
   ├─ サイズ: 1024x1024, 1792x1024, 1024x1792
   └─ 品質: standard
3. 生成された画像をダウンロード
4. Firebase Storageにアップロード
5. 公開URLを返す
```

#### 保存先
- `articles/ai-generated/{timestamp}_{randomString}.png`

## 画像の種類

### 1. アイキャッチ画像

**用途**: 記事のトップに表示されるメイン画像

**設定場所**:
- 記事作成ページ（`/admin-panel/articles/new`）
- 記事編集ページ（`/admin-panel/articles/[id]/edit`）
- AI記事生成モーダル（`ArticleGeneratorModal`）

**生成方法**:
- 手動アップロード: ファイル選択ダイアログから選択
- AI生成: `ImageGenerator`コンポーネントでDALL-Eを使用

### 2. 本文中の画像

**用途**: 記事本文内に挿入される画像

**設定場所**:
- `RichTextEditor`コンポーネント内

**生成方法**:
- 手動アップロード: エディタのツールバーから画像を挿入
- URL指定: 外部URLから画像を挿入

## 実装詳細

### 画像アップロードAPI (`/api/admin/upload-image`)

```typescript
// ファイルを受け取る
const file = formData.get('file') as File;

// Firebase Storageにアップロード
const bucket = adminStorage.bucket();
const fileRef = bucket.file(fileName);
await fileRef.save(buffer, { metadata: { contentType: file.type } });

// 公開URLを生成
await fileRef.makePublic();
const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
```

### 画像生成API (`/api/admin/images/generate`)

```typescript
// DALL-E APIを呼び出し
const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt,
    size: size,
    quality: 'standard',
  }),
});

// 生成された画像をダウンロード
const imageUrl = openaiData.data?.[0]?.url;
const imageResponse = await fetch(imageUrl);
const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

// Firebase Storageにアップロード
await fileRef.save(imageBuffer, { metadata: { contentType: 'image/png' } });
```

## コンポーネント

### ImageGenerator

AI画像生成用のコンポーネントです。

**機能**:
- プロンプト入力
- 画像サイズ選択
- 記事タイトル・コンテンツから自動プロンプト生成
- 生成された画像のプレビュー

**使用場所**:
- `ArticleGeneratorModal`: アイキャッチ画像生成

### RichTextEditor

リッチテキストエディタコンポーネントです。

**画像挿入機能**:
- ツールバーから画像を挿入
- アップロードまたはURL指定
- キャプション・著作権表記の追加

## セキュリティ

### Firebase Storage ルール

画像はFirebase Storageに保存され、セキュリティルールで保護されています。

```javascript
// storage.rules
match /articles/{allPaths=**} {
  allow read: if true; // 公開読み取り
  allow write: if request.auth != null; // 認証済みユーザーのみ書き込み可能
}
```

## パフォーマンス

### 画像最適化

現在は実装されていませんが、将来的に以下を検討：

1. **リサイズ**: 最大幅2000pxにリサイズ
2. **WebP変換**: より軽量なWebP形式に変換
3. **サムネイル生成**: 一覧表示用のサムネイルを自動生成

## 今後の改善案

1. **画像最適化の自動化**: Sharpライブラリを使用した自動最適化
2. **CDN統合**: CloudflareやCloudFrontとの統合
3. **画像検索機能**: 生成された画像の履歴管理
4. **バッチ生成**: 複数の画像を一度に生成

