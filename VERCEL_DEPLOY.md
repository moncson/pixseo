# Vercel デプロイ手順

## 🚀 初回セットアップ

### 1. Vercelアカウント作成
1. https://vercel.com/ にアクセス
2. **「Sign Up」** をクリック
3. GitHubアカウントで連携（推奨）

---

### 2. Vercel CLIをインストール

```bash
npm install -g vercel
```

---

### 3. Vercelにログイン

```bash
cd /Users/moncson/Downloads/ayumi
vercel login
```

→ ブラウザで認証を完了してください

---

### 4. Firebase サービスアカウントキーを取得

1. https://console.firebase.google.com/ にアクセス
2. プロジェクト「ayumi-f6bd2」を選択
3. ⚙️（設定） → **プロジェクトの設定** → **サービス アカウント**
4. **新しい秘密鍵の生成** をクリック
5. ダウンロードされたJSONファイルを開く
6. **全体をコピー**（改行含む）

---

### 5. プロジェクトをVercelにデプロイ

```bash
cd /Users/moncson/Downloads/ayumi
vercel
```

**質問に答える：**
- `Set up and deploy "~/Downloads/ayumi"?` → **Y**
- `Which scope do you want to deploy to?` → あなたのアカウント
- `Link to existing project?` → **N**
- `What's your project's name?` → **ayumi-media**（任意）
- `In which directory is your code located?` → **./（Enter）**
- `Want to override the settings?` → **N**

→ デプロイが開始されます（約30秒）

---

### 6. 環境変数を設定

デプロイ完了後、Vercelダッシュボードで環境変数を追加：

```bash
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
```

→ 先ほどコピーしたサービスアカウントキーのJSON全体を貼り付け
→ Enterキー2回で確定

---

### 7. 本番デプロイ

```bash
vercel --prod
```

→ 本番環境にデプロイされます

---

## 📝 デプロイ完了後

デプロイが完了すると、以下のようなURLが表示されます：

```
🎉 Production: https://ayumi-media.vercel.app
```

このURLにアクセスして、記事が表示されるか確認してください！

---

## 🌐 カスタムドメイン設定（the-ayumi.jp）

Vercelダッシュボードで：
1. プロジェクトを選択
2. **Settings** → **Domains**
3. `the-ayumi.jp` を追加
4. DNSレコードを設定（Vercelが指示を表示）

---

## 🔄 今後のデプロイ

GitHubにpushするだけで自動デプロイされます！

または、手動デプロイ：
```bash
vercel --prod
```

---

## ⚡️ パフォーマンス比較

| プラットフォーム | デプロイ時間 | 初回表示速度 |
|---|---|---|
| Firebase Functions | 5〜10分 | 遅い（コールドスタート） |
| Vercel | 30秒〜1分 | **超高速** |

---

## 🎯 次のステップ

1. Vercelにデプロイ
2. 記事が表示されるか確認
3. カスタムドメイン（the-ayumi.jp）を設定
4. Firebase Hostingは管理画面専用に変更

