# 環境変数の設定方法

## 必要なAPIキーの設定

記事の自動生成機能を使用するには、以下のAPIキーを環境変数として設定する必要があります。

### 1. `.env.local`ファイルの作成

プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を追加してください：

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://the-ayumi.jp
NEXT_PUBLIC_MEDIA_BASE_PATH=/media

# Google Maps API (if needed)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI APIs for Article Generation
GROK_API_KEY=your_grok_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. 環境変数の説明

- **GROK_API_KEY**: X.AIのGrok APIキー（記事生成に使用）
- **OPENAI_API_KEY**: OpenAI APIキー（記事リライトと重複チェックに使用）

### 3. 本番環境での設定

#### Vercelの場合

1. Vercelダッシュボードにログイン
2. プロジェクトの「Settings」→「Environment Variables」に移動
3. 以下の環境変数を追加：
   - `GROK_API_KEY`
   - `OPENAI_API_KEY`

#### Firebase Functionsの場合

Firebase Functionsを使用している場合、以下のコマンドで環境変数を設定：

```bash
firebase functions:config:set grok.api_key="your_grok_api_key"
firebase functions:config:set openai.api_key="your_openai_api_key"
```

または、`.env`ファイルを使用する場合は、`functions/.env`に設定してください。

### 4. セキュリティに関する注意事項

⚠️ **重要**: 
- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません
- APIキーは絶対に公開リポジトリにコミットしないでください
- 本番環境では環境変数として設定してください

### 5. 動作確認

環境変数を設定した後、開発サーバーを再起動してください：

```bash
npm run dev
```

記事一覧ページで「AI記事生成」ボタンが正常に動作することを確認してください。

