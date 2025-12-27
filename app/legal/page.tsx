// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// ★特定商取引法に基づく表記の翻訳辞書
const TRANSLATIONS = {
  ja: {
    backToTop: "トップページに戻る",
    title: "特定商取引法に基づく表記",
    // 項目名
    seller: "販売業者",
    representative: "運営統括責任者",
    address: "所在地",
    phone: "電話番号",
    phoneNote: "※お問い合わせは原則としてメールにて承っております。",
    email: "メールアドレス",
    price: "販売価格",
    priceContent: "各プラン申し込みページに表示された金額（表示価格は消費税込み）",
    additionalFees: "商品代金以外の必要料金",
    feesContent: "サイト閲覧・利用時のインターネット接続料金、通信料金",
    paymentMethod: "お支払い方法",
    paymentMethodContent: "クレジットカード決済（Stripe）",
    paymentTime: "代金の支払時期",
    paymentTimeContent: "初回申込時、および翌月以降の毎月同日に請求されます。",
    deliveryTime: "商品の引渡時期",
    deliveryTimeContent: "決済完了後、直ちにご利用いただけます。",
    cancelPolicy: "返品・キャンセルについて",
    cancelContent: "デジタルコンテンツの性質上、決済完了後の返品・返金・キャンセルはお受けしておりません。解約をご希望の場合は、次回更新日の前日までにマイページよりお手続きをお願いいたします。日割りでの返金は行いません。",
  },
  en: {
    backToTop: "Back to Top",
    title: "Legal Disclosure",
    // 項目名
    seller: "Distributor",
    representative: "Operation Manager",
    address: "Address",
    phone: "Phone Number",
    phoneNote: "*In principle, inquiries are accepted via email.",
    email: "Email Address",
    price: "Selling Price",
    priceContent: "Prices shown on the application page for each plan (includes consumption tax).",
    additionalFees: "Additional Charges",
    feesContent: "Internet connection fees and data communication charges required for use.",
    paymentMethod: "Payment Method",
    paymentMethodContent: "Credit Card (via Stripe)",
    paymentTime: "Payment Timing",
    paymentTimeContent: "Charged at initial signup and on the same day monthly thereafter.",
    deliveryTime: "Service Delivery",
    deliveryTimeContent: "Services are available immediately after payment completion.",
    cancelPolicy: "Returns and Cancellations",
    cancelContent: "Due to the nature of digital content, returns, refunds, or cancellations are not accepted after payment. To cancel your subscription, please complete the process via your account page by the day before the next renewal date. No pro-rated refunds will be provided.",
  }
};

export default function LegalPage() {
  const [lang, setLang] = useState('ja');

  // ★LocalStorageから言語設定を復元
  useEffect(() => {
    const savedLang = localStorage.getItem('akari_lang');
    if (savedLang && TRANSLATIONS[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const t = TRANSLATIONS[lang];

  return (
    <main className="min-h-screen bg-black text-gray-300 p-6 md:p-12 font-sans text-left">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー：戻るボタン */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            {t.backToTop}
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-10 border-b border-gray-700 pb-4">
          {t.title}
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          {/* 1. 事業者情報 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.seller}</h2>
            <p>古川朋久</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.representative}</h2>
            <p>古川朋久</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.address}</h2>
            <p>
              〒150-0043<br/>
              {lang === 'ja' 
                ? "東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F−C" 
                : "2F-C Shibuya Dogenzaka Tokyu Building, 1-10-8 Dogenzaka, Shibuya-ku, Tokyo, 150-0043, Japan"}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.phone}</h2>
            <p>
              080-4737-7505<br/>
              <span className="text-xs text-gray-500">{t.phoneNote}</span>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.email}</h2>
            <p>ojsenpai@gmail.com</p>
          </section>

          {/* 2. 商品・支払い情報 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.price}</h2>
            <p>{t.priceContent}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.additionalFees}</h2>
            <p>{t.feesContent}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.paymentMethod}</h2>
            <p>{t.paymentMethodContent}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.paymentTime}</h2>
            <p>{t.paymentTimeContent}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.deliveryTime}</h2>
            <p>{t.deliveryTimeContent}</p>
          </section>

          {/* 3. キャンセルポリシー */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.cancelPolicy}</h2>
            <p>{t.cancelContent}</p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-white/10 text-center text-gray-600 text-xs font-mono">
           © 2025 Maid Akari Project.
        </footer>
      </div>
    </main>
  );
}