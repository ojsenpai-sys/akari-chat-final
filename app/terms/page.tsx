// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// ★利用規約の翻訳辞書
const TRANSLATIONS = {
  ja: {
    backToTop: "トップページに戻る",
    title: "利用規約",
    intro: "本サービス（以下「当サービス」）を利用する前に、以下の注意事項を必ずご確認ください。",
    sec1Title: "1. AIの回答精度と免責",
    sec1Content: "当サービスは生成AI技術を使用しています。キャラクター「あかり」の発言はフィクションであり、事実と異なる情報や架空の情報を話す場合があります（幻覚）。AIの発言内容によって生じた損害について、運営者は一切の責任を負いません。",
    sec2Title: "2. 会話データの扱い",
    sec2Content: "サービスの品質向上および会話履歴機能の提供のため、会話内容はデータベースに保存されます。これらを第三者に販売したり、無断で公開することはありません。",
    sec3Title: "3. 課金と返金",
    sec3Content: "有料プランは月額サブスクリプション方式です。いかなる場合も日割り計算による返金は行いません。API障害等による一時的な不具合への補償もいたしかねます。",
    sec4Title: "4. 禁止事項",
    sec4Content: "AIへの過度な暴言、性的・暴力的なコンテンツの生成誘導、スクレイピング等の自動アクセスを禁止します。違反時は予告なくアカウントを停止します。",
    sec5Title: "5. 年齢制限",
    sec5Content: "本サービスは13歳以上のご利用を推奨します。未成年者が有料プランを利用する場合は、親権者の同意を得たものとみなします。",
    sec6Title: "6. 知的財産権",
    sec6Content: "生成されたテキストの利用権はユーザーに帰属しますが、本サービスのキャラクター設定、画像、システムに関する権利は運営者に帰属します。",
  },
  en: {
    backToTop: "Back to Top",
    title: "Terms of Service",
    intro: "Please read the following terms and conditions carefully before using this service.",
    sec1Title: "1. AI Accuracy and Disclaimer",
    sec1Content: "This service uses generative AI technology. Messages from the character 'Akari' are fictional and may contain incorrect or fabricated information (hallucinations). The operator is not liable for any damages caused by AI-generated content.",
    sec2Title: "2. Handling of Conversation Data",
    sec2Content: "Conversation content is stored in a database to improve service quality and provide history features. We will never sell this data to third parties or disclose it without permission.",
    sec3Title: "3. Billing and Refunds",
    sec3Content: "Paid plans are monthly subscriptions. No pro-rated refunds will be given under any circumstances. No compensation will be provided for temporary issues caused by API failures or other factors.",
    sec4Title: "4. Prohibited Actions",
    sec4Content: "Excessive abuse toward the AI, inducing sexual or violent content, and automated access such as scraping are prohibited. Violations may result in account suspension without notice.",
    sec5Title: "5. Age Restriction",
    sec5Content: "This service is recommended for users aged 13 and older. Minors using paid plans are deemed to have obtained parental consent.",
    sec6Title: "6. Intellectual Property Rights",
    sec6Content: "Rights to generated text belong to the user, but rights to character settings, images, and the underlying system belong to the operator.",
  }
};

export default function TermsPage() {
  const [lang, setLang] = useState('ja');

  // ★ページ読み込み時にLocalStorageから言語設定を復元
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
          <p>{t.intro}</p>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec1Title}</h2>
            <p>{t.sec1Content}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec2Title}</h2>
            <p>{t.sec2Content}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec3Title}</h2>
            <p>{t.sec3Content}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec4Title}</h2>
            <p>{t.sec4Content}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec5Title}</h2>
            <p>{t.sec5Content}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec6Title}</h2>
            <p>{t.sec6Content}</p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-white/10 text-center text-gray-600 text-xs font-mono">
           © 2025 Maid Akari Project.
        </footer>
      </div>
    </main>
  );
}