# Firebase Functions シークレット設定ガイド

## 概要

APIキーなどの機密情報をFirebase Functionsのシークレット機能で安全に管理する方法です。

## シークレットの設定手順

### 1. Firebase CLIでシークレットを設定

```bash
# Firebase CLIにログイン
firebase login

# プロジェクトを選択
firebase use ayumi-f6bd2

# Grok APIキーをシークレットとして設定
firebase functions:secrets:set GROK_API_KEY

# プロンプトが表示されたら、APIキーを入力してください

# OpenAI APIキーをシークレットとして設定
firebase functions:secrets:set OPENAI_API_KEY

# プロンプトが表示されたら、APIキーを入力してください
```

### 2. functions/src/index.ts でシークレットを参照

Firebase Functions v2では、シークレットを関数定義時に指定する必要があります。

```typescript
import { defineSecret } from 'firebase-functions/params';

// シークレットを定義
const grokApiKey = defineSecret('GROK_API_KEY');
const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const nextjs = functions
  .region('asia-northeast1')
  .runWith({
    memory: '2GB',
    timeoutSeconds: 120,
    secrets: [grokApiKey, openaiApiKey], // シークレットを指定
  })
  .https.onRequest(async (request, response) => {
    // シークレットの値にアクセス
    process.env.GROK_API_KEY = grokApiKey.value();
    process.env.OPENAI_API_KEY = openaiApiKey.value();
    
    // ... 既存のコード
  });
```

### 3. シークレットの確認

```bash
# 設定されているシークレットの一覧を確認
firebase functions:secrets:access GROK_API_KEY

# シークレットの値を確認（表示される）
firebase functions:secrets:access OPENAI_API_KEY
```

### 4. デプロイ

シークレットを設定した後、Functionsをデプロイします：

```bash
firebase deploy --only functions
```

## 実装の変更点

### Before（環境変数使用）

```typescript
const grokApiKey = process.env.GROK_API_KEY;
```

### After（Firebase Secrets使用）

```typescript
// API Routes内で
const grokApiKey = process.env.GROK_API_KEY || 
                   (process.env.FIREBASE_CONFIG ? await getSecret('GROK_API_KEY') : null);
```

## ローカル開発環境での設定

ローカル開発環境では、引き続き`.env.local`ファイルを使用します：

```bash
# .env.local
GROK_API_KEY=your_grok_api_key
OPENAI_API_KEY=your_openai_api_key
```

## セキュリティの利点

1. **暗号化保存**: Firebase Secrets Managerで暗号化されて保存される
2. **アクセス制御**: Firebase IAMでアクセス権限を管理可能
3. **監査ログ**: シークレットへのアクセスがログに記録される
4. **自動ローテーション**: 必要に応じてシークレットを更新可能

## トラブルシューティング

### シークレットが取得できない場合

1. Firebase Functionsが正しくデプロイされているか確認
2. シークレットが正しく設定されているか確認
3. 関数定義で`secrets`配列にシークレットが含まれているか確認

### ローカル環境で動作しない場合

`.env.local`ファイルが正しく設定されているか確認してください。

## 参考資料

- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Firebase CLI Secrets Commands](https://firebase.google.com/docs/cli/secrets)

