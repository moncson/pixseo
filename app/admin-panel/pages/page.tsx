'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { deletePage } from '@/lib/firebase/pages-admin';
import { Page } from '@/types/page';
import { apiGet } from '@/lib/api-client';
import { useMediaTenant } from '@/contexts/MediaTenantContext';

export default function PagesListPage() {
  const { currentTenant } = useMediaTenant();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      console.log('[PagesListPage] Fetching pages from API...');
      
      const data: Page[] = await apiGet('/api/admin/pages');
      console.log('[PagesListPage] Received pages:', data);
      
      // 日付をDateオブジェクトに変換
      const pagesWithDates = data.map(page => ({
        ...page,
        publishedAt: new Date(page.publishedAt),
        updatedAt: new Date(page.updatedAt),
      }));
      
      // 表示順でソート
      const sortedData = pagesWithDates.sort((a, b) => a.order - b.order);
      console.log('[PagesListPage] Sorted pages:', sortedData);
      setPages(sortedData);
      setLoading(false);
    } catch (error) {
      console.error('[PagesListPage] Error fetching pages:', error);
      alert('固定ページの取得に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await deletePage(id);
      setPages(pages.filter((page) => page.id !== id));
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('固定ページの削除に失敗しました');
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        fetchPages();
      } else {
        throw new Error('更新に失敗しました');
      }
    } catch (error) {
      console.error('Error toggling page published:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const filteredPages = pages.filter((page) => {
    const lowercaseSearch = searchTerm.toLowerCase();
    return (
      page.title.toLowerCase().includes(lowercaseSearch) ||
      page.content.toLowerCase().includes(lowercaseSearch)
    );
  });

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="animate-fadeIn">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">固定ページ</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredPages.length}件の固定ページ
              </p>
            </div>
            <Link
              href="/pages/new"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </Link>
          </div>

          {/* 検索バー */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="タイトルや本文で検索..."
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* ページリスト */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Image
                src="/empty-state.svg"
                alt="データなし"
                width={200}
                height={200}
                className="mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-500 text-lg">
                {searchTerm ? '検索結果がありません' : '固定ページがまだありません'}
              </p>
              {!searchTerm && (
                <Link
                  href="/pages/new"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700"
                >
                  最初の固定ページを作成
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      スラッグ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      表示順
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新日時
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {page.featuredImage && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <Image
                                src={page.featuredImage}
                                alt={page.featuredImageAlt || page.title}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded object-cover"
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {page.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{page.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{page.order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublished(page.id, page.isPublished)}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {page.isPublished ? '公開' : '下書き'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page.updatedAt.toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/pages/${page.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}

