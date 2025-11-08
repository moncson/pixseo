import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ふらっとについて | ふらっと。メディアサイト',
  description: '障害当事者も一緒に創る、あなたの日常に寄り添うバリアフリー情報サイト「ふらっと。」について',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">ふらっと。について</h1>
          <p className="text-xl opacity-90">
            障害当事者も一緒に創る、あなたの日常に寄り添うバリアフリー情報サイト
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ふらっと。とは */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">ふらっと。とは</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              「ふらっと。」は、障害のある方やご高齢の方、そしてその家族が、日常生活の中で直面する様々な課題を解決するための情報を提供するメディアサイトです。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              バリアフリー対応の店舗・施設情報、旅行やおでかけの情報、制度の解説、便利なサービスの紹介など、
              「知りたい」「行きたい」「やってみたい」を実現するための情報を、障害当事者の視点も交えながらお届けしています。
            </p>
          </div>
        </section>

        {/* 運営について */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">運営について</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              ふらっと。は、一般社団法人Ayumiが運営しています。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ayumiは、バリアフリー認証サービス「Barrier-Free Partner」の提供や、
              企業・店舗向けの合理的配慮コンサルティング、障害者雇用支援などを通じて、
              誰もが自分らしく生きられる社会の実現を目指しています。
            </p>
            <div className="mt-6">
              <Link
                href="https://the-ayumi.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Ayumi公式サイトはこちら
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ふらっと。の特徴 */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">ふらっと。の特徴</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">当事者目線の情報</h3>
              <p className="text-gray-700">
                障害当事者や支援者の実体験に基づいた、リアルで役立つ情報をお届けします。
              </p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">バリアフリー認証店</h3>
              <p className="text-gray-700">
                Ayumiが独自に審査・認証したバリアフリー対応店舗の情報を掲載しています。
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">豊富なカテゴリー</h3>
              <p className="text-gray-700">
                旅行・観光、飲食店、制度情報、サービス紹介など、多彩なジャンルをカバー。
              </p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">検索機能が充実</h3>
              <p className="text-gray-700">
                キーワード検索、カテゴリー・タグ検索で、欲しい情報がすぐに見つかります。
              </p>
            </div>
          </div>
        </section>

        {/* 掲載情報のカテゴリー */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">掲載情報のカテゴリー</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">📍 Ayumiの推奨店舗・施設</h3>
              <p className="text-sm text-gray-700">バリアフリー認証を受けた店舗・施設の詳細情報</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">🗺️ 旅行/観光</h3>
              <p className="text-sm text-gray-700">車椅子でも楽しめる観光スポットやお出かけ情報</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">🏨 旅館/ホテル</h3>
              <p className="text-sm text-gray-700">バリアフリー対応の宿泊施設情報</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">🍴 飲食店</h3>
              <p className="text-sm text-gray-700">車椅子でも入りやすいレストラン・カフェ情報</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">📖 制度情報</h3>
              <p className="text-sm text-gray-700">障害者手帳、福祉制度などの解説</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">💡 ライフハック</h3>
              <p className="text-sm text-gray-700">日常生活を便利にするヒントやアイデア</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">🛍️ サービス/商品紹介</h3>
              <p className="text-sm text-gray-700">便利なサービスやバリアフリー商品の紹介</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">💪 障害と向き合う挑戦者</h3>
              <p className="text-sm text-gray-700">障害を持ちながら活躍する方々のストーリー</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">💼 雇用/就労支援</h3>
              <p className="text-sm text-gray-700">障害者雇用や就労支援に関する情報</p>
            </div>
          </div>
        </section>

        {/* お問い合わせ・リクエスト */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">お問い合わせ・リクエスト</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              「こんな情報が欲しい」「この場所について知りたい」など、
              記事のリクエストや質問がございましたら、お気軽にお寄せください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href="/media/request"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                記事リクエストを送る
              </Link>
              <Link
                href="https://the-ayumi.jp/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </section>

        {/* 支援のお願い */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">支援のお願い</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Ayumiは、障害者や障害者の家族が抱える課題を解決するために活動しています。
              皆様のご支援が、誰もが自分らしく生きられる社会の実現につながります。
            </p>
            <div className="mt-6">
              <Link
                href="https://the-ayumi.jp/donate/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-bold text-lg"
              >
                寄付で支援する
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

