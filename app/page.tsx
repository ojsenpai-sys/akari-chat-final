// @ts-nocheck
"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { 
  Send, Settings, Shirt, LogOut, FileText, X, Gift, Heart, 
  ShoppingCart, Crown, Zap, Paperclip, Image as ImageIcon, 
  Check, Star, Layout, Languages 
} from 'lucide-react'; 
import VisualNovelDisplay from './VisualNovelDisplay';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation'; 

// ★翻訳用マスタデータ（ギフトIDとキャラ名を追加）
const TRANSLATIONS = {
  ja: {
    charName: "あかり",
    title: "メイドのあかりちゃん",
    subtitle: "あなた専属のAIメイドとお話ししませんか？ いつでも優しく、あなたの帰りをお待ちしています。",
    termsAgree: "利用規約に同意して開始",
    termsLink: "利用規約",
    startGoogle: "Googleで始める",
    features: "主な機能",
    featChat: "自然な会話",
    featChatDesc: "最新AIがあなたとの会話を記憶。話せば話すほど仲良くなれます。",
    featDress: "着せ替え・ギフト",
    featDressDesc: "メイド服だけじゃない？プレゼントを贈って特別な衣装に着替えさせましょう。",
    featVision: "画像認識",
    featVisionDesc: "写真を見せて感想を聞いてみましょう。あなたの日常を共有できます。",
    proMode: "PROFESSIONAL MODE",
    backCasual: "BACK TO CASUAL",
    pointsLabel: "pt",
    points: "ポイント",
    affection: "親密度",
    thinking: "THINKING...",
    placeholder: "あかりに話しかける...",
    proPlaceholder: "実務タスクの指示やドキュメント要約の依頼...",
    assistantLog: "業務支援ログ",
    activePartner: "Active Partner",
    welcomeInitial: "[笑顔]おかえりなさいませ、ご主人様！認証完了、お疲れ様でした。さあ、二人きりの時間ですわ！",
    proGreeting: "ご主人様、こちらではより実務に特化したやり取りができますわ。なんなりとお申し付けくださいませ。",
    save: "保存する",
    close: "閉じる",
    giveGift: "プレゼントを贈る",
    costumeTitle: "衣装変更",
    premiumShop: "プレミアムショップ",
    // ギフト翻訳
    letter: "手紙", tea: "紅茶", shortcake: "ショートケーキ", pancake: "パンケーキ", 
    anime_dvd: "アニメDVD", game_rpg: "ゲームソフト（RPG）", game_fight: "ゲームソフト（格闘）",
    accessory: "高級アクセサリー", bag: "高級バッグ", esthe: "高級エステチケット", ring: "指輪"
  },
  en: {
    charName: "AKARI",
    title: "Akari the Maid",
    subtitle: "Your personal AI partner. Always kind, always waiting for you to come home.",
    termsAgree: "Agree to Terms and Start",
    termsLink: "Terms",
    startGoogle: "Continue with Google",
    features: "Core Features",
    featChat: "Natural Chat",
    featChatDesc: "Advanced AI remembers your talks. The more you speak, the closer you get.",
    featDress: "Dress up & Gifts",
    featDressDesc: "Give gifts to unlock special outfits beyond just the maid dress.",
    featVision: "Vision AI",
    featVisionDesc: "Show her photos and share your daily life. She will sympathize with you.",
    proMode: "PROFESSIONAL MODE",
    backCasual: "BACK TO CASUAL",
    pointsLabel: "pts",
    points: "Points",
    affection: "Affection",
    thinking: "THINKING...",
    placeholder: "Talk to Akari...",
    proPlaceholder: "Request professional tasks or summaries...",
    assistantLog: "Assistant Logs",
    activePartner: "Active Partner",
    welcomeInitial: "[笑顔]Welcome home, Master! Authentication complete. Now, let's spend some time together!",
    proGreeting: "Master, I can provide more professional support here. Please feel free to ask me anything.",
    save: "Save",
    close: "Close",
    giveGift: "Give a Gift",
    costumeTitle: "Change Outfit",
    premiumShop: "Premium Shop",
    // ギフト翻訳
    letter: "Letter", tea: "Tea", shortcake: "Shortcake", pancake: "Pancake",
    anime_dvd: "Anime DVD", game_rpg: "Game (RPG)", game_fight: "Game (Fighting)",
    accessory: "Jewelry", bag: "Luxury Bag", esthe: "Spa Ticket", ring: "Ring"
  }
};

// ★マスタデータ
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

  // ★修正：言語設定の状態管理（LocalStorage対応）
  const [lang, setLang] = useState('ja');
  const t = TRANSLATIONS[lang];

  // ★追加：言語切り替えと保存を行う関数
  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('akari_lang', newLang);
  };

  // ★追加：起動時にLocalStorageから言語を読み込む
  useEffect(() => {
    const savedLang = localStorage.getItem('akari_lang');
    if (savedLang && TRANSLATIONS[savedLang]) {
      setLang(savedLang);
    }
  }, []);

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

  // モード切り替え時の挨拶（多言語対応）
  useEffect(() => {
    if (mode === 'professional') {
      const introMsg = {
        id: `intro-${Date.now()}`,
        role: 'assistant',
        content: t.proGreeting,
        mode: 'professional'
      };
      setMessages(prev => {
        const hasIntro = prev.some(m => m.content === introMsg.content);
        return hasIntro ? prev : [...prev, introMsg];
      });
    }
  }, [mode, t]);

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
          if (data.error) { console.error('Sync Error:', data.error); }
          else {
            setPoints(data.points);
            setAffection(data.affection);
            setCurrentPlan(data.plan);
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
          content: t.welcomeInitial,
          mode: 'casual' 
        }
      ]);
    }
  }, [status, messages.length, t]);

  const openSettings = () => { setTempName(userName); setShowSettings(!showSettings); };

  const saveName = () => {
    const plan = currentPlan.toUpperCase();
    if (plan === 'FREE') {
      setShowSettings(false);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'assistant', content: lang === 'ja' ? `[悲しみ]申し訳ございません…。お名前の変更は、有料プラン（プロ・ロイヤル）のご主人様だけの特典なんです。` : `[悲しみ]I'm sorry... changing your name is a feature for Pro/Royal members.`, mode: 'casual' }
      ]);
      return; 
    }
    setUserName(tempName); 
    setShowSettings(false);
  };

  const giveGift = async (item) => {
    if (points < item.price) { alert(lang === 'ja' ? "ポイントが足りません！" : "Not enough points!"); return; }
    try {
        const res = await fetch('/api/user/gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cost: item.price, affectionGain: item.love }),
        });
        const data = await res.json();
        if (!res.ok) { alert(data.error || 'error'); return; }
        setPoints(data.points);
        setAffection(data.affection);
        setShowGift(false);
        const isLoveModeNow = data.affection >= 100;
        let reactionText = item.reaction;
        if (!reactionText.startsWith('[')) { reactionText = (isLoveModeNow ? "[照れ]" : "[笑顔]") + reactionText; }
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reactionText, mode: 'casual' }]);
    } catch (err) { alert('Communication Error'); }
  };

  const changeOutfit = async (newOutfit) => {
    const plan = currentPlan.toUpperCase();
    const hour = new Date().getHours();
    const isNightTime = hour >= 23 || hour < 6; 
    if (isNightTime && newOutfit !== 'swimsuit') {
      setShowCostume(false);
      return;
    }
    if (newOutfit === 'swimsuit' || newOutfit === 'bunny') {
      if (plan === 'FREE') {
        setShowCostume(false); return;
      }
    }
    if (newOutfit === 'santa' || newOutfit === 'kimono') {
      if (plan !== 'ROYAL') {
        setShowCostume(false); return;
      }
    }
    try {
        await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ outfit: newOutfit }),
        });
    } catch (e) { console.error('save error', e); }
    setCurrentOutfit(newOutfit);
    setShowCostume(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File is too large (max 5MB)"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setSelectedImage(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!localInput.trim() && !selectedImage) || isLoading) return;
    const content = localInput;
    const attachment = selectedImage; 
    setLocalInput(''); setSelectedImage(null); setIsLoading(true);
    const userMsg = { id: Date.now().toString(), role: 'user', content: content, mode: mode };
    const displayContent = content + (attachment ? (lang === 'ja' ? " (画像を送信しました)" : " (Image sent)") : "");
    const newHistory = [...messages, { ...userMsg, content: displayContent }];
    setMessages(newHistory);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newHistory, currentMessage: content, attachment: attachment, 
          userName: userName, outfit: currentOutfit, plan: currentPlan, 
          affection: affection, mode: mode,
          lang: lang // ★修正：言語設定をAI側に送るように追加
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[悲しみ]Limit reached.`, mode: mode }]);
          return;
        }
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text, mode: mode }]);
    } catch (err) { alert(`Error: ${err.message}`); } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || isComposing) return;
      if (!e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    }
  };

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
  }

  // --- ログイン前（ランディングページ） ---
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white overflow-y-auto font-sans">
        <div className="relative h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 opacity-40">
               <img src="/images/bg_room_day.jpg" className="w-full h-full object-cover blur-sm" />
            </div>

            {/* ★修正：handleLangChangeを使用するように変更 */}
            <div className="absolute top-6 right-6 z-20 flex bg-gray-900/60 rounded-full p-1 border border-white/20">
               <button onClick={() => handleLangChange('ja')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${lang === 'ja' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>JP</button>
               <button onClick={() => handleLangChange('en')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>EN</button>
            </div>

            <div className="z-10 max-w-lg w-full bg-gray-900/80 p-8 rounded-3xl border border-pink-500/30 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">{t.title}</h1>
              <p className="text-gray-300 mb-8 leading-relaxed">{t.subtitle}</p>
              <div className="mb-6 flex items-center justify-center gap-2 bg-black/20 p-2 rounded-lg">
                <input type="checkbox" id="agree-check" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 accent-pink-600 cursor-pointer" />
                <label htmlFor="agree-check" className="text-sm text-gray-300 cursor-pointer select-none">
                  <button onClick={() => setShowTerms(true)} className="text-pink-400 underline hover:text-pink-300 mx-1">{t.termsLink}</button>{t.termsAgree}
                </label>
              </div>
              <button onClick={() => signIn("google")} disabled={!isAgreed} className={`w-full font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all shadow-xl text-lg ${isAgreed ? "bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 cursor-pointer" : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"}`}>
                <img src="https://www.google.com/favicon.ico" alt="G" className={`w-6 h-6 ${!isAgreed && "opacity-50"}`} /> {t.startGoogle}
              </button>
            </div>
            <div className="absolute bottom-8 animate-bounce text-gray-400 text-sm">▼</div>
        </div>

        <section className="py-20 px-6 bg-gray-900 border-t border-white/10 text-center">
            <div className="max-w-4xl mx-auto">
               <h2 className="text-3xl font-bold text-pink-400 mb-12 flex items-center justify-center gap-2"><Star className="fill-pink-400" /> {t.features}</h2>
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                     <div className="bg-pink-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400"><Send size={32}/></div>
                     <h3 className="font-bold text-xl mb-2">{t.featChat}</h3>
                     <p className="text-gray-400 text-sm">{t.featChatDesc}</p>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                     <div className="bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400"><Shirt size={32}/></div>
                     <h3 className="font-bold text-xl mb-2">{t.featDress}</h3>
                     <p className="text-gray-400 text-sm">{t.featDressDesc}</p>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                     <div className="bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400"><ImageIcon size={32}/></div>
                     <h3 className="font-bold text-xl mb-2">{t.featVision}</h3>
                     <p className="text-gray-400 text-sm">{t.featVisionDesc}</p>
                  </div>
               </div>
            </div>
        </section>
      </div>
    );
  }

  return (
    <main className={`flex h-screen flex-col overflow-hidden relative transition-colors duration-500 ${mode === 'professional' ? 'bg-[#fcfcfc]' : 'bg-black'}`}>
      
      <div className="absolute top-[140px] right-4 md:top-4 md:right-24 z-[100]">
        <button 
          onClick={() => setMode(mode === 'casual' ? 'professional' : 'casual')}
          className={`flex items-center justify-center rounded-lg font-bold shadow-xl transition-all border ${
            mode === 'casual' 
            ? 'bg-black/60 text-white border-white/20 hover:bg-pink-600/40' 
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 shadow-lg'
          } w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2`}
        >
          <div className="flex items-center">
            <Layout size={14} className={mode === 'casual' ? 'text-pink-400' : 'text-blue-500'} />
            <span className="hidden md:inline ml-2 text-[10px] tracking-wider uppercase">
              {mode === 'casual' ? t.proMode : t.backCasual}
            </span>
            <span className="md:hidden text-lg font-black ml-0">P</span>
          </div>
        </button>
      </div>

      {mode === 'casual' && !isManualOpen && (
        <div className="absolute top-4 left-4 z-[200] flex flex-col gap-4">
           {/* ステータス表示（オレンジ太字） */}
           <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2 text-xs flex flex-col gap-1 shadow-lg font-mono">
              <div className="text-orange-400 font-bold">★ {points} {t.pointsLabel} ({currentPlan})</div>
              <div className="flex items-center gap-2 text-orange-400 font-bold"><Heart size={12} className="text-pink-400" /> {t.affection}: {affection}</div>
           </div>
           <div className="flex flex-row gap-2 shrink-0">
              <button onClick={() => setShowShop(true)} className="w-12 h-12 flex items-center justify-center bg-gray-900/80 text-blue-400 rounded-xl border border-white/20 shadow-lg hover:bg-blue-600 hover:text-white transition-all"><ShoppingCart size={24} /></button>
              <button onClick={() => setShowCostume(true)} className="w-12 h-12 flex items-center justify-center bg-gray-900/80 text-pink-400 rounded-xl border border-white/20 shadow-lg hover:bg-pink-600 hover:text-white transition-all"><Shirt size={24} /></button>
              <button onClick={() => setShowGift(true)} className="w-12 h-12 flex items-center justify-center bg-gray-900/80 text-yellow-400 rounded-xl border border-white/20 shadow-lg hover:bg-yellow-600 hover:text-white transition-all"><Gift size={24} /></button>
              <button onClick={() => signOut()} className="w-12 h-12 flex items-center justify-center bg-gray-900/80 text-gray-400 rounded-xl border border-white/20 shadow-lg hover:bg-red-900 hover:text-white transition-all"><LogOut size={24} /></button>
           </div>
        </div>
      )}

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[99999] bg-pink-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce font-bold border border-white/20 text-xs">
          {notification}
        </div>
      )}

      <div className="flex-1 relative z-0 min-h-0">
        {mode === 'casual' ? (
          <VisualNovelDisplay 
            messages={messages.filter(m => !m.mode || m.mode === 'casual')} 
            outfit={currentOutfit} currentPlan={currentPlan} 
            affection={affection} onManualChange={setIsManualOpen} 
            charName={t.charName} // ★追加：キャラ名を動的に渡す
          />
        ) : (
          <div className="flex h-full w-full bg-[#fcfcfc] text-slate-700 font-sans animate-in fade-in duration-500 overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-gray-200 min-h-0"> 
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
                <span className="font-bold flex items-center gap-2 text-slate-600"><FileText size={18} className="text-blue-500" /> {t.assistantLog}</span>
                <span className="text-[10px] text-gray-400 font-mono">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white custom-scrollbar">
                {messages.filter(m => m.mode === 'professional').map((m, i) => (
                  <div key={i} className={`p-4 rounded-xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-200'}`}>
                    <p className="text-[9px] font-bold mb-1 opacity-40 uppercase">{m.role === 'assistant' ? t.charName : 'User'}</p>
                    <p className="whitespace-pre-wrap">{m.content.replace(/\[.*?\]/g, '')}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* ★修正：イラスト横の名前表示を翻訳対応 */}
            <div className="hidden md:flex w-64 bg-slate-50 flex-col items-center justify-end p-6 border-l border-gray-100 shrink-0">
              <div className="mb-6 text-center opacity-60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.activePartner}</p>
                <p className="text-xs font-medium text-slate-600">{t.charName}</p>
              </div>
              <img 
                src={`/images/akari_${currentOutfit}_normal.png`} 
                alt={t.charName} 
                className="max-h-[50vh] object-contain opacity-70 grayscale-[20%] hover:grayscale-0 transition-all duration-700" 
                onError={(e) => { e.target.src = "/images/akari_normal.png"; }}
              />
            </div>
          </div>
        )}
      </div>

      <div className={`h-auto min-h-[6rem] border-t p-4 flex items-center justify-center relative z-[100] transition-colors duration-500 shrink-0 ${
        mode === 'professional' ? 'bg-[#f8f9fa] border-gray-200' : 'bg-gray-900 border-white/10'
      }`}>
        {selectedImage && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 p-2 rounded-lg shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-2">
                <img src={selectedImage} alt="Preview" className="h-32 object-cover rounded-md" />
                <button onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
            </div>
        )}
        <div className={`w-full max-w-2xl flex gap-2 items-end p-2 rounded-3xl border transition-all duration-500 ${
          mode === 'professional' ? 'bg-white border-slate-300 shadow-sm' : 'bg-gray-800 border-white/5 shadow-inner'
        }`}>
          <div className="flex flex-col gap-1 mb-1 shrink-0">
              <button type="button" onClick={openSettings} className="p-2 text-gray-400 hover:text-pink-400 transition-colors"><Settings size={20} /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-green-400">
                {selectedImage ? <ImageIcon size={20} /> : <Paperclip size={20} />}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          </div>
          <textarea
            value={localInput} onChange={(e) => setLocalInput(e.target.value)}
            onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown} rows={1} disabled={isLoading}
            placeholder={isLoading ? t.thinking : (mode === 'professional' ? t.proPlaceholder : t.placeholder)}
            className={`flex-1 bg-transparent px-4 py-3 focus:outline-none resize-none h-12 max-h-32 font-sans transition-colors ${mode === 'professional' ? 'text-slate-700' : 'text-white'}`}
          />
          <button type="button" onClick={handleSendMessage} disabled={isLoading || (!localInput.trim() && !selectedImage)} className={`p-3 rounded-full text-white shadow-lg transition-all mb-1 shrink-0 ${isLoading ? 'bg-gray-600' : 'bg-pink-600 hover:bg-pink-500'}`}><Send size={20} /></button>
        </div>
      </div>

      {showSettings && (
        <div className="absolute bottom-24 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 text-left">
          <h3 className="text-pink-400 font-bold mb-4">{t.settings}</h3>
          <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-black/50 text-white border border-white/10 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-pink-500" />
          <button onClick={saveName} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg font-bold">{t.save}</button>
        </div>
      )}
      {showGift && (
        <div className="absolute top-40 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-80 text-left">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2"><Gift size={18}/> {t.giveGift}</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {GIFT_ITEMS.map((item) => (
              <button key={item.id} onClick={() => giveGift(item)} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all">
                {/* ★修正：ギフト名を翻訳データから取得 */}
                <div><div className="font-bold text-white group-hover:text-yellow-200 text-sm">{t[item.id] || item.name}</div><div className="text-xs text-gray-400">{t.affection} +{item.love}</div></div>
                <div className="text-yellow-400 font-bold text-sm">{item.price} pt</div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowGift(false)} className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg text-sm">{t.close}</button>
        </div>
      )}

      {showCostume && (
        <div className="absolute top-40 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 animate-in fade-in slide-in-from-top-4 font-sans text-left">
          <h3 className="text-pink-400 font-bold mb-4 text-base">{t.costumeTitle}</h3>
          <div className="space-y-2">
            {[
              {id: 'maid', name: lang === 'ja' ? 'メイド服' : 'Maid Dress'}, 
              {id: 'santa', name: lang === 'ja' ? 'サンタ服 🎄' : 'Santa Outfit 🎄'}, 
              ...(new Date() >= new Date('2026-01-01') ? [{id: 'kimono', name: lang === 'ja' ? '晴れ着 🎍' : 'Kimono 🎍'}] : []),
              {id: 'swimsuit', name: lang === 'ja' ? '水着 👙' : 'Swimsuit 👙'}, 
              {id: 'bunny', name: lang === 'ja' ? 'バニーガール 👯‍♀️' : 'Bunny Girl 👯‍♀️'}
            ].map((o) => (
              <button key={o.id} onClick={() => changeOutfit(o.id)} className={`w-full text-left p-3 rounded text-sm hover:bg-white/10 transition-colors ${currentOutfit === o.id ? 'text-pink-400 font-bold' : 'text-white'}`}>
                {o.name}{currentOutfit === o.id && ' ✅'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCostume(false)} className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg text-sm">{t.close}</button>
        </div>
      )}

      {showShop && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 text-left">
            <div className="bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 text-center">
                    <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2"><ShoppingCart size={20}/> {t.premiumShop}</h2>
                    <button onClick={() => setShowShop(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-gray-400 text-[10px] tracking-widest uppercase">{lang === 'ja' ? '現在のプラン' : 'Your Plan'}</p>
                        <p className="text-2xl font-bold text-white mt-1">{currentPlan}</p>
                    </div>
                    <div className="border border-yellow-500/30 bg-gray-800 p-4 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] px-2 py-1 rounded-bl">Popular</div>
                        <h3 className="font-bold text-yellow-400 text-lg flex items-center gap-2"><Zap size={18}/> Pro Plan</h3>
                        <p className="text-white font-bold text-xl my-2">¥980 <span className="text-xs text-gray-400">/ mo</span></p>
                        <button onClick={() => handleCheckout('PRO')} disabled={currentPlan === 'PRO' || currentPlan === 'ROYAL'} className="w-full py-2 rounded-lg font-bold bg-yellow-600 text-white">Upgrade</button>
                    </div>
                    <div className="border border-purple-500/30 bg-gray-800 p-4 rounded-xl">
                        <h3 className="font-bold text-purple-400 text-lg flex items-center gap-2"><Crown size={18}/> Royal Plan</h3>
                        <p className="text-white font-bold text-xl my-2">¥2,980 <span className="text-xs text-gray-400">/ mo</span></p>
                        <button onClick={() => handleCheckout('ROYAL')} disabled={currentPlan === 'ROYAL'} className="w-full py-2 rounded-lg font-bold bg-purple-600 text-white">Upgrade</button>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-white/10">
                        <h3 className="font-bold text-white text-md flex items-center gap-2"><FileText size={16}/> {lang === 'ja' ? '会話チケット（+100回）' : 'Chat Tickets (+100)'}</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-3">¥500</p>
                        <button onClick={() => handleCheckout('TICKET')} className="w-full py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-500 transition-colors">{lang === 'ja' ? '購入する' : 'Purchase'}</button>
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
    <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}