# 重複チェックロジックの説明

## 概要

記事の重複チェック機能は、新規作成または編集中の記事が、既存の公開記事と重複していないかを確認する機能です。

## 実装場所

- **APIエンドポイント**: `/api/admin/articles/check-duplicate`
- **ファイル**: `app/api/admin/articles/check-duplicate/route.ts`

## 重複チェックの流れ

```
1. リクエスト受信
   ├─ mediaId（必須）
   ├─ articleId（編集中の記事ID、新規の場合はnull）
   ├─ title（記事タイトル）
   └─ content（記事本文）

2. 既存記事の取得
   ├─ Firestoreから取得
   ├─ 条件: mediaIdが一致 AND isPublished == true
   └─ 現在編集中の記事は除外（articleIdでフィルタ）

3. 各既存記事との類似度計算
   ├─ タイトルの類似度
   └─ 本文の類似度（最初の500文字）

4. 重複判定
   └─ 類似度が70%以上の場合、重複として報告

5. 結果を返す
   ├─ isDuplicate: 重複があるかどうか
   ├─ duplicates: 重複記事のリスト
   └─ checkedCount: チェックした記事数
```

## 類似度計算アルゴリズム

### `calculateTextSimilarity()` 関数

2つのテキストの類似度を0.0（完全に異なる）から1.0（完全に同じ）の範囲で計算します。

#### 1. テキストの正規化

```typescript
// 小文字化、空白の統一
const normalized1 = text1.toLowerCase().trim().replace(/\s+/g, ' ');
const normalized2 = text2.toLowerCase().trim().replace(/\s+/g, ' ');
```

#### 2. 完全一致チェック

```typescript
if (normalized1 === normalized2) return 1.0;
```

#### 3. Jaccard類似度の計算

単語ベースの類似度を計算します。

```typescript
// 単語に分割
const words1 = normalized1.split(/\s+/);
const words2 = normalized2.split(/\s+/);

// 集合に変換
const set1 = new Set(words1);
const set2 = new Set(words2);

// 共通単語と全単語を計算
const intersection = new Set([...set1].filter(x => set2.has(x)));
const union = new Set([...set1, ...set2]);

// Jaccard類似度 = 共通単語数 / 全単語数
const jaccardSimilarity = intersection.size / union.size;
```

**例:**
- テキスト1: "バリアフリー対応のカフェ"
- テキスト2: "バリアフリー対応のレストラン"
- 共通単語: {"バリアフリー", "対応", "の"}
- 全単語: {"バリアフリー", "対応", "の", "カフェ", "レストラン"}
- Jaccard類似度: 3/5 = 0.6

#### 4. Levenshtein距離ベースの類似度

文字列の編集距離を計算します。

```typescript
// Levenshtein距離を計算
const editDistance = levenshteinDistance(normalized1, normalized2);
const maxLength = Math.max(normalized1.length, normalized2.length);
const stringSimilarity = 1 - (editDistance / maxLength);
```

**Levenshtein距離**: 1つの文字列を別の文字列に変換するために必要な最小の編集操作数（挿入、削除、置換）

**例:**
- テキスト1: "カフェ"
- テキスト2: "レストラン"
- Levenshtein距離: 5（完全に異なる）
- 文字列類似度: 1 - (5/9) = 0.44

#### 5. 最終的な類似度

2つの類似度の平均を返します。

```typescript
return (jaccardSimilarity + stringSimilarity) / 2;
```

## 重複判定の閾値

- **閾値**: 70%（0.7）
- **判定**: タイトルまたは本文の類似度が70%以上の場合、重複として報告

## パフォーマンス最適化

### 1. 本文の比較範囲を制限

```typescript
// 最初の500文字のみ比較
const contentPreview = content.substring(0, 500);
const existingContentPreview = existingArticle.content.substring(0, 500);
```

**理由**: 全文を比較すると計算コストが高くなるため、最初の500文字で十分に重複を検出できます。

### 2. 公開記事のみチェック

```typescript
.where('isPublished', '==', true)
```

**理由**: 下書き記事は重複チェックの対象外とします。

### 3. 現在編集中の記事を除外

```typescript
.filter(doc => doc.id !== articleId)
```

**理由**: 自分自身との比較を避けます。

## 使用例

### 重複がある場合

```json
{
  "isDuplicate": true,
  "duplicates": [
    {
      "articleId": "article-123",
      "title": "バリアフリー対応のカフェ",
      "titleSimilarity": 0.85,
      "contentSimilarity": 0.72
    }
  ],
  "checkedCount": 50
}
```

### 重複がない場合

```json
{
  "isDuplicate": false,
  "duplicates": [],
  "checkedCount": 50
}
```

## 今後の改善案

1. **ベクトル類似度**: より高度な重複検出のために、テキストをベクトル化してコサイン類似度を計算
2. **機械学習モデル**: 重複判定を機械学習モデルで行う
3. **キャッシュ**: 類似度計算結果をキャッシュしてパフォーマンス向上
4. **設定可能な閾値**: ユーザーが重複判定の閾値を調整可能にする

