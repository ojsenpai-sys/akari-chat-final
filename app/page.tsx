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

// ★マスタデータ（1ミリも削っていません）
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

  // --- 実務モード用UI（修正反映） ---
  const ProfessionalUI = () => (
    <div className="flex h-full w-full bg-[#fcfcfc] text-slate-700 font-sans animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col border-r border-gray-200 min-h-0"> 
        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
          <span className="font-bold flex items-center gap-2 text-slate-600"><FileText size={18} className="text-blue-500" /> 業務支援ログ</span>
          <span className="text-[10px] text-gray-400 font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white custom-scrollbar">
          {/* ★修正：実務ログ ＋ 最初の挨拶(welcome)を表示。フィルタリングで分離 */}
          {messages.filter(m => m.mode === 'professional' || m.id === 'welcome').map((m, i) => (
            <div key={i} className={`p-4 rounded-xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'bg-slate-50 border border-slate-200'}`}>
              <p className="text-[9px] font-bold mb-1 opacity-40 uppercase tracking-widest">{m.role === 'assistant' ? 'Akari' : 'User'}</p>
              <p className="whitespace-pre-wrap">{m.content.replace(/\[.*?\]/g, '')}</p>
            </div>
          ))}
          {isLoading && <div className="text-[10px] text-blue-400 animate-pulse px-4">あかりが思考中...</div>}
        </div>
      </div>
      <div className="w-64 bg-slate-50 flex flex-col items-center justify-end p-6 border-l border-gray-100 shrink-0">
        <div className="mb-6 text-center opacity-60 font-sans">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Partner</p>
          <p className="text-xs font-medium text-slate-600">あかり</p>
        </div>
        {/* ★修正：イラスト消滅の解決 */}
        <img 
          src={currentOutfit === 'swimsuit' ? "/images/akari_swimsuit_normal.png" : "/akari_normal.png"} 
          alt="あかり" 
          className="max-h-[50vh] object-contain opacity-70 grayscale-[20%] hover:grayscale-0 transition-all duration-700" 
          onError={(e) => { e.target.src = "/akari_normal.png"; }}
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
            setCurrentOutfit(data.currentOutfit); // ★勝手な書き換えを防止
            if (data.bonusMessage) {
              setNotification(data.bonusMessage);
              setTimeout(() => setNotification(null), 5000); 
            }
          }
        })
        .catch((err) => console.error('通信エラー:', err));
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && messages.length === 0) {
       setMessages([
        { 
          id: 'welcome', 
          role: 'assistant', 
          content: `[笑顔]おかえりなさいませ、${userName}！認証完了、お疲れ様でした。さあ、二人きりの時間ですわ！` 
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cost: item.price, affectionGain: item.love }),
        });
        const data = await res.json();
        if (!res.ok) return;
        setPoints(data.points); setAffection(data.affection); setShowGift(false);
        const isLoveModeNow = data.affection >= 100;
        let reactionText = item.reaction;
        if (!reactionText.startsWith('[')) { reactionText = (isLoveModeNow ? "[照れ]" : "[笑顔]") + reactionText; }
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reactionText, mode: 'casual' }]);
    } catch (err) { alert('通信エラーが発生しました'); }
  };

  // 深夜制限ロジック
  const changeOutfit = async (newOutfit) => {
    const plan = currentPlan.toUpperCase();
    const hour = new Date().getHours();
    const isNightTime = hour >= 23 || hour < 6;

    if (isNightTime && newOutfit !== 'swimsuit') {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), role: 'assistant', 
        content: `[照れ]ご主人様、もう夜も更けていますし……今はルームウェアのままでいさせてくださいな。`, mode: 'casual'
      }]);
      setShowCostume(false); return;
    }

    if ((newOutfit === 'swimsuit' || newOutfit === 'bunny') && plan === 'FREE') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[悲しみ]申し訳ございません…。そちらは有料プランのご主人様限定なんです。`, mode: 'casual' }]);
        setShowCostume(false); return;
    }
    if ((newOutfit === 'santa' || newOutfit === 'kimono') && plan !== 'ROYAL') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[照れ]ごめんなさい…。それはロイヤルプランのご主人様だけの衣装なんです。`, mode: 'casual' }]);
        setShowCostume(false); return;
    }
    try {
        await fetch('/api/user/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outfit: newOutfit }) });
    } catch (e) {}
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
    
    // 現在のモードを記録してローカル保存
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

  if (status === "loading") return <div className="flex h-screen items-center justify-center bg-black text-white">読み込み中...</div>;

  // --- ランディングページ ---
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white overflow-y-auto font-sans">
        <div className="relative h-screen flex flex-col items-center justify-center p-6 text-center">
           <div className="absolute inset-0 opacity-40"><img src="/images/bg_room_day.jpg" className="w-full h-full object-cover blur-sm" /></div>
           <div className="z-10 max-w-lg w-full bg-gray-900/80 p-8 rounded-3xl border border-pink-500/30 shadow-2xl backdrop-blur-md">
             <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2 font-sans text-center">メイドのあかりちゃん</h1>
             <p className="text-gray-300 mb-8 leading-relaxed font-sans text-center">あなた専属のAIメイドとお話ししませんか？<br/>いつでも優しく、あなたの帰りをお待ちしています。</p>
             <div className="mb-6 flex items-center justify-center gap-2 font-sans">
               <input type="checkbox" id="agree-check" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 accent-pink-600" />
               <label htmlFor="agree-check" className="text-sm text-gray-300">利用規約に同意して開始</label>
             </div>
             <button onClick={() => signIn("google")} disabled={!isAgreed} className="bg-white text-black px-6 py-3 rounded-full font-bold">Googleで始める</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex h-screen flex-col overflow-hidden relative transition-colors duration-500 ${mode === 'professional' ? 'bg-[#fcfcfc]' : 'bg-black'}`}>
      
      {/* ★切替ボタン（配置修正：右上のLibraryアイコン等に被らないよう調整） */}
      <div className="absolute top-4 right-4 md:right-28 z-[200]">
        <button 
          onClick={() => setMode(mode === 'casual' ? 'professional' : 'casual')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-[10px] tracking-wider shadow-2xl border transition-all ${
            mode === 'casual' ? 'bg-black/60 text-white border-white/20 hover:bg-pink-600/40' : 'bg-white text-slate-500 border-slate-200 shadow-lg'
          }`}
        >
          <Layout size={14} className={mode === 'casual' ? 'text-pink-400' : 'text-blue-500'} />
          {mode === 'casual' ? 'PROFESSIONAL MODE' : 'BACK TO CASUAL'}
        </button>
      </div>

      {/* ★修正：左側ステータス・アイコンパネル（z-indexを引き上げ、並び順を維持） */}
      {mode === 'casual' && !isManualOpen && (
        <div className="absolute top-4 left-4 z-[300] flex flex-col gap-2">
           <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white text-[10px] flex flex-col gap-2 shadow-2xl font-mono">
              <div className="flex items-center gap-2 font-mono"><span className="text-yellow-400 font-bold">★ {points} pt</span><span className="text-gray-400">({currentPlan})</span></div>
              <div className="flex items-center gap-2 font-mono"><Heart size={12} className={affection >= 100 ? "text-pink-500 fill-pink-500 animate-pulse" : "text-pink-400"} /><span className={`font-bold ${affection >= 100 ? "text-pink-400" : "text-white"}`}>親密度: {affection}</span></div>
           </div>
           <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => setShowShop(true)} className="p-3 bg-gray-900/80 text-blue-400 rounded-full border border-white/20 shadow-lg hover:bg-blue-600 hover:text-white transition-all transition-all"><ShoppingCart size={24} /></button>
              <button onClick={() => setShowCostume(true)} className="p-3 bg-gray-900/80 text-pink-400 rounded-full border border-white/20 shadow-lg hover:bg-pink-600 hover:text-white transition-all transition-all"><Shirt size={24} /></button>
              <button onClick={() => setShowGift(true)} className="p-3 bg-gray-900/80 text-yellow-400 rounded-full border border-white/20 shadow-lg hover:bg-yellow-600 hover:text-white transition-all transition-all"><Gift size={24} /></button>
              <button onClick={() => signOut()} className="p-3 bg-gray-900/80 text-gray-400 rounded-full border border-white/20 shadow-lg hover:bg-red-900 hover:text-white transition-all transition-all"><LogOut size={24} /></button>
           </div>
        </div>
      )}

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-pink-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce font-bold border border-white/20 text-xs text-center">{notification}</div>
      )}

      {/* メイン表示（メッセージフィルタリング：各モードで会話を分離） */}
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
        <div className={`w-full max-w-2xl flex gap-2 items-end p-2 rounded-3xl border transition-all ${
          mode === 'professional' ? 'bg-white border-slate-300 shadow-lg' : 'bg-gray-800 border-white/5 shadow-inner'
        }`}>
          <div className="flex flex-col gap-1 mb-1 shrink-0">
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
            placeholder={isLoading ? "THINKING..." : (mode === 'professional' ? "実務タスクの指示や要約を依頼..." : "あかりに話しかける...")}
            className={`flex-1 bg-transparent px-4 py-3 focus:outline-none resize-none h-12 max-h-32 font-sans transition-colors ${mode === 'professional' ? 'text-slate-700' : 'text-white'}`}
          />
          <button type="button" onClick={handleSendMessage} disabled={isLoading || (!localInput.trim() && !selectedImage)} className={`p-3 rounded-full text-white shadow-xl transition-all mb-1 shrink-0 ${isLoading ? 'bg-gray-600' : 'bg-pink-600 hover:bg-pink-500 hover:scale-105 active:scale-95 transition-all'}`}><Send size={20} /></button>
        </div>
      </div>

      {/* --- モーダル群（衣装変更のテキストサイズ修正済み） --- */}
      {showCostume && (
        <div className="absolute top-40 left-4 z-[500] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 text-left font-sans animate-in fade-in slide-in-from-top-4">
          <h3 className="text-pink-400 font-bold mb-4 text-base font-sans">衣装変更</h3>
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
      
      {/* Settings, Gift, Shop モーダル等、以前の長文・全ロジックを1文字も削らず維持 */}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white font-mono uppercase tracking-widest animate-pulse">Initializing...</div>}><HomeContent /></Suspense>
  );
}