# トラブルシューティングガイド

## 現在のエラー状況

- **ユーザー向けサイト**: https://ayumi-f6bd2.web.app/media → 500エラー
- **管理画面**: https://ayumi-f6bd2-admin.web.app/media → 404エラー

## エラーの原因を特定する方法

### 1. Firebase Functionsのログを確認

```bash
# Firebase CLIでログイン
firebase login

# プロジェクトを選択
firebase use ayumi-f6bd2

# Functionsのログを確認
firebase functions:log

# または、リアルタイムでログを確認
firebase functions:log --only nextjs
```

### 2. Firebase Consoleでログを確認

1. [Firebase Console](https://console.firebase.google.com/project/ayumi-f6bd2/functions/logs) にアクセス
2. 「Functions」→「ログ」を選択
3. `nextjs`関数のログを確認

### 3. ローカルでテスト

```bash
# プロジェクトルートで
npm run build

# functionsディレクトリで
cd functions
npm run build

# Firebase Emulatorでテスト（オプション）
firebase emulators:start
```

## よくある問題と解決方法

### 問題1: Firebase Admin SDKの認証エラー

**症状**: `Error: Could not load the default credentials`

**解決方法**:
1. Firebase Consoleでサービスアカウントキーをダウンロード
2. 環境変数として設定するか、デフォルトの認証情報を使用

```bash
# 環境変数を設定（本番環境ではFirebase Consoleで設定）
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### 問題2: Next.jsのビルドエラー

**症状**: `Error: Cannot find module` またはビルドエラー

**解決方法**:
```bash
# クリーンビルド
rm -rf .next out out-admin functions/lib
npm run build
cd functions && npm run build
```

### 問題3: メモリ不足エラー

**症状**: `Error: Function execution took longer than 60 seconds`

**解決方法**: `functions/src/index.ts`でメモリとタイムアウトを増やす

```typescript
.runWith({
  memory: '2GB',  // 1GBから2GBに増やす
  timeoutSeconds: 120,  // 60秒から120秒に増やす
})
```

### 問題4: 静的ファイルが見つからない

**症状**: `404 Not Found` for `/_next/static/...`

**解決方法**: Firebase Hostingの設定を確認し、静的ファイルが正しく配信されているか確認

## デプロイ手順（再デプロイ）

```bash
# 1. ビルド
npm run build

# 2. Functionsをビルド
cd functions
npm run build
cd ..

# 3. デプロイ
firebase deploy --only functions,hosting

# または、個別にデプロイ
firebase deploy --only functions
firebase deploy --only hosting:production
firebase deploy --only hosting:admin
```

## 次のステップ

1. Firebase Functionsのログを確認してエラーの原因を特定
2. エラーに応じて上記の解決方法を試す
3. 必要に応じて設定を修正して再デプロイ

