// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-gray-300 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            トップページに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-10 border-b border-gray-700 pb-4">
          プライバシーポリシー
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. 収集する情報</h2>
            <p>当サービスは、以下の情報を収集します。</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Googleアカウント情報（メールアドレス、ユーザー名、プロフィール画像）</li>
              <li>ユーザーが入力したテキストおよび画像データ</li>
              <li>決済に関する情報（Stripeを通じて処理され、当サービス内でカード情報は保持しません）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. 利用目的</h2>
            <p>収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>本サービスの提供、維持、改善</li>
              <li>ユーザー認証およびサポート</li>
              <li>AIモデルとの対話生成</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. 第三者への提供</h2>
            <p>
              当サービスは、ユーザーの同意がある場合や法令に基づく場合を除き、個人情報を第三者に提供しません。<br/>
              ただし、AI対話生成のために提携するAIプロバイダー（OpenAI等）および決済処理のために決済代行業者（Stripe）へ、必要な範囲でデータが送信されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. データの安全性</h2>
            <p>当サービスは、情報の漏洩、紛失を防ぐために適切なセキュリティ対策を講じます。通信はすべてSSL/TLSにより暗号化されます。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. お問い合わせ</h2>
            <p>プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。</p>
            <p className="mt-2 text-pink-400">ojsenpai@gmail.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}