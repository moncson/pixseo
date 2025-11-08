import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('[API Upload] 画像アップロード開始');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('[API Upload] ファイルが見つかりません');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[API Upload] ファイル情報:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // ファイル名を生成
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `articles/${timestamp}_${randomString}.${extension}`;

    console.log('[API Upload] 生成されたパス:', fileName);

    // ArrayBufferに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('[API Upload] Admin Storage経由でアップロード中...');

    // Admin SDKでアップロード
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    console.log('[API Upload] アップロード完了、公開URL取得中...');

    // 公開URLを生成
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    console.log('[API Upload] 公開URL:', publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('[API Upload] エラー:', error);
    console.error('[API Upload] エラー詳細:', error?.message);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

