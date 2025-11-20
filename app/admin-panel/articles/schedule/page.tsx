'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import FloatingInput from '@/components/admin/FloatingInput';
import FloatingSelect from '@/components/admin/FloatingSelect';
import TargetAudienceInput from '@/components/admin/TargetAudienceInput';
import { Category } from '@/types/article';
import { Writer } from '@/types/writer';
import { ArticlePattern } from '@/types/article-pattern';
import { ImagePromptPattern } from '@/types/image-prompt-pattern';
import { WritingStyle } from '@/types/writing-style';
import { useMediaTenant } from '@/contexts/MediaTenantContext';
import { apiGet } from '@/lib/api-client';

function ScheduledGenerationPageContent() {
  const router = useRouter();
  const { currentTenant } = useMediaTenant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [patterns, setPatterns] = useState<ArticlePattern[]>([]);
  const [writingStyles, setWritingStyles] = useState<WritingStyle[]>([]);
  const [imagePromptPatterns, setImagePromptPatterns] = useState<ImagePromptPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audienceHistory, setAudienceHistory] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    patternId: '',
    writerId: '',
    writingStyleId: '',
    imagePromptPatternId: '',
    targetAudience: '',
    daysOfWeek: [] as string[],
    timeOfDay: '',
    timezone: 'Asia/Tokyo',
    isActive: true,
  });
  const [generatingAudience, setGeneratingAudience] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTenant?.id) return;
      
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          apiGet<Category[]>(`/api/admin/categories`),
          apiGet<Writer[]>(`/api/admin/writers`),
          fetch('/api/admin/article-patterns', {
            headers: { 'x-media-id': currentTenant.id },
          }).then(res => res.json()),
          fetch('/api/admin/writing-styles', {
            headers: { 'x-media-id': currentTenant.id },
          }).then(res => res.json()),
          fetch('/api/admin/image-prompt-patterns', {
            headers: { 'x-media-id': currentTenant.id },
          }).then(res => res.json()),
          fetch('/api/admin/target-audience-history', {
            headers: { 'x-media-id': currentTenant.id },
          }).then(res => res.json()),
          fetch('/api/admin/scheduled-generations', {
            headers: { 'x-media-id': currentTenant.id },
          }).then(res => res.json()),
        ]);

        const categoriesData = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [];
        const writersData = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
        const patternsResponse = results[2].status === 'fulfilled' ? results[2].value : { patterns: [] };
        const writingStylesResponse = results[3].status === 'fulfilled' ? results[3].value : { styles: [] };
        const imagePromptPatternsResponse = results[4].status === 'fulfilled' ? results[4].value : { patterns: [] };
        const audienceHistoryData = results[5].status === 'fulfilled' ? results[5].value : { history: [] };
        const schedulesResponse = results[6].status === 'fulfilled' ? results[6].value : { schedules: [] };

        setCategories(categoriesData);
        setWriters(writersData);
        setPatterns(Array.isArray(patternsResponse.patterns) ? patternsResponse.patterns : []);
        setWritingStyles(Array.isArray(writingStylesResponse.styles) ? writingStylesResponse.styles : []);
        setImagePromptPatterns(Array.isArray(imagePromptPatternsResponse.patterns) ? imagePromptPatternsResponse.patterns : []);
        setAudienceHistory(Array.isArray(audienceHistoryData?.history) ? audienceHistoryData.history : []);

        // 既存の設定があれば読み込む
        const existingSchedules = Array.isArray(schedulesResponse?.schedules) ? schedulesResponse.schedules : [];
        if (existingSchedules.length > 0) {
          const schedule = existingSchedules[0];
          setFormData({
            name: schedule.name || '',
            categoryId: schedule.categoryId || '',
            patternId: schedule.patternId || '',
            writerId: schedule.writerId || '',
            writingStyleId: schedule.writingStyleId || '',
            imagePromptPatternId: schedule.imagePromptPatternId || '',
            targetAudience: schedule.targetAudience || '',
            daysOfWeek: schedule.daysOfWeek || [],
            timeOfDay: schedule.timeOfDay || '',
            timezone: schedule.timezone || 'Asia/Tokyo',
            isActive: schedule.isActive ?? true,
          });
        } else {
          // デフォルト値を設定
          const defaultValues: any = {
            timezone: 'Asia/Tokyo',
            isActive: true,
          };
          
          // カテゴリーが1つしかない場合、自動的に選択
          if (categoriesData.length === 1) {
            defaultValues.categoryId = categoriesData[0].id;
          }
          // ライターが1つしかない場合、自動的に選択
          if (writersData.length === 1) {
            defaultValues.writerId = writersData[0].id;
          }
          // 構成パターンが1つしかない場合、自動的に選択
          if (Array.isArray(patternsResponse.patterns) && patternsResponse.patterns.length === 1) {
            defaultValues.patternId = patternsResponse.patterns[0].id;
          }
          // ライティングスタイルが1つしかない場合、自動的に選択
          if (Array.isArray(writingStylesResponse.styles) && writingStylesResponse.styles.length === 1) {
            defaultValues.writingStyleId = writingStylesResponse.styles[0].id;
          }
          // 画像プロンプトパターンが1つしかない場合、自動的に選択
          if (Array.isArray(imagePromptPatternsResponse.patterns) && imagePromptPatternsResponse.patterns.length === 1) {
            defaultValues.imagePromptPatternId = imagePromptPatternsResponse.patterns[0].id;
          }
          
          setFormData(prev => ({ ...prev, ...defaultValues }));
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('データの読み込みに失敗しました。');
        setCategories([]);
        setWriters([]);
        setPatterns([]);
        setImagePromptPatterns([]);
        setAudienceHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentTenant?.id]);

  const handleDeleteAudienceHistory = async (audience: string) => {
    if (!currentTenant?.id) return;
    try {
      const response = await fetch(`/api/admin/target-audience-history?targetAudience=${encodeURIComponent(audience)}`, {
        method: 'DELETE',
        headers: { 'x-media-id': currentTenant.id },
      });
      if (!response.ok) throw new Error('履歴の削除に失敗しました');
      const data = await response.json();
      setAudienceHistory(data.history || []);
    } catch (error) {
      console.error('Failed to delete audience history:', error);
      setError('履歴の削除に失敗しました。');
    }
  };

  const handleGenerateTargetAudience = async () => {
    if (!formData.categoryId) {
      alert('カテゴリーを先に選択してください');
      return;
    }
    setGeneratingAudience(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/articles/generate-target-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-media-id': currentTenant?.id || '' },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          excludeHistory: audienceHistory,
        }),
      });
      if (!response.ok) throw new Error('想定読者の生成に失敗しました');
      const data = await response.json();
      setFormData(prev => ({ ...prev, targetAudience: data.targetAudience }));

      if (!audienceHistory.includes(data.targetAudience)) {
        setAudienceHistory(prev => [data.targetAudience, ...prev].slice(0, 20));
        fetch('/api/admin/target-audience-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-media-id': currentTenant?.id || '' },
          body: JSON.stringify({ targetAudience: data.targetAudience }),
        }).catch(err => console.error('Failed to save target audience history:', err));
      }
    } catch (err: any) {
      console.error('Error generating target audience:', err);
      setError(err.message || '想定読者の生成中にエラーが発生しました。');
    } finally {
      setGeneratingAudience(false);
    }
  };

  const handleSave = async () => {
    const missingFields: string[] = [];
    if (!formData.name) missingFields.push('設定名');
    if (!formData.categoryId) missingFields.push('カテゴリー');
    if (!formData.patternId) missingFields.push('構成パターン');
    if (!formData.writerId) missingFields.push('ライター');
    if (!formData.writingStyleId) missingFields.push('ライティングスタイル');
    if (!formData.imagePromptPatternId) missingFields.push('画像プロンプトパターン');
    if (!formData.daysOfWeek || formData.daysOfWeek.length === 0) missingFields.push('曜日');
    if (!formData.timeOfDay) missingFields.push('時刻');

    if (missingFields.length > 0) {
      setError(`以下の項目を入力してください: ${missingFields.join('、')}`);
      return;
    }

    setSaving(true);
    setError(null);

    if (!currentTenant?.id) {
      setError('メディアテナントが選択されていません。');
      setSaving(false);
      return;
    }

    try {
      const { targetAudience, ...requestData } = formData;
      
      const response = await fetch('/api/admin/scheduled-generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-media-id': currentTenant.id,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '設定の保存に失敗しました。');
      }

      alert('定期生成設定を保存しました！');
      router.push('/admin-panel/articles');
    } catch (err: any) {
      console.error('Error saving scheduled generation:', err);
      setError(err.message || '設定の保存中にエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin-panel/articles');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">データを読み込んでいます...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const dayOptions = [
    { value: '0', label: '日曜日' },
    { value: '1', label: '月曜日' },
    { value: '2', label: '火曜日' },
    { value: '3', label: '水曜日' },
    { value: '4', label: '木曜日' },
    { value: '5', label: '金曜日' },
    { value: '6', label: '土曜日' },
  ];

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: `${i.toString().padStart(2, '0')}:00`,
    label: `${i.toString().padStart(2, '0')}:00`,
  }));

  return (
    <AdminLayout>
      {loading ? null : (
        <div className="max-w-4xl pb-32 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <FloatingInput
              label="設定名 *"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />

            <FloatingSelect
              label="カテゴリー *"
              value={formData.categoryId}
              onChange={(value) => setFormData({ ...formData, categoryId: value })}
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              required
            />

            <FloatingSelect
              label="構成パターン *"
              value={formData.patternId}
              onChange={(value) => setFormData({ ...formData, patternId: value })}
              options={patterns.map(p => ({ value: p.id, label: p.name }))}
              required
            />

            <FloatingSelect
              label="ライター *"
              value={formData.writerId}
              onChange={(value) => setFormData({ ...formData, writerId: value })}
              options={writers.map(w => ({ value: w.id, label: w.handleName }))}
              required
            />

            <FloatingSelect
              label="ライティングスタイル *"
              value={formData.writingStyleId}
              onChange={(value) => setFormData({ ...formData, writingStyleId: value })}
              options={writingStyles.map(s => ({ value: s.id, label: s.name }))}
              required
            />

            <FloatingSelect
              label="画像プロンプトパターン *"
              value={formData.imagePromptPatternId}
              onChange={(value) => setFormData({ ...formData, imagePromptPatternId: value })}
              options={imagePromptPatterns.map(p => ({ value: p.id, label: p.name }))}
              required
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <TargetAudienceInput
                  value={formData.targetAudience}
                  onChange={(value) => setFormData({ ...formData, targetAudience: value })}
                  history={audienceHistory}
                  onDeleteHistory={handleDeleteAudienceHistory}
                  label="想定読者（ペルソナ）"
                  required={false}
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateTargetAudience}
                disabled={!formData.categoryId || generatingAudience}
                className="w-12 h-12 mb-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="AIで想定読者を自動生成"
              >
                {generatingAudience ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Image src="/ai.svg" alt="AI" width={20} height={20} className="brightness-0 invert" />
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">曜日 *</label>
              <div className="grid grid-cols-2 gap-2">
                {dayOptions.map((day) => (
                  <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek.includes(day.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, daysOfWeek: [...formData.daysOfWeek, day.value] });
                        } else {
                          setFormData({ ...formData, daysOfWeek: formData.daysOfWeek.filter(d => d !== day.value) });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <FloatingSelect
              label="時刻 *"
              value={formData.timeOfDay}
              onChange={(value) => setFormData({ ...formData, timeOfDay: value })}
              options={hourOptions}
              required
            />
          </div>

          {/* フローティングボタン */}
          <div className="fixed bottom-8 right-8 flex items-center gap-4 z-50">
            {/* キャンセルボタン */}
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white w-14 h-14 rounded-full hover:bg-gray-600 transition-all hover:scale-110 flex items-center justify-center"
              title="キャンセル"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 保存ボタン */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white w-14 h-14 rounded-full hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="設定を保存"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function ScheduledGenerationPage() {
  return (
    <AuthGuard>
      <ScheduledGenerationPageContent />
    </AuthGuard>
  );
}

