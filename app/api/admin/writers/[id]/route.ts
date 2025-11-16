import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { translateText } from '@/lib/openai/translate';
import { SUPPORTED_LANGS } from '@/types/lang';

// GET: 単一ライター取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const doc = await adminDb.collection('writers').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Writer not found' },
        { status: 404 }
      );
    }
    
    const data = doc.data()!;
    return NextResponse.json({
      id: doc.id,
      icon: data.icon || data.iconUrl || '', // 互換性のため両方チェック
      iconAlt: data.iconAlt || '',
      backgroundImage: data.backgroundImage || '',
      backgroundImageAlt: data.backgroundImageAlt || '',
      handleName: data.handleName,
      bio: data.bio || '',
      mediaId: data.mediaId,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    });
  } catch (error) {
    console.error('Error fetching writer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writer' },
      { status: 500 }
    );
  }
}

// PUT: ライター更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { icon, iconAlt, backgroundImage, backgroundImageAlt, handleName, bio } = body;
    
    const doc = await adminDb.collection('writers').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Writer not found' },
        { status: 404 }
      );
    }
    
    const updateData: any = {
      icon: icon || '',
      iconAlt: iconAlt || '',
      backgroundImage: backgroundImage || '',
      backgroundImageAlt: backgroundImageAlt || '',
      handleName,
      handleName_ja: handleName,
      bio: bio || '',
      bio_ja: bio || '',
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    // 他言語へ翻訳
    const otherLangs = SUPPORTED_LANGS.filter(lang => lang !== 'ja');
    for (const lang of otherLangs) {
      try {
        updateData[`handleName_${lang}`] = await translateText(handleName, lang, 'ライター名');
        if (bio) {
          updateData[`bio_${lang}`] = await translateText(bio, lang, 'ライター自己紹介文');
        }
      } catch (error) {
        console.error(`[Writer Translation Error] ${lang}:`, error);
        updateData[`handleName_${lang}`] = handleName;
        updateData[`bio_${lang}`] = bio || '';
      }
    }
    
    await adminDb.collection('writers').doc(id).update(updateData);
    
    return NextResponse.json({
      id,
      ...updateData,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    console.error('Error updating writer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update writer' },
      { status: 500 }
    );
  }
}

// DELETE: ライター削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const doc = await adminDb.collection('writers').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Writer not found' },
        { status: 404 }
      );
    }
    
    await adminDb.collection('writers').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting writer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete writer' },
      { status: 500 }
    );
  }
}

