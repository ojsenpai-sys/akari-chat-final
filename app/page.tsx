// @ts-nocheck
"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Send, Settings, Shirt, LogOut, FileText, X, Gift, Heart, ShoppingCart, Crown, Zap, Paperclip, Image as ImageIcon, Check, Star } from 'lucide-react'; 
import VisualNovelDisplay from './VisualNovelDisplay';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation'; 

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

  // ★追加：画像添付用ステートとRef
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // 通知用
  const [notification, setNotification] = useState(null);

  // サーバーと同期するステート
  const [currentOutfit, setCurrentOutfit] = useState('maid');
  const [currentPlan, setCurrentPlan] = useState('FREE'); 
  const [points, setPoints] = useState(0);
  const [affection, setAffection] = useState(0);

  // Stripe決済処理
  const handleCheckout = async (plan) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert("エラー: " + data.error);
        return;
      }
      if (data.url) {
        window.location.href = data.url; 
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
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
    if (newOutfit === 'kimono') {
        if (plan !== 'ROYAL') {
            setMessages(prev => [...prev, { 
              id: Date.now().toString(), 
              role: 'assistant', 
              content: `[悲しみ]それはロイヤル会員さんだけの特別な衣装なので...ごめんなさい💦` 
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
      case 'kimono': 
        reactionContent = `[笑顔]あけましておめでとうございます！晴れ着に着替えました。ご主人様、どうですか？似合ってますか？`;
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { 
        alert("画像サイズが大きすぎます（5MB以下にしてください）");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!localInput.trim() && !selectedImage) || isLoading) return;
    
    const content = localInput;
    const attachment = selectedImage; 

    setLocalInput(''); 
    setSelectedImage(null); 
    setIsLoading(true);

    const userMsg = { 
        id: Date.now().toString(), 
        role: 'user', 
        content: content,
    };
    
    const displayContent = content + (attachment ? " (画像を送信しました)" : "");
    const newHistory = [...messages, { ...userMsg, content: displayContent }];
    setMessages(newHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newHistory, 
          currentMessage: content, 
          attachment: attachment, 
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

  // --- ▼▼▼ Stripe審査対策：ランディングページ ▼▼▼ ---
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white overflow-y-auto">
        {/* ヒーローセクション */}
        <div className="relative h-screen flex flex-col items-center justify-center p-6 text-center">
           <div className="absolute inset-0 opacity-40">
              <img src="/images/bg_room_day.jpg" className="w-full h-full object-cover blur-sm" />
           </div>
           <div className="z-10 max-w-lg w-full bg-gray-900/80 p-8 rounded-3xl border border-pink-500/30 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
             <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">メイドのあかりちゃん</h1>
             <p className="text-gray-300 mb-8 leading-relaxed">
               あなた専属のAIメイドとお話ししませんか？<br/>
               いつでも優しく、あなたの帰りをお待ちしています。
             </p>
             
             <div className="mb-6 flex items-center justify-center gap-2 bg-black/20 p-2 rounded-lg">
               <input type="checkbox" id="agree-check" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 accent-pink-600 cursor-pointer" />
               <label htmlFor="agree-check" className="text-sm text-gray-300 cursor-pointer select-none">
                 <button onClick={() => setShowTerms(true)} className="text-pink-400 underline hover:text-pink-300 mx-1">利用規約</button>
                 に同意して開始
               </label>
             </div>
             
             <button onClick={() => signIn("google")} disabled={!isAgreed} className={`w-full font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all shadow-xl text-lg ${isAgreed ? "bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 cursor-pointer" : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"}`}>
               <img src="https://www.google.com/favicon.ico" alt="G" className={`w-6 h-6 ${!isAgreed && "opacity-50"}`} /> Googleで始める
             </button>
           </div>
           
           <div className="absolute bottom-8 animate-bounce text-gray-400 text-sm">
             ▼ スクロールして詳細を見る
           </div>
        </div>

        {/* 機能紹介 */}
        <section className="py-20 px-6 bg-gray-900 border-t border-white/10">
           <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-pink-400 mb-12 flex items-center justify-center gap-2"><Star className="fill-pink-400" /> 主な機能</h2>
              <div className="grid md:grid-cols-3 gap-8">
                 <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <div className="bg-pink-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400"><Send size={32}/></div>
                    <h3 className="font-bold text-xl mb-2">自然な会話</h3>
                    <p className="text-gray-400 text-sm">最新AIがあなたとの会話を記憶。話せば話すほど仲良くなれます。</p>
                 </div>
                 <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <div className="bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400"><Shirt size={32}/></div>
                    <h3 className="font-bold text-xl mb-2">着せ替え・ギフト</h3>
                    <p className="text-gray-400 text-sm">メイド服だけじゃない？プレゼントを贈って特別な衣装に着替えさせましょう。</p>
                 </div>
                 <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                    <div className="bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400"><ImageIcon size={32}/></div>
                    <h3 className="font-bold text-xl mb-2">画像認識</h3>
                    <p className="text-gray-400 text-sm">写真を見せて感想を聞いてみましょう。あなたの日常を共有できます。</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 料金プラン */}
        <section className="py-20 px-6 bg-black">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">料金プラン</h2>
              <div className="grid md:grid-cols-3 gap-6">
                 {/* Free */}
                 <div className="bg-gray-800 p-6 rounded-2xl border border-white/10 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Free</h3>
                    <p className="text-3xl font-bold text-white mb-4">¥0 <span className="text-sm font-normal text-gray-500">/月</span></p>
                    <ul className="text-sm text-gray-300 space-y-3 mb-8 flex-1">
                       <li className="flex gap-2"><Check size={16} className="text-green-400"/> 基本的な会話</li>
                       <li className="flex gap-2"><Check size={16} className="text-green-400"/> 親密度システム</li>
                       <li className="flex gap-2 text-gray-500"><X size={16}/> 衣装変更（制限あり）</li>
                    </ul>
                 </div>
                 {/* Pro */}
                 <div className="bg-gray-800 p-6 rounded-2xl border border-yellow-500 shadow-lg flex flex-col relative scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">人気</div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2"><Zap size={20}/> Pro</h3>
                    <p className="text-3xl font-bold text-white mb-4">¥980 <span className="text-sm font-normal text-gray-500">/月</span></p>
                    <ul className="text-sm text-gray-300 space-y-3 mb-8 flex-1">
                       <li className="flex gap-2"><Check size={16} className="text-yellow-400"/> 会話回数 大幅アップ</li>
                       <li className="flex gap-2"><Check size={16} className="text-yellow-400"/> 水着・バニーガール解放</li>
                       <li className="flex gap-2"><Check size={16} className="text-yellow-400"/> 呼び名変更・ギフト機能</li>
                    </ul>
                 </div>
                 {/* Royal */}
                 <div className="bg-gray-800 p-6 rounded-2xl border border-purple-500/50 flex flex-col">
                    <h3 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2"><Crown size={20}/> Royal</h3>
                    <p className="text-3xl font-bold text-white mb-4">¥2,980 <span className="text-sm font-normal text-gray-500">/月</span></p>
                    <ul className="text-sm text-gray-300 space-y-3 mb-8 flex-1">
                       <li className="flex gap-2"><Check size={16} className="text-purple-400"/> 会話回数 無制限級</li>
                       <li className="flex gap-2"><Check size={16} className="text-purple-400"/> 全衣装（サンタ・晴れ着）解放</li>
                       <li className="flex gap-2"><Check size={16} className="text-purple-400"/> Proプランの全機能</li>
                    </ul>
                 </div>
              </div>
              
              {/* ▼ 注釈を追加しました ▼ */}
              <p className="text-xs text-gray-500 mt-6 text-center">※プランの確認、支払いについてはログイン後に対応可能です</p>
           </div>
        </section>

        {/* フッター（修正済み：別々のページへリンク） */}
        <footer className="py-8 bg-gray-900 text-center text-xs text-gray-500 border-t border-white/10">
           <div className="flex justify-center gap-6 mb-4">
              <a href="/legal" target="_blank" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
              <a href="/terms" target="_blank" className="hover:text-white transition-colors">利用規約</a>
              <a href="/privacy" target="_blank" className="hover:text-white transition-colors">プライバシーポリシー</a>
           </div>
           <p>© 2025 Maid Akari Project. All rights reserved.</p>
        </footer>

        {/* 規約モーダル */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
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

  // ... (以下変更なし) ...

  return (
    <main className="flex h-screen flex-col bg-black overflow-hidden relative">
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[99999] bg-pink-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce font-bold border border-white/20">
          {notification}
        </div>
      )}

      <div className="flex-1 relative z-0">
        <VisualNovelDisplay 
            messages={messages} 
            outfit={currentOutfit} 
            currentPlan={currentPlan} 
            affection={affection} 
            onManualChange={setIsManualOpen} 
        />
      </div>

      {!isManualOpen && (
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

           <div className="flex flex-col md:flex-row items-start gap-2 mt-1">
              <button 
                  type="button"
                  onClick={() => setShowShop(!showShop)}
                  className="p-3 bg-gray-900/80 text-blue-400 hover:text-white hover:bg-blue-600 rounded-full border border-white/20 shadow-lg transition-all"
                  title="プラン変更"
              >
                  <ShoppingCart size={24} />
              </button>

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
      )}

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

      {showGift && (
        <div className="absolute top-40 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-80 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2"><Gift size={18}/> プレゼントを贈る</h3>
          <p className="text-xs text-gray-400 mb-2">ポイントを使って親密度アップ！</p>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {GIFT_ITEMS.map((item) => (
              <button 
                key={item.id}
                onClick={() => giveGift(item)} 
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all"
              >
                <div>
                    <div className="font-bold text-white group-hover:text-yellow-200 text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400">親密度 +{item.love}</div>
                </div>
                <div className="text-yellow-400 font-bold text-sm">
                    {item.price} pt
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowGift(false)} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">閉じる</button>
        </div>
      )}

      {showCostume && (
        <div className="absolute top-40 left-4 z-[9999] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-pink-400 font-bold mb-4">衣装変更（有料会員限定）</h3>
          <div className="space-y-2">
            <button onClick={() => changeOutfit('maid')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'maid' ? 'text-pink-400 font-bold' : 'text-white'}`}>メイド服 {currentOutfit === 'maid' && '✅'}</button>
            <button onClick={() => changeOutfit('santa')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'santa' ? 'text-pink-400 font-bold' : 'text-white'}`}>サンタ服 {currentOutfit === 'santa' && '✅'} 🎄</button>
            <button onClick={() => changeOutfit('kimono')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'kimono' ? 'text-pink-400 font-bold' : 'text-white'}`}>晴れ着 {currentOutfit === 'kimono' && '✅'} 🎍</button>
            <button onClick={() => changeOutfit('swimsuit')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'swimsuit' ? 'text-pink-400 font-bold' : 'text-white'}`}>水着 {currentOutfit === 'swimsuit' && '✅'} 👙</button>
            <button onClick={() => changeOutfit('bunny')} className={`w-full text-left p-2 rounded hover:bg-white/10 ${currentOutfit === 'bunny' ? 'text-pink-400 font-bold' : 'text-white'}`}>バニーガール {currentOutfit === 'bunny' && '✅'} 👯‍♀️</button>
          </div>
          <button onClick={() => setShowCostume(false)} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">閉じる</button>
        </div>
      )}

      {showShop && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 border border-blue-500/30 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2"><ShoppingCart size={20}/> プレミアムショップ</h2>
                    <button onClick={() => setShowShop(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-white/10 text-center">
                        <p className="text-gray-400 text-xs">現在のご主人様のプラン</p>
                        <p className="text-2xl font-bold text-white mt-1">{currentPlan}</p>
                    </div>

                    <div className="border border-yellow-500/30 bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] px-2 py-1 rounded-bl">人気</div>
                        <h3 className="font-bold text-yellow-400 text-lg flex items-center gap-2"><Zap size={18}/> Proプラン</h3>
                        <p className="text-white font-bold text-xl my-2">¥980 <span className="text-xs text-gray-400">/ 月</span></p>
                        <ul className="text-sm text-gray-300 space-y-1 mb-4">
                            <li>✅ 会話数UP（200回/日）</li>
                            <li>✅ 水着・バニーガール衣装 解放</li>
                            <li>✅ 呼び名変更・プレゼント機能 解放</li>
                        </ul>
                        <button 
                            onClick={() => handleCheckout('PRO')}
                            disabled={currentPlan === 'PRO' || currentPlan === 'ROYAL'}
                            className={`w-full py-2 rounded-lg font-bold transition-all ${currentPlan === 'PRO' ? 'bg-gray-600 text-gray-400 cursor-default' : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}
                        >
                            {currentPlan === 'PRO' ? '契約中' : (currentPlan === 'ROYAL' ? '上位プラン契約中' : 'Proプランにする')}
                        </button>
                    </div>

                    <div className="border border-purple-500/30 bg-gradient-to-br from-gray-900 to-purple-900/20 p-4 rounded-xl relative overflow-hidden">
                        <h3 className="font-bold text-purple-400 text-lg flex items-center gap-2"><Crown size={18}/> Royalプラン</h3>
                        <p className="text-white font-bold text-xl my-2">¥2,980 <span className="text-xs text-gray-400">/ 月</span></p>
                        <ul className="text-sm text-gray-300 space-y-1 mb-4">
                            <li>✅ 会話数・超UP（2500回/日）</li>
                            <li>✅ <span className="text-pink-400 font-bold">サンタ服・晴れ着・特別背景 解放</span></li>
                            <li>✅ Proプランの全機能</li>
                        </ul>
                        <button 
                            onClick={() => handleCheckout('ROYAL')}
                            disabled={currentPlan === 'ROYAL'}
                            className={`w-full py-2 rounded-lg font-bold transition-all ${currentPlan === 'ROYAL' ? 'bg-gray-600 text-gray-400 cursor-default' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                        >
                            {currentPlan === 'ROYAL' ? '契約中' : 'Royalプランにする'}
                        </button>
                    </div>

                    <div className="border border-white/10 bg-gray-800 p-4 rounded-xl">
                        <h3 className="font-bold text-white text-md flex items-center gap-2"><FileText size={16}/> 会話チケット（+100回）</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-3">プランに関わらず、本日の会話数をチャージできます。</p>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white">¥500</span>
                            <button 
                                onClick={() => handleCheckout('TICKET')}
                                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
                            >
                                購入する
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}

      {/* チャット入力欄 */}
      <div className="h-auto min-h-[6rem] bg-gray-900 border-t border-white/10 p-4 flex items-center justify-center relative z-[100]">
        
        {/* ★追加: 画像プレビューエリア */}
        {selectedImage && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 p-2 rounded-lg shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-2">
                <img src={selectedImage} alt="Preview" className="h-32 object-cover rounded-md" />
                <button 
                    onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                    <X size={14} />
                </button>
            </div>
        )}

        <div className="w-full max-w-2xl flex gap-2 items-end bg-gray-800 p-2 rounded-3xl border border-white/5 shadow-inner">
          
          <div className="flex flex-col gap-1 mb-1">
              <button 
                type="button"
                onClick={openSettings}
                className={`p-2 transition-colors rounded-full ${showSettings ? 'text-pink-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title="呼び名設定"
              >
                <Settings size={20} />
              </button>

              {/* ★追加: 画像選択ボタン */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 transition-colors rounded-full ${selectedImage ? 'text-green-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title="画像を添付"
              >
                {selectedImage ? <ImageIcon size={20} /> : <Paperclip size={20} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageSelect}
              />
          </div>
          
          <textarea
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "あかりが考えています..." : (selectedImage ? "画像について話す..." : "あかりに話しかける...")}
            className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none resize-none h-12 max-h-32 overflow-y-auto"
            disabled={isLoading}
            rows={1}
          />
          
          <button 
            type="button" 
            onClick={handleSendMessage} 
            disabled={isLoading || (!localInput.trim() && !selectedImage)} 
            className={`p-3 rounded-full text-white shadow-lg transition-colors mb-1 ${isLoading ? 'bg-gray-600' : 'bg-pink-600 hover:bg-pink-500'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white">読み込み中...</div>}>
      <HomeContent />
    </Suspense>
  );
}