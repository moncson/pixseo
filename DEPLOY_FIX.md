# エラー修正後のデプロイ手順

## 修正内容

1. **Firebase Functionsのエラーハンドリングを改善**
   - 詳細なエラーログを追加
   - メモリを2GB、タイムアウトを120秒に増加

2. **firebase.jsonの設定を修正**
   - `public`ディレクトリの設定を修正

## デプロイ手順

### 1. プロジェクトルートでビルド

```bash
cd /Users/moncson/Downloads/ayumi

# Next.jsアプリをビルド
npm run build
```

### 2. Functionsをビルド

```bash
# functionsディレクトリでビルド
cd functions
npm run build
cd ..
```

### 3. Firebase FunctionsとHostingをデプロイ

```bash
# Firebase CLIでログイン（必要に応じて）
firebase login

# プロジェクトを選択
firebase use ayumi-f6bd2

# FunctionsとHostingをデプロイ
firebase deploy --only functions,hosting
```

### 4. デプロイ後の確認

- **ユーザー向けサイト**: https://ayumi-f6bd2.web.app/media
- **管理画面**: https://ayumi-f6bd2-admin.web.app/media

### 5. エラーログの確認

デプロイ後もエラーが発生する場合は、ログを確認してください：

```bash
# Functionsのログを確認
firebase functions:log --only nextjs

# または、Firebase Consoleで確認
# https://console.firebase.google.com/project/ayumi-f6bd2/functions/logs
```

## トラブルシューティング

### ビルドエラーが発生する場合

```bash
# クリーンビルド
rm -rf .next out out-admin functions/lib
npm run build
cd functions && npm run build
```

### デプロイエラーが発生する場合

```bash
# Firebase CLIのバージョンを確認
firebase --version

# ログインを確認
firebase login

# プロジェクトを確認
firebase use ayumi-f6bd2

# 再度デプロイ
firebase deploy --only functions,hosting
```

## 注意事項

- 初回デプロイ時は、Firebase Functionsのコールドスタートで時間がかかる場合があります
- エラーが発生した場合は、`TROUBLESHOOTING.md`を参照してください

