export interface Writer {
  id: string;
  iconUrl: string; // アイコン画像
  handleName: string; // ハンドルネーム
  bio: string; // 紹介文
  mediaId: string; // サービスID
  createdAt: Date;
  updatedAt: Date;
}

