// @ts-nocheck
"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { 
  Send, Settings, Shirt, LogOut, FileText, X, Gift, Heart, 
  ShoppingCart, Crown, Zap, Paperclip, Image as ImageIcon, 
  Check, Star, Layout 
} from 'lucide-react'; 
import VisualNovelDisplay from './VisualNovelDisplay';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation'; 

// ★マスタデータ（一切変更・削除なし）
const GIFT_ITEMS = [
  { id: 'letter', name: '手紙', price: 100, love: 1, reaction: '「ご主人様、ありがとうございます。大切に読ませていただきますね」' },
  { id: 'tea', name: '紅茶', price: 100, love: 1, reaction: '「私の好きな茶葉、覚えてくれてたんですね！うれしいです。ではティータイムにしましょう！」' },
  { id: 'shortcake', name: 'ショートケーキ', price: 300, love: 3, reaction: '「わぁっ、甘いもの大好きです！ご主人様、一緒に食べましょ？」' },
  { id: 'pancake', name: 'パンケーキ', price: 300, love: 3, reaction: '「このパンケーキは、あの行列店のやつじゃないですか⁉…私のために並んでくれたんですね。感激です！」' },
  { id: 'anime_dvd', name: 'アニメDVD', price: 600, love: 6, reaction: '「えっ、これ見たかったやつです！…今夜、私の部屋で上映会…します？」' },
  { id: 'game_rpg', name: 'ゲームソフト（RPG）', price: 1000, love: 10, reaction: '「私が欲しかった大作RPGじゃないですか！いただけるんですかっ⁉感激です…これで今日は徹夜確定ですが、ご主人様も一緒にどうですか？？」' },
  { id: 'game_fight', name: 'ゲームソフト（格闘）', price: 1000, love: 10, reaction: '「これはいにしえの対戦格闘ゲーム！ふふふ、ご主人様といえど手加減はしませんことよ？」' },
  { id: 'accessory', name: '高級アクセサリー', price: 2000, love: 20, reaction: '「んっ…こ、こんな高価なもの…いいんですか？…一生大切にします！私、アクセサリとかあまり付けないので…変じゃないでしょうか…？」' },
  { id: 'bag', name: '高級バッグ', price: 2000, love: 20, reaction: '「こ、こんなに高価なバッグ、いただいてよろしいのでしょうか…？私に似合いますかね？ご主人様のお気持ち、本当にうれしいです」' },
  { id: 'esthe', name: '高級エステチケット', price: 3000, love: 30, reaction: '「エステですかっ⁉もっときれいになってご主人様の隣にいても恥ずかしくないようにならないとですね！私、ご主人様に似合う専属メイドになりますっ！」' },
  { id: 'ring', name: '指輪', price: 5000, love: 50, reaction: '「えっ…この指輪って…そういうこと…ですかね？とても嬉しくて言葉が見つからないです…私、一生ご主人様…アナタのそばで尽くさせていただきますわ。…ねぇ、ダーリンって呼んでもいい？？」' },
];

function HomeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<'casual' | 'professional'>('casual');
  const [messages, setMessages] = useState([]);
  const [localInput, setLocalInput] = useState('');
  const [userName, setUserName] = useState('ご主人様');
  const [tempName, setTempName] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showCostume, setShowCostume] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);

  const [currentOutfit, setCurrentOutfit] = useState('maid');
  const [currentPlan, setCurrentPlan] = useState('FREE'); 
  const [points, setPoints] = useState(0);
  const [affection, setAffection] = useState(0);

  // 実務モード用UI（スクロールバー・イラスト修正）
  const ProfessionalUI = () => (
    <div className="flex h-full w-full bg-[#fcfcfc] text-slate-700 font-sans animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col border-r border-gray-200 min-h-0"> 
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
          <span className="font-bold flex items-center gap-2 text-slate-600"><FileText size={18} className="text-blue-500" /> 業務支援ログ</span>
          <span className="text-[10px] text-gray-400 font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
        {/* ★修正：実務モードのログのみを表示 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white custom-scrollbar">
          {messages.filter(m => m.mode === 'professional').map((m, i) => (
            <div key={i} className={`p-4 rounded-xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'bg-slate-50 border border-slate-200'}`}>
              <p className="text-[9px] font-bold mb-1 opacity-40 uppercase tracking-widest">{m.role === 'assistant' ? 'Akari' : 'User'}</p>
              <p className="whitespace-pre-wrap">{m.content.replace(/\[.*?\]/g, '')}</p>
            </div>
          ))}
          {isLoading && <div className="text-[10px] text-blue-400 animate-pulse px-4">思考中...</div>}
        </div>
      </div>
      <div className="w-72 bg-slate-50 flex flex-col items-center justify-end p-6 border-l border-gray-100 shrink-0">
        <div className="mb-6 text-center opacity-60">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Partner</p>
          <p className="text-xs font-medium text-slate-600 italic">Akari</p>
        </div>
        {/* ★修正：イラスト消滅を解決 */}
        <img 
          src={currentOutfit === 'swimsuit' ? "/images/akari_swimsuit_normal.png" : "/akari_normal.png"} 
          alt="あかり" 
          className="max-h-[60vh] object-contain opacity-80 hover:opacity-100 transition-all duration-700" 
        />
      </div>
    </div>
  );

  const handleCheckout = async (plan) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.error) { alert("エラー: " + data.error); return; }
      if (data.url) { window.location.href = data.url; }
    } catch (err) { alert("通信エラーが発生しました"); }
  };

  useEffect(() => {
    if (searchParams.get('success')) {
      setNotification("🎉 ありがとうございます！プランが更新されました！");
      setTimeout(() => setNotification(null), 8000);
      router.replace('/');
    }
    if (searchParams.get('canceled')) {
      setNotification("決済がキャンセルされました");
      setTimeout(() => setNotification(null), 5000);
      router.replace('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/sync')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setPoints(data.points);
            setAffection(data.affection);
            setCurrentPlan(data.plan);
            
            // ★深夜制限を同期時にも適用（23時〜6時）
            const hour = new Date().getHours();
            if (hour >= 23 || hour < 6) {
                setCurrentOutfit('swimsuit');
            } else {
                setCurrentOutfit(data.currentOutfit);
            }

            if (data.bonusMessage) {
              setNotification(data.bonusMessage);
              setTimeout(() => setNotification(null), 5000); 
            }
          }
        });
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && messages.length === 0) {
       setMessages([
        { 
          id: 'welcome', 
          role: 'assistant', 
          content: `[笑顔]おかえりなさいませ、${userName}！認証完了、お疲れ様でした。さあ、二人きりの時間ですわ！`,
          mode: 'casual'
        }
      ]);
    }
  }, [status, messages.length, userName]);

  const openSettings = () => { setTempName(userName); setShowSettings(!showSettings); };

  const saveName = () => {
    const plan = currentPlan.toUpperCase();
    if (plan === 'FREE') {
      setShowSettings(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[悲しみ]申し訳ございません…。お名前の変更は、有料プランのご主人様だけの特典なんです。`, mode: 'casual' }]);
      return; 
    }
    setUserName(tempName); setShowSettings(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[照れ]承知いたしました。これからは「${tempName}」とお呼びしますね。`, mode: 'casual' }]);
  };

  const giveGift = async (item) => {
    if (points < item.price) { alert("ポイントが足りません！"); return; }
    try {
        const res = await fetch('/api/user/gift', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cost: item.price, affectionGain: item.love }),
        });
        const data = await res.json();
        if (!res.ok) return;
        setPoints(data.points); setAffection(data.affection); setShowGift(false);
        const isLove = data.affection >= 100;
        let rx = (isLove ? "[照れ]" : "[笑顔]") + item.reaction;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: rx, mode: 'casual' }]);
    } catch (err) { alert('通信エラーが発生しました'); }
  };

  // ★深夜の衣装制限ガード追加
  const changeOutfit = async (newOutfit) => {
    const hour = new Date().getHours();
    if ((hour >= 23 || hour < 6) && newOutfit !== 'swimsuit') {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[照れ]ご主人様、もう夜も更けていますし……今はルームウェアのままでいさせてくださいな。`, mode: 'casual' }]);
      setShowCostume(false); return;
    }

    if (newOutfit === 'swimsuit' || newOutfit === 'bunny') {
      if (currentPlan === 'FREE') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[悲しみ]申し訳ございません…。そちらは特別な衣装になりますので、有料プランのご主人様限定なんです。`, mode: 'casual' }]);
        setShowCostume(false); return;
      }
    }
    if (newOutfit === 'santa' || newOutfit === 'kimono') {
      if (currentPlan !== 'ROYAL') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[照れ]ごめんなさい…。それはロイヤルプランのご主人様だけの特別な衣装なんです。`, mode: 'casual' }]);
        setShowCostume(false); return;
      }
    }
    try {
        await fetch('/api/user/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outfit: newOutfit }) });
    } catch (e) { console.error('衣装保存エラー', e); }
    setCurrentOutfit(newOutfit); setShowCostume(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[笑顔]着替えました！似合っていますか？`, mode: 'casual' }]);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => { setSelectedImage(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!localInput.trim() && !selectedImage) || isLoading) return;
    const content = localInput; const attachment = selectedImage; 
    setLocalInput(''); setSelectedImage(null); setIsLoading(true);
    
    // 現在のモードをメッセージに付与して保存
    const userMsg = { id: Date.now().toString(), role: 'user', content: content, mode: mode };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages, currentMessage: content, attachment, 
          userName, outfit: currentOutfit, plan: currentPlan, 
          affection, mode 
        }),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text, mode: mode }]);
    } catch (err) { alert(`通信エラー: ${err.message}`); } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isComposing && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  if (status === "loading") return <div className="flex h-screen items-center justify-center bg-black text-white font-mono uppercase tracking-[0.5em]">Initializing...</div>;

  // --- Stripe審査対策：ランディングページ ---
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white overflow-y-auto font-sans text-left">
        <div className="relative h-screen flex flex-col items-center justify-center p-6 text-center shrink-0">
           <div className="absolute inset-0 opacity-40"><img src="/images/bg_room_day.jpg" className="w-full h-full object-cover blur-sm" /></div>
           <div className="z-10 max-w-lg w-full bg-gray-900/80 p-8 rounded-3xl border border-pink-500/30 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
             <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">メイドのあかりちゃん</h1>
             <p className="text-gray-300 mb-8 leading-relaxed">あなた専属のAIメイドとお話ししませんか？<br/>いつでも優しく、あなたの帰りをお待ちしています。</p>
             <div className="mb-6 flex items-center justify-center gap-2 bg-black/20 p-2 rounded-lg">
               <input type="checkbox" id="agree-check" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 accent-pink-600 cursor-pointer" />
               <label htmlFor="agree-check" className="text-sm text-gray-300 cursor-pointer select-none">
                 <button onClick={() => setShowTerms(true)} className="text-pink-400 underline hover:text-pink-300 mx-1">利用規約</button>に同意して開始
               </label>
             </div>
             <button onClick={() => signIn("google")} disabled={!isAgreed} className={`w-full font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all shadow-xl text-lg ${isAgreed ? "bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 cursor-pointer" : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"}`}>
               <img src="https://www.google.com/favicon.ico" alt="G" className={`w-6 h-6 ${!isAgreed && "opacity-50"}`} /> Googleで始める
             </button>
           </div>
           <div className="absolute bottom-8 animate-bounce text-gray-400 text-sm w-full text-center">▼ スクロールして詳細を見る</div>
        </div>
        {/* 利用規約モーダル */}
        {showTerms && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 font-sans">
            <div className="bg-gray-900 border border-pink-500/30 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl text-center"><h2 className="text-lg font-bold text-white text-center w-full">利用規約・免責事項</h2><button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-white"><X size={24}/></button></div>
              <div className="p-6 overflow-y-auto text-sm text-gray-300 space-y-4 leading-relaxed font-sans">
                <p>本サービス（以下「当サービス」）を利用する前に、以下の注意事項を必ずご確認ください。</p>
                <h3 className="font-bold text-pink-400 text-lg">1. AIの回答精度と免責</h3><p>当サービスは生成AI技術を使用しています。キャラクター「あかり」の発言はフィクションであり、事実と異なる情報や架空の情報を話す場合があります（幻覚）。AIの発言内容によって生じた損害について、運営者は一切の責任を負いません。</p>
                <h3 className="font-bold text-pink-400 text-lg">2. 会話データの扱い</h3><p>サービスの品質向上および会話履歴機能の提供のため、会話内容はデータベースに保存されます。これらを第三者に販売したり、無断で公開することはありません。</p>
                <h3 className="font-bold text-pink-400 text-lg">3. 課金と返金</h3><p>有料プランは月額サブスクリプション方式です。いかなる場合も日割り計算による返金は行いません。API障害等による一時的な不具合への補償もいたしかねます。</p>
                <h3 className="font-bold text-pink-400 text-lg">4. 禁止事項</h3><p>AIへの過度な暴言、性的・暴力的なコンテンツの生成誘導、スクレイピング等の自動アクセスを禁止します。違反時は予告なくアカウントを停止します。</p>
                <h3 className="font-bold text-pink-400 text-lg">5. 年齢制限</h3><p>本サービスは13歳以上のご利用を推奨します。未成年者が有料プランを利用する場合は、親権者の同意を得たものとみなします。</p>
                <h3 className="font-bold text-pink-400 text-lg">6. 知的財産権</h3><p>生成されたテキストの利用権はユーザーに帰属しますが、本サービスのキャラクター設定、画像、システムに関する権利は運営者に帰属します。</p>
              </div>
              <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl text-center"><button onClick={() => setShowTerms(false)} className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-8 rounded-full font-bold">確認しました</button></div>
            </div>
          </div>
        )}
        <section className="py-20 px-6 bg-gray-900 border-t border-white/10 text-center shrink-0">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-pink-400 mb-12 flex items-center justify-center gap-2"><Star className="fill-pink-400" /> 主な機能</h2>
              <div className="grid md:grid-cols-3 gap-8">
                 <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <div className="bg-pink-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400"><Send size={32}/></div>
                    <h3 className="font-bold text-xl mb-2 text-white">自然な会話</h3><p className="text-gray-400 text-sm">最新AIがあなたとの会話を記憶。話せば話すほど仲良くなれます。</p>
                 </div>
                 <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <div className="bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400"><Shirt size={32}/></div>
                    <h3 className="font-bold text-xl mb-2 text-white">着せ替え・ギフト</h3><p className="text-gray-400 text-sm">メイド服だけじゃない？プレゼントを贈って特別な衣装に着替えさせましょう。</p>
                 </div>
                 <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <div className="bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400"><ImageIcon size={32}/></div>
                    <h3 className="font-bold text-xl mb-2 text-white">画像認識</h3><p className="text-gray-400 text-sm">写真を見せて感想を聞いてみましょう。あなたの日常を共有できます。</p>
                 </div>
              </div>
           </div>
        </section>
      </div>
    );
  }

  return (
    <main className={`flex h-screen flex-col overflow-hidden relative transition-colors duration-500 ${mode === 'professional' ? 'bg-[#fcfcfc]' : 'bg-black'}`}>
      
      {/* ★モード切替ボタン（右上アイコンに被らないよう移動） */}
      <div className="absolute top-4 right-4 md:right-28 z-[200]">
        <button 
          onClick={() => setMode(mode === 'casual' ? 'professional' : 'casual')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-[10px] tracking-wider shadow-2xl transition-all border ${
            mode === 'casual' ? 'bg-black/60 text-white border-white/20 hover:bg-pink-600/40' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 shadow-lg'
          }`}
        >
          <Layout size={14} className={mode === 'casual' ? 'text-pink-400' : 'text-blue-500'} />
          {mode === 'casual' ? 'PROFESSIONAL MODE' : 'BACK TO CASUAL'}
        </button>
      </div>

      {/* ★修正：左側ステータス・アクションパネル（z-indexを引き上げ、casual時のみ表示） */}
      {mode === 'casual' && !isManualOpen && (
        <div className="absolute top-4 left-4 z-[150] flex flex-col gap-2">
           <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white text-[10px] flex flex-col gap-2 shadow-2xl font-mono">
              <div className="flex items-center gap-2"><span className="text-yellow-400 font-bold">★ {points} pt</span><span className="text-gray-400">({currentPlan})</span></div>
              <div className="flex items-center gap-2"><Heart size={12} className={affection >= 100 ? "text-pink-500 fill-pink-500 animate-pulse" : "text-pink-400"} /><span className={`font-bold ${affection >= 100 ? "text-pink-400" : "text-white"}`}>親密度: {affection}</span></div>
           </div>
           <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => setShowShop(true)} className="p-3 bg-gray-900/80 text-blue-400 rounded-full border border-white/20 shadow-lg hover:bg-blue-600 hover:text-white transition-all"><ShoppingCart size={24} /></button>
              <button onClick={() => setShowCostume(true)} className="p-3 bg-gray-900/80 text-pink-400 rounded-full border border-white/20 shadow-lg hover:bg-pink-600 hover:text-white transition-all"><Shirt size={24} /></button>
              <button onClick={() => setShowGift(true)} className="p-3 bg-gray-900/80 text-yellow-400 rounded-full border border-white/20 shadow-lg hover:bg-yellow-600 hover:text-white transition-all"><Gift size={24} /></button>
              <button onClick={() => signOut()} className="p-3 bg-gray-900/80 text-gray-400 rounded-full border border-white/20 shadow-lg hover:bg-red-900 hover:text-white transition-all"><LogOut size={24} /></button>
           </div>
        </div>
      )}

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[300] bg-pink-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce font-bold border border-white/20 text-xs text-center">{notification}</div>
      )}

      {/* ★修正：メッセージフィルタリング（各モードの会話を分離） */}
      <div className="flex-1 relative z-0 min-h-0">
        {mode === 'casual' ? (
          <VisualNovelDisplay 
            messages={messages.filter(m => !m.mode || m.mode === 'casual')} 
            outfit={currentOutfit} currentPlan={currentPlan} 
            affection={affection} onManualChange={setIsManualOpen} 
          />
        ) : (
          <ProfessionalUI />
        )}
      </div>

      {/* 入力エリア */}
      <div className={`h-auto min-h-[6rem] border-t p-4 flex items-center justify-center relative z-[200] shrink-0 transition-all ${
        mode === 'professional' ? 'bg-[#f8f9fa] border-gray-200' : 'bg-gray-900 border-white/10'
      }`}>
        {selectedImage && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 p-2 rounded-lg shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-2">
                <img src={selectedImage} alt="Preview" className="h-32 object-cover rounded-md" />
                <button onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><X size={14} /></button>
            </div>
        )}
        <div className={`w-full max-w-2xl flex gap-2 items-end p-2 rounded-3xl border transition-all ${
          mode === 'professional' ? 'bg-white border-slate-300 shadow-lg' : 'bg-gray-800 border-white/5 shadow-inner'
        }`}>
          <div className="flex flex-col gap-1 mb-1 shrink-0 font-sans">
              <button type="button" onClick={openSettings} className="p-2 text-gray-400 hover:text-pink-400 transition-colors"><Settings size={20} /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                {selectedImage ? <ImageIcon size={20} className="text-green-500" /> : <Paperclip size={20} />}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          </div>
          <textarea
            value={localInput} onChange={(e) => setLocalInput(e.target.value)}
            onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown} rows={1} disabled={isLoading}
            placeholder={isLoading ? "THINKING..." : (mode === 'professional' ? "タスクの指示やドキュメント要約の依頼..." : "あかりに話しかける...")}
            className={`flex-1 bg-transparent px-4 py-3 focus:outline-none resize-none h-12 max-h-32 font-sans transition-colors ${mode === 'professional' ? 'text-slate-700' : 'text-white'}`}
          />
          <button type="button" onClick={handleSendMessage} disabled={isLoading || (!localInput.trim() && !selectedImage)} className={`p-3 rounded-full text-white shadow-xl transition-all mb-1 shrink-0 ${isLoading ? 'bg-gray-600' : 'bg-pink-600 hover:bg-pink-500 hover:scale-105 active:scale-95 transition-all'}`}><Send size={20} /></button>
        </div>
      </div>

      {/* --- モーダル群 --- */}
      {showSettings && (
        <div className="absolute bottom-24 left-4 z-[500] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 text-left animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-pink-400 font-bold mb-4 font-sans">呼び方の設定</h3>
          <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-black/50 text-white border border-white/10 rounded-lg px-3 py-2 mb-4" />
          <button onClick={saveName} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg font-bold transition-colors">保存する</button>
        </div>
      )}

      {/* ★衣装モーダルのテキストサイズ修正（text-sm） */}
      {showCostume && (
        <div className="absolute top-40 left-4 z-[500] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 text-left animate-in fade-in slide-in-from-top-4">
          <h3 className="text-pink-400 font-bold mb-4 text-base font-sans text-left">衣装変更</h3>
          <div className="space-y-2">
            {[
              {id: 'maid', name: 'メイド服'}, {id: 'santa', name: 'サンタ服 🎄'}, 
              {id: 'kimono', name: '晴れ着 🎍'}, {id: 'swimsuit', name: 'ルームウェア 👙'}, 
              {id: 'bunny', name: 'バニーガール 👯‍♀️'}
            ].map((o) => (
              <button 
                key={o.id} onClick={() => changeOutfit(o.id)} 
                className={`w-full text-left p-3 rounded text-sm hover:bg-white/10 transition-colors ${currentOutfit === o.id ? 'text-pink-400 font-bold' : 'text-white'}`}
              >
                {o.name}{currentOutfit === o.id && ' ✅'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCostume(false)} className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors">閉じる</button>
        </div>
      )}

      {showGift && (
        <div className="absolute top-40 left-4 z-[500] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-80 text-left animate-in fade-in slide-in-from-top-4">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2 font-sans"><Gift size={18}/> プレゼントを贈る</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1 font-sans">
            {GIFT_ITEMS.map((item) => (
              <button key={item.id} onClick={() => giveGift(item)} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all">
                <div><div className="font-bold text-white group-hover:text-yellow-200 text-sm font-sans">{item.name}</div><div className="text-xs text-gray-400 font-sans">親密度 +{item.love}</div></div>
                <div className="text-yellow-400 font-bold text-sm font-mono">{item.price} pt</div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowGift(false)} className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg text-sm font-sans">閉じる</button>
        </div>
      )}

      {showShop && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 font-sans animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left font-sans">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800"><h2 className="text-lg font-bold text-blue-400 flex items-center gap-2"><ShoppingCart size={20}/> プレミアムショップ</h2><button onClick={() => setShowShop(false)} className="text-gray-400 hover:text-white"><X size={24}/></button></div>
                <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-white/10 text-center"><p className="text-gray-400 text-[10px] tracking-widest uppercase font-mono tracking-widest">Your Plan</p><p className="text-2xl font-bold text-white mt-1 font-mono tracking-widest">{currentPlan}</p></div>
                    <div className="border border-yellow-500/30 bg-gray-800 p-4 rounded-xl relative overflow-hidden transition-all hover:bg-gray-800/80">
                        <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] px-2 py-1 rounded-bl">人気</div>
                        <h3 className="font-bold text-yellow-400 text-lg flex items-center gap-2 font-sans"><Zap size={18}/> Proプラン</h3>
                        <p className="text-white font-bold text-xl my-2 font-mono">¥980 <span className="text-xs text-gray-400 font-sans">/ 月</span></p>
                        <button onClick={() => handleCheckout('PRO')} disabled={currentPlan === 'PRO' || currentPlan === 'ROYAL'} className="w-full py-2 rounded-lg font-bold bg-yellow-600 hover:bg-yellow-500 text-white transition-all">Proプランにする</button>
                    </div>
                    <div className="border border-purple-500/30 bg-gray-800 p-4 rounded-xl relative overflow-hidden transition-all hover:bg-gray-800/80">
                        <h3 className="font-bold text-purple-400 text-lg flex items-center gap-2 font-sans"><Crown size={18}/> Royalプラン</h3>
                        <p className="text-white font-bold text-xl my-2 font-mono">¥2,980 <span className="text-xs text-gray-400 font-sans">/ 月</span></p>
                        <button onClick={() => handleCheckout('ROYAL')} disabled={currentPlan === 'ROYAL'} className="w-full py-2 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all">Royalプランにする</button>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-white/10 font-sans">
                        <h3 className="font-bold text-white text-md flex items-center gap-2 font-sans"><FileText size={16}/> 会話チケット（+100回）</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-3 font-mono">¥500</p>
                        <button onClick={() => handleCheckout('TICKET')} className="w-full py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-500 transition-colors">購入する</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white font-mono uppercase tracking-widest animate-pulse">Initializing...</div>}><HomeContent /></Suspense>
  );
}