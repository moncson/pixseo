'use client';

import { useState, FormEvent } from 'react';
import { Metadata } from 'next';
import { submitRequest } from '@/lib/firebase/requests';

const categories = [
  { value: 'verified-location', label: 'Ayumiの推奨店舗・施設' },
  { value: 'travel', label: '旅行/観光' },
  { value: 'hotel', label: '旅館/ホテル' },
  { value: 'restaurant', label: '飲食店' },
  { value: 'system', label: '制度情報' },
  { value: 'service', label: 'サービス/商品紹介' },
  { value: 'challenger', label: '障害と向き合う挑戦者' },
  { value: 'lifehack', label: 'ライフハック' },
  { value: 'employment', label: '雇用/就労支援' },
  { value: 'other', label: 'その他' },
];

export default function RequestPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    title: '',
    description: '',
    location: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.category || !formData.title || !formData.description) {
      alert('必須項目を入力してください');
      return;
    }

    setLoading(true);
    try {
      await submitRequest(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        category: '',
        title: '',
        description: '',
        location: '',
      });
      
      // 3秒後に成功メッセージを非表示
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('リクエストの送信に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">記事リクエスト</h1>
          <p className="text-xl text-gray-600">
            「こんな情報が欲しい」「この場所について知りたい」など、
            <br className="hidden sm:block" />
            あなたのリクエストをお聞かせください。
          </p>
        </div>

        {/* 成功メッセージ */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">
                リクエストを送信しました。ありがとうございます！
              </p>
            </div>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
          {/* お名前 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              お名前 *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              返信が必要な場合に使用します
            </p>
          </div>

          {/* カテゴリー */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* リクエストタイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              リクエストタイトル *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：六本木のバリアフリー対応カフェについて知りたい"
              required
            />
          </div>

          {/* 詳細 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              詳細 *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="どのような情報が欲しいか、できるだけ詳しく教えてください。"
              required
            />
          </div>

          {/* 場所 */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              場所・エリア（任意）
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：東京都渋谷区、大阪市内など"
            />
          </div>

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">ご注意</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>いただいたリクエストは、記事作成の参考にさせていただきます。</li>
              <li>すべてのリクエストに記事を作成することをお約束するものではありません。</li>
              <li>個別の返信が必要な場合は、お問い合わせフォームをご利用ください。</li>
            </ul>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '送信中...' : 'リクエストを送信'}
            </button>
          </div>
        </form>

        {/* お問い合わせリンク */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            その他のお問い合わせは、Ayumi公式サイトのお問い合わせフォームをご利用ください。
          </p>
          <a
            href="https://the-ayumi.jp/contact/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            お問い合わせフォームへ
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

