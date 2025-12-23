// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
// ★Music アイコンを追加
import { Send, Settings, Shirt, LogOut, FileText, X, Gift, Heart, Music } from 'lucide-react'; 
import VisualNovelDisplay from './VisualNovelDisplay';
import { useSession, signIn, signOut } from "next-auth/react";

// ★BackgroundMusicコンポーネントのインポートは削除（直接書くため）

// ★マスタデータ（変更なし）
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

export default function Home() {
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState([]);
  const [localInput, setLocalInput] = useState('');
  
  const [userName, setUserName] = useState('ご主人様');
  const [tempName, setTempName] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showCostume, setShowCostume] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // 通知用
  const [notification, setNotification] = useState(null);

  // BGM用ステート
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // サーバーと同期するステート
  const [currentOutfit, setCurrentOutfit] = useState('maid');
  const [currentPlan, setCurrentPlan] = useState('FREE'); 
  const [points, setPoints] = useState(0);
  const [affection, setAffection] = useState(0);

  // ★BGM制御ロジック
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("再生エラー:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // 親密度によるBGM切り替え（もしあれば）
  // ※ファイル名は環境に合わせて書き換えてください！
  // 今は仮に '/bgm/bgm_normal.mp3' としています。
  const bgmSrc = affection >= 100 ? '/bgm/bgm_love.mp3' : '/bgm/bgm_normal.mp3';

  // 音量調整
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.3; // 音量30%
    }
  }, []);

  // データ同期
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/sync')
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Sync Error:', data.error);
          } else {
            setPoints(data.points);
            setAffection(data.affection);
            setCurrentPlan(data.plan);
            setCurrentOutfit(data.currentOutfit);

            if (data.bonusMessage) {
              setNotification(data.bonusMessage);
              setTimeout(() => setNotification(null), 5000); 
            }
          }
        })
        .catch((err) => console.error('通信エラー:', err));
    }
  }, [status]);

  // 初回メッセージ
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

  const openSettings = () => {
    setTempName(userName); 
    setShowSettings(!showSettings);
  };

  const saveName = () => {
    const plan = currentPlan.toUpperCase();
    if (plan === 'FREE') {
      setShowSettings(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: `[悲しみ]申し訳ございません…。お名前の変更は、有料プラン（プロ・ロイヤル）のご主人様だけの特典なんです。今のまま「${userName}」と呼ばせてくださいね。` 
        }
      ]);
      return; 
    }
    setUserName(tempName); 
    setShowSettings(false);
    setMessages(prev => [
      ...prev, 
      { id: Date.now().toString(), role: 'assistant', content: `[照れ]承知いたしました。これからは「${tempName}」とお呼びしますね。` }
    ]);
  };

  const giveGift = async (item) => {
    if (points < item.price) {
        alert("ポイントが足りません！");
        return;
    }
    try {
        const res = await fetch('/api/user/gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cost: item.price,
                affectionGain: item.love
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'エラーが発生しました');
            return;
        }
        setPoints(data.points);
        setAffection(data.affection);
        setShowGift(false);

        const isLoveModeNow = data.affection >= 100;
        let reactionText = item.reaction;
        if (!reactionText.startsWith('[')) {
            reactionText = (isLoveModeNow ? "[照れ]" : "[笑顔]") + reactionText;
        }
        setMessages(prev => [
            ...prev, 
            { id: Date.now().toString(), role: 'assistant', content: reactionText }
        ]);
    } catch (err) {
        console.error(err);
        alert('通信エラーが発生しました');
    }
  };

  const changeOutfit = async (newOutfit) => {
    const plan = currentPlan.toUpperCase();
    if (newOutfit === 'swimsuit' || newOutfit === 'bunny') {
      if (plan === 'FREE') {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: `[悲しみ]申し訳ございません…。そちらは特別な衣装になりますので、有料プランのご主人様限定なんです。` 
        }]);
        setShowCostume(false);
        return;
      }
    }
    if (newOutfit === 'santa') {
      if (plan !== 'ROYAL') {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: `[照れ]ごめんなさい…。サンタ服はロイヤルプランのご主人様だけの、秘密の衣装なんです。` 
        }]);
        setShowCostume(false);
        return;
      }
    }
    try {
        await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ outfit: newOutfit }),
        });
    } catch (e) {
        console.error('衣装保存エラー', e);
    }
    setCurrentOutfit(newOutfit);
    setShowCostume(false);

    let reactionContent = "";
    switch (newOutfit) {
      case 'santa':
        reactionContent = `[照れ]あ…サンタ服、似合いますでしょうか…？ちょっとスカートが短くて恥ずかしいです…。`;
        break;
      case 'swimsuit':
        reactionContent = `[照れ]み、水着ですか！？…室内ですけど…ご主人様が見たいなら…はい。`;
        break;
      case 'bunny':
        reactionContent = `[赤面]バ、バニーガールだなんて…！こ、こんな破廉恥な格好、ご主人様の前でしかできませんわ…！`;
        break;
      case 'maid':
      default:
        reactionContent = `[笑顔]メイド服に着替えましたわ！やっぱりこれが一番落ち着きますね。`;
        break;
    }
    setMessages(prev => [
      ...prev, 
      { id: Date.now().toString(), role: 'assistant', content: reactionContent }
    ]);
  };

  const handleSendMessage = async () => {
    if (!localInput.trim() || isLoading) return;
    const content = localInput;
    setLocalInput(''); 
    setIsLoading(true);

    const userMsg = { id: Date.now().toString(), role: 'user', content: content };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newHistory, 
          userName: userName, 
          outfit: currentOutfit,
          plan: currentPlan,
          affection: affection 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429 || errorData.error === "QUOTA_EXCEEDED") {
          setMessages(prev => [...prev, {
              id: Date.now().toString(), role: 'assistant',
              content: `[悲しみ]ご主人様、本日の会話上限に達してしまいました…。また明日お話ししましょうね！`
            }]);
          return;
        }
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text }]);
    } catch (err) {
      alert(`通信エラー: ${err.message}`);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || isComposing) return;
      if (!e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    }
  };

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center bg-black text-white">読み込み中...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
           <img src="/images/bg_room_day.jpg" className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="z-10 bg-gray-900/80 p-10 rounded-2xl border border-pink-500/30 shadow-2xl text-center max-w-md w-full backdrop-blur-md">
          <h1 className="text-3xl font-bold text-pink-400 mb-2">メイドのあかりちゃん</h1>
          <p className="text-gray-300 mb-6">あかりとお話しするには、<br/>ログインしてくださいませ。</p>
          <div className="mb-6 flex justify-center">
             <button onClick={() => setShowTerms(true)} className="text-sm text-pink-400 hover:text-pink-300 underline flex items-center gap-1">
               <FileText size={14} /> 利用規約・免責事項を確認する
             </button>
          </div>
          <div className="mb-6 flex items-center justify-center gap-2">
            <input type="checkbox" id="agree-check" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 accent-pink-600 cursor-pointer" />
            <label htmlFor="agree-check" className="text-sm text-gray-300 cursor-pointer select-none">上記規約に同意します</label>
          </div>
          <button onClick={() => signIn("google")} disabled={!isAgreed} className={`w-full font-bold py-3 px-6 rounded-full flex items-center justify-center gap-3 transition-all ${isAgreed ? "bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 cursor-pointer shadow-lg" : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"}`}>
            <img src="https://www.google.com/favicon.ico" alt="G" className={`w-6 h-6 ${!isAgreed && "opacity-50"}`} /> Googleでログイン
          </button>
        </div>
        
        {/* 利用規約モーダル */}
        {showTerms && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-900 border border-pink-500/30 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl">
                <h2 className="text-lg font-bold text-white">利用規約・免責事項</h2>
                <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
              </div>
              <div className="p-6 overflow-y-auto text-sm text-gray-300 space-y-4 leading-relaxed">
                <p>本サービス（以下「当サービス」）を利用する前に、以下の注意事項を必ずご確認ください。</p>
                <h3 className="font-bold text-pink-400">1. AIの回答精度と免責</h3>
                <p>当サービスは生成AI技術を使用しています。キャラクター「あかり」の発言はフィクションであり、事実と異なる情報や架空の情報を話す場合があります（幻覚）。AIの発言内容によって生じた損害について、運営者は一切の責任を負いません。</p>
                <h3 className="font-bold text-pink-400">2. 会話データの扱い</h3>
                <p>サービスの品質向上および会話履歴機能の提供のため、会話内容はデータベースに保存されます。これらを第三者に販売したり、無断で公開することはありません。</p>
                <h3 className="font-bold text-pink-400">3. 課金と返金</h3>
                <p>有料プランは月額サブスクリプション方式です。いかなる場合も日割り計算による返金は行いません。API障害等による一時的な不具合への補償もいたしかねます。</p>
                <h3 className="font-bold text-pink-400">4. 禁止事項</h3>
                <p>AIへの過度な暴言、性的・暴力的なコンテンツの生成誘導、スクレイピング等の自動アクセスを禁止します。違反時は予告なくアカウントを停止します。</p>
                <h3 className="font-bold text-pink-400">5. 年齢制限</h3>
                <p>本サービスは13歳以上のご利用を推奨します。未成年者が有料プランを利用する場合は、親権者の同意を得たものとみなします。</p>
                <h3 className="font-bold text-pink-400">6. 知的財産権</h3>
                <p>生成されたテキストの利用権はユーザーに帰属しますが、本サービスのキャラクター設定、画像、システムに関する権利は運営者に帰属します。</p>
                <h3 className="font-bold text-pink-400">7. 特定商取引法に基づく表記</h3>
                <div className="space-y-2 border-t border-gray-700 pt-2 mt-2">
                    <p><span className="font-bold">・販売事業者:</span> 請求があり次第遅滞なく提供します</p>
                    <p><span className="font-bold">・所在地:</span> 請求があり次第遅滞なく提供します</p>
                    <p><span className="font-bold">・電話番号:</span> 請求があり次第遅滞なく提供します</p>
                    <p><span className="font-bold">・お問い合わせ:</span> ojsenpai@gmail.com</p>
                    <p><span className="font-bold">・販売価格:</span> 各プラン申込みページに記載</p>
                    <p><span className="font-bold">・商品代金以外の必要料金:</span> サイト閲覧・利用時のインターネット接続料金</p>
                    <p><span className="font-bold">・支払方法:</span> クレジットカード決済（Stripe）</p>
                    <p><span className="font-bold">・引渡時期:</span> 決済完了後、即時利用可能</p>
                    <p><span className="font-bold">・返品・キャンセル:</span> デジタルコンテンツの性質上、決済完了後の返品・返金・キャンセルはできません。</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl text-center">
                <button onClick={() => setShowTerms(false)} className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-8 rounded-full font-bold transition-colors">確認しました</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-black overflow-hidden relative">
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[99999] bg-pink-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce font-bold border border-white/20">
          {notification}
        </div>
      )}

      {/* ★オーディオタグを埋め込み（隠し要素） */}
      {/* ⚠️注意：/bgm/bgm_normal.mp3 など、実際のファイルパスに合わせてください！ */}
      <audio ref={audioRef} loop src={bgmSrc} />

      <div className="flex-1 relative z-0">
        <VisualNovelDisplay messages={messages} outfit={currentOutfit} currentPlan={currentPlan} affection={affection} />
      </div>

      {/* ステータス表示 */}
      <div className="absolute top-4 left-4 z-[50] flex flex-col gap-2">
         <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-2 text-white text-xs flex flex-col gap-1 shadow-lg">
            <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">★ {points} pt</span>
                <span className="text-gray-400">({currentPlan})</span>
            </div>
            <div className="flex items-center gap-2">
                <Heart size={12} className={affection >= 100 ? "text-pink-500 fill-pink-500 animate-pulse" : "text-pink-400"} />
                <span className={`font-bold ${affection >= 100 ? "text-pink-400" : "text-white"}`}>親密度: {affection}</span>
            </div>
         </div>

         <div className="flex gap-2 mt-1">
            <button 
                type="button"
                onClick={() => setShowCostume(!showCostume)}
                className="p-3 bg-gray-900/80 text-pink-400 hover:text-white hover:bg-pink-600 rounded-full border border-white/20 shadow-lg transition-all"
                title="衣装変更"
            >
                <Shirt size={24} />
            </button>
            <button 
                type="button"
                onClick={() => setShowGift(!showGift)}
                className="p-3 bg-gray-900/80 text-yellow-400 hover:text-white hover:bg-yellow-600 rounded-full border border-white/20 shadow-lg transition-all"
                title="プレゼント"
            >
                <Gift size={24} />
            </button>
            <button 
                type="button"
                onClick={() => signOut()}
                className="p-3 bg-gray-900/80 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-full border border-white/20 shadow-lg transition-all"
                title="ログアウト"
            >
                <LogOut size={24} />
            </button>
         </div>
      </div>

      {/* 呼び名設定 */}
      {showSettings && (
        <div className="absolute bottom-24 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-pink-400 font-bold mb-4">呼び方の設定</h3>
          <p className="text-xs text-gray-400 mb-2">※特別な呼び名は有料機能です</p>
          <input 
            type="text" 
            value={tempName} 
            onChange={(e) => setTempName(e.target.value)} 
            className="w-full bg-black/50 text-white border border-white/10 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-pink-500" 
          />
          <button onClick={saveName} className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg transition-colors font-bold">保存する</button>
        </div>
      )}

      {/* 衣装変更画面 */}
      {showCostume && (
        <div className="absolute top-40 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-pink-400 font-bold mb-4">衣装変更（有料会員限定）</h3>
          <div className="space-y-2">
            <button onClick={() => changeOutfit('maid')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'maid' ? 'text-pink-400 font-bold' : 'text-white'}`}>メイド服 {currentOutfit === 'maid' && '✅'}</button>
            <button onClick={() => changeOutfit('santa')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'santa' ? 'text-pink-400 font-bold' : 'text-white'}`}>サンタ服 {currentOutfit === 'santa' && '✅'} 🎄</button>
            <button onClick={() => changeOutfit('swimsuit')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'swimsuit' ? 'text-pink-400 font-bold' : 'text-white'}`}>水着 {currentOutfit === 'swimsuit' && '✅'} 👙</button>
            <button onClick={() => changeOutfit('bunny')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'bunny' ? 'text-pink-400 font-bold' : 'text-white'}`}>バニーガール {currentOutfit === 'bunny' && '✅'} 👯‍♀️</button>
          </div>
          <button onClick={() => setShowCostume(false)} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">閉じる</button>
        </div>
      )}

      {/* プレゼント画面 */}
      {showGift && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2"><Gift size={20}/> あかりへプレゼント</h2>
                    <button onClick={() => setShowGift(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="p-2 overflow-y-auto custom-scrollbar">
                    {/* ポイント表示 */}
                    <div className="p-4 text-center bg-gray-800/50 mb-2">
                        <p className="text-gray-400 text-sm">所持ポイント</p>
                        <p className="text-2xl font-bold text-yellow-400">{points} pt</p>
                    </div>

                    {currentPlan.toUpperCase() === 'FREE' ? (
                        <div className="p-8 text-center text-gray-400">
                            <p>プレゼント機能は有料会員（Pro/Royal）限定です。</p>
                            <p className="text-sm mt-2">プランに参加して、あかりと仲良くなりましょう！</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 p-2">
                            {GIFT_ITEMS.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => giveGift(item)}
                                    disabled={points < item.price}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                        points < item.price 
                                        ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed" 
                                        : "bg-gray-800/80 border-white/10 hover:bg-gray-700 hover:border-yellow-500/50 hover:shadow-lg hover:scale-[1.02]"
                                    }`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-white">{item.name}</div>
                                        <div className="text-xs text-pink-400">親密度 +{item.love}</div>
                                    </div>
                                    <div className="font-bold text-yellow-400">{item.price} pt</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* ★UI修正：チャット入力欄にボタンを統合 */}
      <div className="h-auto min-h-[6rem] bg-gray-900 border-t border-white/10 p-4 flex items-center justify-center relative z-[100]">
        <div className="w-full max-w-2xl flex gap-2 items-end bg-gray-800 p-2 rounded-3xl border border-white/5 shadow-inner">
          
          {/* 左側のボタングループ（設定＆音楽） */}
          <div className="flex flex-col gap-1 mb-1">
              <button 
                type="button"
                onClick={openSettings}
                className={`p-2 transition-colors rounded-full ${showSettings ? 'text-pink-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title="呼び名設定"
              >
                <Settings size={20} />
              </button>

              <button 
                type="button"
                onClick={toggleMusic}
                className={`p-2 transition-colors rounded-full ${isMusicPlaying ? 'text-green-400 bg-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                title="BGM ON/OFF"
              >
                <Music size={20} className={isMusicPlaying ? "animate-pulse" : ""} />
              </button>
          </div>
          
          <textarea
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "あかりが考えています..." : "あかりに話しかける..."}
            className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none resize-none h-12 max-h-32 overflow-y-auto"
            disabled={isLoading}
            rows={1}
          />
          
          <button 
            type="button" 
            onClick={handleSendMessage} 
            disabled={isLoading} 
            className={`p-3 rounded-full text-white shadow-lg transition-colors mb-1 ${isLoading ? 'bg-gray-600' : 'bg-pink-600 hover:bg-pink-500'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}