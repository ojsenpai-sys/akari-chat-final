// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          利用規約
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <p>本サービス（以下「当サービス」）を利用する前に、以下の注意事項を必ずご確認ください。</p>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. AIの回答精度と免責</h2>
            <p>当サービスは生成AI技術を使用しています。キャラクター「あかり」の発言はフィクションであり、事実と異なる情報や架空の情報を話す場合があります（幻覚）。AIの発言内容によって生じた損害について、運営者は一切の責任を負いません。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. 会話データの扱い</h2>
            <p>サービスの品質向上および会話履歴機能の提供のため、会話内容はデータベースに保存されます。これらを第三者に販売したり、無断で公開することはありません。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. 課金と返金</h2>
            <p>有料プランは月額サブスクリプション方式です。いかなる場合も日割り計算による返金は行いません。API障害等による一時的な不具合への補償もいたしかねます。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. 禁止事項</h2>
            <p>AIへの過度な暴言、性的・暴力的なコンテンツの生成誘導、スクレイピング等の自動アクセスを禁止します。違反時は予告なくアカウントを停止します。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. 年齢制限</h2>
            <p>本サービスは13歳以上のご利用を推奨します。未成年者が有料プランを利用する場合は、親権者の同意を得たものとみなします。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. 知的財産権</h2>
            <p>生成されたテキストの利用権はユーザーに帰属しますが、本サービスのキャラクター設定、画像、システムに関する権利は運営者に帰属します。</p>
          </section>
        </div>
      </div>
    </main>
  );
}