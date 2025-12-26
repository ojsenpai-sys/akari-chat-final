// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-black text-gray-300 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー：戻るボタン */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            トップページに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-10 border-b border-gray-700 pb-4">
          特定商取引法に基づく表記
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          {/* 1. 事業者情報 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">販売業者</h2>
            <p>古川朋久</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">運営統括責任者</h2>
            <p>古川朋久</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">所在地</h2>
            <p>
              〒150-0043<br/>
              東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F−C
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">電話番号</h2>
            <p>
              080-4737-7505<br/>
              <span className="text-xs text-gray-500">※お問い合わせは原則としてメールにて承っております。</span>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">メールアドレス</h2>
            <p>ojsenpai@gmail.com</p>
          </section>

          {/* 2. 商品・支払い情報 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">販売価格</h2>
            <p>各プラン申し込みページに表示された金額（表示価格は消費税込み）</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">商品代金以外の必要料金</h2>
            <p>サイト閲覧・利用時のインターネット接続料金、通信料金</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">お支払い方法</h2>
            <p>クレジットカード決済（Stripe）</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">代金の支払時期</h2>
            <p>初回申込時、および翌月以降の毎月同日に請求されます。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">商品の引渡時期</h2>
            <p>決済完了後、直ちにご利用いただけます。</p>
          </section>

          {/* 3. キャンセルポリシー */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">返品・キャンセルについて</h2>
            <p>
              デジタルコンテンツの性質上、決済完了後の返品・返金・キャンセルはお受けしておりません。<br/>
              解約をご希望の場合は、次回更新日の前日までにマイページよりお手続きをお願いいたします。日割りでの返金は行いません。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}