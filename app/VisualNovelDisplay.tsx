// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, X, Heart, Star, Sparkles, MessageCircle, Volume2, VolumeX } from 'lucide-react';

// --- BGM設定 ---
const BGM_NORMAL = "/audio/bgm_normal.mp3";
const BGM_LOVE = "/audio/bgm_love.mp3";

// --- 各衣装の定義 ---
const MAID_EMOTIONS = {
  normal: "/images/akari_normal.png",
  shy: "/images/akari_shy.png",
  smile: "/images/akari_smile.png",
  angry: "/images/akari_angry.png",
  sad: "/images/akari_sad.png",
  surprised: "/images/akari_surprised.png",
  smug: "/images/akari_smug.png",
  wink: "/images/akari_wink.png",
};

const SANTA_EMOTIONS = {
  normal: "/images/akari_santa_normal.png",
  shy: "/images/akari_santa_shy.png",
  smile: "/images/akari_santa_smile.png",
  angry: "/images/akari_santa_angry.png",
  sad: "/images/akari_santa_sad.png",
  surprised: "/images/akari_santa_surprised.png",
  smug: "/images/akari_santa_smug.png",
  wink: "/images/akari_santa_wink.png",
};

const SWIM_EMOTIONS = {
  normal: "/images/akari_swim_normal.png",
  shy: "/images/akari_swim_shy.png",
  smile: "/images/akari_swim_smile.png",
  angry: "/images/akari_swim_angry.png",
  sad: "/images/akari_swim_sad.png",
  surprised: "/images/akari_swim_surprised.png",
  smug: "/images/akari_swim_smug.png",
  wink: "/images/akari_swim_wink.png",
};

const BUNNY_EMOTIONS = {
  normal: "/images/akari_bunny_normal.png",
  shy: "/images/akari_bunny_shy.png",
  smile: "/images/akari_bunny_smile.png",
  angry: "/images/akari_bunny_angry.png",
  sad: "/images/akari_bunny_sad.png",
  surprised: "/images/akari_bunny_surprised.png",
  smug: "/images/akari_bunny_smug.png",
  wink: "/images/akari_bunny_wink.png",
};

// 晴れ着（Kimono）の定義
const KIMONO_EMOTIONS = {
  normal: "/images/akari_haregi_normal.png",
  shy: "/images/akari_haregi_shy.png",
  smile: "/images/akari_haregi_smile.png",
  sad: "/images/akari_haregi_sad.png",
  smug: "/images/akari_haregi_smug.png",
  angry: "/images/akari_haregi_normal.png",
  surprised: "/images/akari_haregi_normal.png",
  wink: "/images/akari_haregi_normal.png",
};

// ラブラブモード用画像（日中など）
const LOVE_IMAGES = {
  maid: "/images/akari_maid_love.png",
  santa: "/images/akari_santa_love.png",
  swimsuit: "/images/akari_swim_love.png",
  bunny: "/images/akari_bunny_love.png",
  kimono: "/images/akari_haregi_love.png"
};

// ルームウェア画像
const ROOMWEAR_IMAGE = "/images/akari_roomwear.png"; 
const ROOMWEAR_LOVE_IMAGE = "/images/akari_roomwear_love.png"; 

// 背景画像
const BG_DAY = "/images/bg_room_day.jpg";
const BG_NIGHT = "/images/bg_room_night.jpg";
const BG_ROYAL_DAY = "/images/bg_royal_day.jpg";
const BG_ROYAL_NIGHT = "/images/bg_royal_night.jpg";

const SITUATION_DEFINITIONS = [
  { id: "sleeping", image: "/images/event_sleeping.png", triggers: ["そろそろ寝よう", "おやすみ"], releases: ["おはよう"] },
  { id: "washing", image: "/images/event_washing.png", triggers: ["お風呂入ろう"], releases: ["上がろう"] },
  { id: "christmas", image: "/images/event_christmas.png", triggers: ["クリスマスだね"], releases: ["帰ろうか"] },
  { id: "cooking", image: "/images/event_cooking.png", triggers: ["ご飯作って"], releases: ["いただきます"] },
  { id: "onsen", image: "/images/event_onsen.png", triggers: ["温泉行こう"], releases: ["そろそろ上がろうか"] },
  { id: "massage", image: "/images/event_massage.png", triggers: ["マッサージして"], releases: ["楽になった"] },
  { id: "yoga", image: "/images/event_yoga.png", triggers: ["ヨガしよう"], releases: ["終わろう"] }
];

// --- マニュアル用モーダルコンポーネント ---
const ManualModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] overflow-hidden shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="bg-pink-500 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-bold text-lg md:text-xl">『メイドのあかりちゃん』取扱説明書</h2>
          </div>
          <button onClick={onClose} className="hover:bg-pink-600 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar text-gray-800 space-y-8 bg-pink-50/30">
          <section>
            <h3 className="text-pink-600 font-bold text-xl border-b-2 border-pink-200 pb-2 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> 1. コンセプト
            </h3>
            <p className="font-bold text-lg mb-2 text-center text-gray-700">「寂しさも、仕事の悩みも、これ1⼈で解決。」</p>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              『メイドのあかりちゃん』は、ただのチャットボットではありません。最新の超⾼性能AI（Gemini 3 Pro）を搭載し、「癒やし」と「実務」を両⽴した、世界⼀有能なオタクメイドです。
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100">
                <h4 className="font-bold text-pink-500 mb-2">A⾯：オタク友達として（癒やし）</h4>
                <div className="aspect-video bg-pink-100 rounded-md mb-2 overflow-hidden">
                    <img src="/images/akari_maid_love.png" className="w-full h-full object-cover object-top opacity-80" alt="Healing" />
                </div>
                <p className="text-xs text-gray-600">アニメの感想を語り合ったり、愚痴を聞いてもらったり。清楚な⾒た⽬で、実は重度のサブカル好き。「尊すぎて叫んでしまいましたわ︕」とあなたに共感します。</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <h4 className="font-bold text-blue-500 mb-2">B⾯：超有能な秘書として（実務）</h4>
                <div className="aspect-video bg-blue-100 rounded-md mb-2 overflow-hidden">
                    <img src="/images/akari_normal.png" className="w-full h-full object-cover object-top opacity-80" alt="Work" />
                </div>
                <p className="text-xs text-gray-600">検索機能を駆使して、最新ニュースの取得、翻訳、コードのデバッグまでこなします。「ご主⼈様、最新のドキュメントをまとめましたわ」と、仕事の相棒としても活躍します。</p>
              </div>
            </div>
            <div className="mt-4 bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-xl text-center">
              <h4 className="font-bold text-purple-600">C⾯：その融合（没⼊感）</h4>
              <p className="text-sm text-gray-700">事務的な作業も、あかりちゃんなら「ご主⼈様のために尽くす喜び」に変えてくれます。</p>
            </div>
          </section>

          <section>
            <h3 className="text-pink-600 font-bold text-xl border-b-2 border-pink-200 pb-2 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" /> 2. キャラクター紹介
            </h3>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-pink-200 overflow-hidden shrink-0 shadow-md">
                <img src="/images/akari_smile.png" className="w-full h-full object-cover object-top" alt="Akari Profile" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">あかり <span className="text-base font-normal text-gray-500">(Akari)</span></h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-bold text-pink-500">設定:</span> あなたに仕える専属メイド。</p>
                  <p><span className="font-bold text-pink-500">性格:</span> 普段は丁寧で清楚なメイドさんですが、実はアニメ・ゲームが⼤好きなオタク少⼥。気を許すと早⼝で推し作品について語り出すことも…︖</p>
                  <p className="bg-yellow-50 p-2 rounded-lg border border-yellow-200 text-xs">
                    💡 アナタの好きな作品を覚えさせると会話に盛り込んでいくようになります！
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-pink-600 font-bold text-xl border-b-2 border-pink-200 pb-2 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" /> 3. 基本機能
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-400" /> リアルタイムチャット (無料/有料)
                </h4>
                <p className="text-sm text-gray-600 mb-3">⾃然な会話で、雑談から仕事の相談まで幅広く対応します。</p>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="p-3">プラン</th>
                        <th className="p-3">価格</th>
                        <th className="p-3">会話回数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-3 font-bold text-gray-600">Free Plan</td>
                        <td className="p-3">無料</td>
                        <td className="p-3">1⽇ 20回</td>
                      </tr>
                      <tr className="bg-blue-50/50">
                        <td className="p-3 font-bold text-blue-600">Pro Plan</td>
                        <td className="p-3">月980円</td>
                        <td className="p-3">1日 200回</td>
                      </tr>
                      <tr className="bg-pink-50/50">
                        <td className="p-3 font-bold text-pink-600">Royal Plan</td>
                        <td className="p-3">月2980円</td>
                        <td className="p-3">1日 2500回</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-2 bg-gray-50 text-xs text-gray-500 text-right">
                    会話チケット（+100回）：500円（都度払い）
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" /> お着替え機能 【有料サービス限定】
                </h4>
                <p className="text-sm text-gray-600 mb-3">共通衣装はメイド服のみですが、Pro Plan、Royal Planは気分に合わせて特別な⾐装に変更可能です。</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 bg-white p-4 rounded-lg border border-gray-200">
                  <li><span className="font-bold text-blue-600">Pro Plan：</span> 水着、バニーガール</li>
                  <li><span className="font-bold text-pink-600">Royal Plan：</span> Pro Planの衣装 ＋ <span className="underline decoration-pink-300 decoration-2">季節ものの特別衣装</span>（毎月投入）</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2 ml-4">※12月はサンタ、1月は晴れ着を実装します</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-pink-600 font-bold text-xl border-b-2 border-pink-200 pb-2 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> 4. シークレット・イベントモード
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              会話の中で「特定のキーワード（誘い⽂句）」を伝えると、特別なイベントモードに突⼊します。背景が一枚絵のイラストに変化し、⼆⼈きりの特別な時間を楽しめます。
            </p>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4 relative group">
              <img src="/images/event_christmas.png" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Event Mode" />
              <div className="absolute bottom-2 right-2 text-white text-xs bg-black/60 px-2 py-1 rounded">※画像はXmasイベントのイメージです</div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                🔑 イベント発動ワードのヒント
              </h4>
              <ul className="text-sm text-yellow-900 space-y-1">
                <li><span className="font-bold">Xmasデート：</span>「イルミネーション」「デート」「クリスマス」</li>
                <li><span className="font-bold">⼿料理：</span>「オムライス」「ご飯」</li>
                <li>など… シチュエーションはまだたくさん用意しているので探してみてください！</li>
              </ul>
            </div>
          </section>

          <div className="pt-8 pb-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-pink-500 mb-2 drop-shadow-sm">
              さあ、あかりとの⽣活を始めましょう。
            </h2>
            <p className="text-gray-600 italic">
              「おかえりなさいませ、ご主⼈様︕ずっとお待ちしておりましたわ。」
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// ★修正：charName プロップを引数に追加し、デフォルト値を「あかり」に設定
export default function VisualNovelDisplay({ messages, outfit = 'maid', currentPlan = 'free', affection = 0, onManualChange, charName = 'あかり' }) {
  const [currentEmotion, setCurrentEmotion] = useState('normal');
  const [currentSituation, setCurrentSituation] = useState(null); 
  const [displayedText, setDisplayedText] = useState('');
  const [showUI, setShowUI] = useState(true);
  const [isNightTime, setIsNightTime] = useState(false); 
  const [isRoomwearTime, setIsRoomwearTime] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // ★重要：リセット防止用のメモ（メッセージIDの記録）
  const lastProcessedMessageId = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const scrollRef = useRef(null);
  const typingRef = useRef(null);

  const isLoveMode = affection >= 100;
  const plan = currentPlan?.toUpperCase() || 'FREE';

  useEffect(() => {
    if (onManualChange) {
      onManualChange(showManual);
    }
  }, [showManual, onManualChange]);

  const handleScreenClick = () => {
    if (audioRef.current && audioRef.current.paused && !isMuted) {
      audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
    }
    setShowUI(!showUI);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsNightTime(hour >= 18 || hour < 5);
      const isRoomwear = (hour >= 23 || hour < 5);
      setIsRoomwearTime(isRoomwear);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
    }
    const audio = audioRef.current;
    const targetSrc = isLoveMode ? BGM_LOVE : BGM_NORMAL;

    if (!audio.src.includes(targetSrc)) {
        audio.src = targetSrc;
        if (!isMuted) {
            audio.play().catch(e => console.log("Auto play blocked", e));
        }
    }
    audio.muted = isMuted;
    if (!isMuted && audio.paused && audio.src) {
         audio.play().catch(e => console.log("Play failed", e));
    }
  }, [isLoveMode, isMuted]);

  // ★重要：メッセージ表示ロジック（リセット防止機能維持）
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === 'user') {
      const text = lastMsg.content;
      const nextSituation = SITUATION_DEFINITIONS.find(def => 
        def.triggers.some(keyword => text.includes(keyword))
      );
      if (nextSituation) {
        setCurrentSituation(nextSituation);
      } else if (currentSituation) {
        const shouldRelease = currentSituation.releases.some(keyword => text.includes(keyword));
        if (shouldRelease) setCurrentSituation(null);
      }
    }

    if (lastMsg.role === 'assistant') {
      // メッセージIDが変わっていないならタイピングをリセットしない（バグ防止）
      if (lastProcessedMessageId.current === lastMsg.id) {
        return; 
      }
      
      lastProcessedMessageId.current = lastMsg.id;

      if (typingRef.current) clearInterval(typingRef.current);

      let content = lastMsg.content;
      const emoKeyMap = { '通常': 'normal', '笑顔': 'smile', '怒り': 'angry', '照れ': 'shy', '悲しみ': 'sad', '驚き': 'surprised', 'ドヤ': 'smug', 'ウィンク': 'wink' };
      const emotionRegex = /\[(.*?)\]/g;
      let match;
      while ((match = emotionRegex.exec(content)) !== null) {
        if (emoKeyMap[match[1]]) setCurrentEmotion(emoKeyMap[match[1]]);
      }

      const cleanContent = content.replace(/\[.*?\]/g, '');
      setDisplayedText('');
      let i = 0;
      typingRef.current = setInterval(() => {
        setDisplayedText(cleanContent.substring(0, i + 1));
        i++;
        if (i >= cleanContent.length) clearInterval(typingRef.current);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 30);
    } 
    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, [messages, currentSituation]);

  useEffect(() => {
    if (outfit === 'kimono' && plan !== 'ROYAL') {
        if (typingRef.current) clearInterval(typingRef.current);
        setCurrentEmotion('sad'); 
        const rejectionText = "それはロイヤル会員さんだけの特別な衣装なので...ごめんなさい💦";
        setDisplayedText(rejectionText); 
    }
  }, [outfit, plan]);

  useEffect(() => {
    if (isRoomwearTime && !isLoveMode) {
        if (typingRef.current) clearInterval(typingRef.current);
        setCurrentEmotion('shy');
        const specialText = "ご主人様、夜も更けてきましたのでそろそろ着替えさせていただきました。その…ご主人様の好きなルームウェアです。ちょっと恥ずかしいですけど…どうですか？";
        setDisplayedText(specialText); 
    }
  }, [isRoomwearTime]);

  let characterSrc = MAID_EMOTIONS[currentEmotion] || MAID_EMOTIONS.normal;
  let activeOutfit = outfit;

  if (outfit === 'swimsuit' || outfit === 'bunny') {
    if (plan === 'FREE') activeOutfit = 'maid';
  } else if (outfit === 'santa' || outfit === 'kimono') {
    if (plan !== 'ROYAL') activeOutfit = 'maid';
  }

  if (isRoomwearTime && activeOutfit === 'maid') {
    characterSrc = isLoveMode ? ROOMWEAR_LOVE_IMAGE : ROOMWEAR_IMAGE;
  } else {
    if (isLoveMode) {
        characterSrc = LOVE_IMAGES[activeOutfit] || LOVE_IMAGES.maid;
    } else {
        switch (activeOutfit) {
          case 'santa': characterSrc = SANTA_EMOTIONS[currentEmotion] || SANTA_EMOTIONS.normal; break;
          case 'swimsuit': characterSrc = SWIM_EMOTIONS[currentEmotion] || SWIM_EMOTIONS.normal; break;
          case 'bunny': characterSrc = BUNNY_EMOTIONS[currentEmotion] || BUNNY_EMOTIONS.normal; break;
          case 'kimono': characterSrc = KIMONO_EMOTIONS[currentEmotion] || KIMONO_EMOTIONS.normal; break;
          default: characterSrc = MAID_EMOTIONS[currentEmotion] || MAID_EMOTIONS.normal;
        }
    }
  }

  const adjustPosition = (activeOutfit === 'santa' || activeOutfit === 'kimono') || isLoveMode;
  const imageScale = isLoveMode ? "scale-110" : "scale-100";
  const imageStyle = adjustPosition
    ? `h-[150%] w-auto -bottom-[60%] md:h-auto md:max-h-[220%] md:-bottom-[120%] ${imageScale}` 
    : "h-[140%] w-auto -bottom-[50%] md:h-auto md:max-h-[140%] md:-bottom-[45%]";

  let currentBg = (plan === 'ROYAL') ? (isNightTime ? BG_ROYAL_NIGHT : BG_ROYAL_DAY) : (isNightTime ? BG_NIGHT : BG_DAY);
  if (currentSituation) currentBg = currentSituation.image;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden cursor-pointer select-none outline-none caret-transparent" onClick={handleScreenClick}>
      <div className="absolute inset-0 w-full h-full z-0">
        <img src={currentBg} alt="BG" className="w-full h-full object-cover transition-opacity duration-500"/>
      </div>

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-1 ${isLoveMode ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'radial-gradient(circle, rgba(255, 192, 203, 0.1) 40%, rgba(255, 20, 147, 0.3) 100%)' }} />

      {isLoveMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
           <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-pink-300 rounded-full blur-[4px] animate-pulse opacity-60" />
           <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-white rounded-full blur-[6px] animate-bounce opacity-50" style={{ animationDuration: '3s' }} />
           <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-pink-200 rounded-full blur-[2px] animate-ping opacity-70" style={{ animationDuration: '2s' }} />
        </div>
      )}

      {!currentSituation && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
          <img key={characterSrc} src={characterSrc} alt="Akari" className={`${imageStyle} w-auto object-cover relative drop-shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`} />
        </div>
      )}

      {showUI && (
        <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-3">
          <button onClick={(e) => { e.stopPropagation(); setShowManual(true); }} className="bg-white/80 hover:bg-pink-100 text-pink-600 p-2 rounded-full shadow-lg border-2 border-pink-200 transition-all transform hover:scale-110" title="取扱説明書">
            <BookOpen className="w-6 h-6" />
          </button>
          <button onClick={toggleMute} className="bg-white/80 hover:bg-gray-100 text-gray-600 p-2 rounded-full shadow-lg border-2 border-gray-200 transition-all transform hover:scale-110" title={isMuted ? "ミュート解除" : "ミュート"}>
             {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      )}

      {showUI && (
        <div className="absolute bottom-0 left-0 w-full z-20 pb-6 px-2 md:pb-8 md:px-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-32 pointer-events-none" >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`
              pointer-events-auto max-w-4xl mx-auto rounded-3xl p-4 shadow-2xl backdrop-blur-md border transition-colors duration-500
              ${isLoveMode ? 'bg-pink-900/10 border-pink-400/30' : 'bg-black/10 border-white/10'}
            `}
          >
            {/* ★修正箇所：名前表示を charName プロップに変更。これで日・英切り替えに対応します。 */}
            <div className="text-pink-400 font-bold text-lg mb-2 flex items-center gap-2 drop-shadow-md">
              <span>{charName}</span>
              {isLoveMode && <span className="text-xs text-white bg-pink-600/80 px-2 py-0.5 rounded-full border border-white/20 animate-pulse shadow-sm">❤ Love ❤</span>}
              {currentSituation && <span className="text-xs text-gray-300 bg-gray-800/80 px-2 py-0.5 rounded-full border border-white/20">イベント中</span>}
            </div>
            <div 
              ref={scrollRef} 
              className="text-white text-base md:text-xl leading-relaxed h-24 overflow-y-auto pr-2 custom-scrollbar select-text caret-auto drop-shadow-sm font-medium"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }} 
            >
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? displayedText : <span className="text-gray-300 text-sm animate-pulse">（あかりの返答を待っています...）</span>}
            </div>
          </div>
        </div>
      )}
      
      {showManual && <ManualModal onClose={() => setShowManual(false)} />}
      
      <div className="hidden">
        {Object.values(MAID_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(SANTA_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(SWIM_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(BUNNY_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(KIMONO_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(LOVE_IMAGES).map(s => <img key={s} src={s} />)}
        {SITUATION_DEFINITIONS.map(d => <img key={d.id} src={d.image} />)}
        <img src={BG_DAY} /><img src={BG_NIGHT} /><img src={ROOMWEAR_IMAGE} /><img src={ROOMWEAR_LOVE_IMAGE} />
        <img src={BG_ROYAL_DAY} /><img src={BG_ROYAL_NIGHT} />
      </div>
    </div>
  );
}