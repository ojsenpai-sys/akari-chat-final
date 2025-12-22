'use client';

import React from 'react';
import { Check, Star, Zap, Crown, PlusCircle, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Stripeの商品リンク
const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment' = 'subscription') => {
  if (!priceId) return;

  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId, mode, planName: getPlanNameFromPriceId(priceId) }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // Stripeの決済画面へ移動
    } else {
      alert('決済の準備に失敗しました');
    }
  } catch (err) {
    console.error(err);
    alert('通信エラーが発生しました');
  }
};

// ヘルパー関数: IDからプラン名を逆引き（APIに渡すため）
const getPlanNameFromPriceId = (priceId: string) => {
  if (priceId === 'price_1Sh2k1LdS36oSDkePyDTrveV') return 'PRO';
  if (priceId === 'price_1Sh2nrLdS36oSDkeYNke8mys') return 'ROYAL';
  return '';
};

export default function PlansPage() {
  const { data: session } = useSession();

  // プラン定義
  const plans = [
    {
      name: 'Free Plan',
      price: '無料',
      icon: <Star className="text-gray-400" size={32} />,
      features: [
        '会話 1日20回まで',
        '基本衣装（メイド服）',
        '最新AI (Gemini 3 Pro) 搭載',
      ],
      color: 'gray',
      buttonText: '現在のプラン',
      disabled: true, 
    },
    {
      name: 'Pro Plan',
      price: '月額 980円',
      priceId: 'price_1Sh2k1LdS36oSDkePyDTrveV', // ★Pro ID
      icon: <Zap className="text-yellow-400" size={32} />,
      features: [
        '会話 1日200回まで大幅UP',
        '水着・バニー衣装 解放',
        '親密度・プレゼント機能 解放',
        '毎日300ポイント付与',
      ],
      note: '※ポイントはプレゼント購入に使用します',
      color: 'yellow',
      buttonText: 'Proにアップグレード',
      highlight: false,
    },
    {
      name: 'Royal Plan',
      price: '月額 5,000円',
      priceId: 'price_1Sh2nrLdS36oSDkeYNke8mys', // ★Royal ID
      icon: <Crown className="text-pink-500" size={32} />,
      features: [
        '会話 1日2,500回 (実質無制限)',
        '全衣装解放（サンタ含む）',
        'ロイヤル専用 背景＆演出',
        '毎日500ポイント付与',
        '呼び名変更機能',
      ],
      note: '※ポイントはプレゼント購入に使用します',
      color: 'pink',
      buttonText: 'Royalにアップグレード',
      highlight: true, 
    },
  ];

  // 追加チケット定義
  const ticket = {
    name: '会話チケット (+100回)',
    price: '500円 / 回',
    priceId: 'price_1Sh2pJLdS36oSDkeqOJxJU8x', // ★Ticket ID
    desc: 'プランの上限に達しても、もっと話したい時に。購入分は翌日以降も繰り越されます。',
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* --- ヘッダー --- */}
        <h1 className="text-4xl font-bold mb-4 text-pink-500">料金プランを選択</h1>
        <p className="text-gray-400 mb-12">あかりともっと親密になれる、特別なプランをご用意しました。</p>

        {/* --- サブスクリプションプラン一覧 --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`
                relative rounded-2xl p-8 border backdrop-blur-sm transition-transform hover:scale-105 flex flex-col
                ${plan.highlight 
                  ? 'bg-gradient-to-b from-pink-900/40 to-black border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]' 
                  : 'bg-gray-900/60 border-gray-700'
                }
              `}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  おすすめ！
                </div>
              )}

              <div className="flex justify-center mb-4">{plan.icon}</div>
              <h3 className={`text-2xl font-bold mb-2 text-${plan.color}-400`}>{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>

              <ul className="text-left space-y-3 mb-6 text-sm text-gray-300 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={18} className={`text-${plan.color}-500 shrink-0`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.note && (
                <p className="text-xs text-gray-500 mb-6 text-left bg-black/30 p-2 rounded">
                  {plan.note}
                </p>
              )}

              <button
                onClick={() => plan.priceId && handleCheckout(plan.priceId, 'subscription')}
                disabled={plan.disabled}
                className={`
                  w-full py-3 rounded-full font-bold transition-colors
                  ${plan.disabled 
                    ? 'bg-gray-800 text-gray-500 cursor-default' 
                    : plan.highlight 
                      ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg' 
                      : 'bg-white text-black hover:bg-gray-200'
                  }
                `}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* --- チケット購入エリア --- */}
        <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-700 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <MessageCircle className="text-yellow-400" />
                もっとお話ししたいですか？
              </h3>
              <p className="text-gray-400 text-sm mb-1">{ticket.desc}</p>
              <p className="text-xs text-gray-500">※チケットは無期限で繰り越されます。</p>
            </div>
            
            <div className="flex flex-col items-center gap-2 shrink-0">
               <span className="text-2xl font-bold text-yellow-400">{ticket.price}</span>
               <button
                  onClick={() => handleCheckout(ticket.priceId, 'payment')}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
               >
                 <PlusCircle size={20} />
                 {ticket.name}を購入
               </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-gray-500 text-sm">
          <p>※いつでも解約可能です。日割り計算による返金は行われません。</p>
          <a href="/" className="text-pink-400 hover:underline mt-4 inline-block">← トップページに戻る</a>
        </div>
      </div>
    </div>
  );
}