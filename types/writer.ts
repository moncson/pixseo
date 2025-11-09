export interface Writer {
  id: string;
  icon?: string; // アイコン画像（オプショナル）
  handleName: string; // ハンドルネーム
  bio?: string; // 紹介文（オプショナル）
  mediaId: string; // サービスID
  createdAt?: Date;
  updatedAt?: Date;
}

