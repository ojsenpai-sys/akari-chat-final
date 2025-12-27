// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// ★プライバシーポリシーの翻訳辞書
const TRANSLATIONS = {
  ja: {
    backToTop: "トップページに戻る",
    title: "プライバシーポリシー",
    sec1Title: "1. 収集する情報",
    sec1Content: "当サービスは、以下の情報を収集します。",
    sec1List: [
      "Googleアカウント情報（メールアドレス、ユーザー名、プロフィール画像）",
      "ユーザーが入力したテキストおよび画像データ",
      "決済に関する情報（Stripeを通じて処理され、当サービス内でカード情報は保持しません）"
    ],
    sec2Title: "2. 利用目的",
    sec2Content: "収集した情報は、以下の目的で利用します。",
    sec2List: [
      "本サービスの提供、維持、改善",
      "ユーザー認証およびサポート",
      "AIモデルとの対話生成",
      "不正利用の防止"
    ],
    sec3Title: "3. 第三者への提供",
    sec3Content: "当サービスは、ユーザーの同意がある場合や法令に基づく場合を除き、個人情報を第三者に提供しません。ただし、AI対話生成のために提携するAIプロバイダー（Google、OpenAI等）および決済処理のために決済代行業者（Stripe）へ、必要な範囲でデータが送信されます。",
    sec4Title: "4. データの安全性",
    sec4Content: "当サービスは、情報の漏洩、紛失を防ぐために適切なセキュリティ対策を講じます。通信はすべてSSL/TLSにより暗号化されます。",
    sec5Title: "5. お問い合わせ",
    sec5Content: "プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。",
  },
  en: {
    backToTop: "Back to Top",
    title: "Privacy Policy",
    sec1Title: "1. Information Collection",
    sec1Content: "This service collects the following information:",
    sec1List: [
      "Google Account Info (email, username, profile picture)",
      "Text and image data input by the user",
      "Payment information (processed via Stripe; card details are not stored on our servers)"
    ],
    sec2Title: "2. Purpose of Use",
    sec2Content: "The collected information is used for the following purposes:",
    sec2List: [
      "Provision, maintenance, and improvement of the service",
      "User authentication and support",
      "Generating conversations with AI models",
      "Prevention of unauthorized use"
    ],
    sec3Title: "3. Third-Party Sharing",
    sec3Content: "We do not provide personal information to third parties except with user consent or as required by law. However, data is transmitted to AI providers (Google, OpenAI, etc.) for conversation generation and to payment processors (Stripe) to the extent necessary.",
    sec4Title: "4. Data Security",
    sec4Content: "We implement appropriate security measures to prevent data leaks or loss. All communications are encrypted via SSL/TLS.",
    sec5Title: "5. Contact",
    sec5Content: "For inquiries regarding our Privacy Policy, please contact us at the following email address:",
  }
};

export default function PrivacyPage() {
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
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec1Title}</h2>
            <p>{t.sec1Content}</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              {t.sec1List.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec2Title}</h2>
            <p>{t.sec2Content}</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              {t.sec2List.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
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
            <p className="mt-2 text-pink-400 font-mono">ojsenpai@gmail.com</p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-white/10 text-center text-gray-600 text-xs font-mono">
           © 2025 Maid Akari Project.
        </footer>
      </div>
    </main>
  );
}