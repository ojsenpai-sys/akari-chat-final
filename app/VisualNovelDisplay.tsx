// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

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

// ★更新：晴れ着（Kimono）の定義（通常時）
// 指定されたファイル名に変更。指定がない感情はnormalをフォールバックとして使用。
const KIMONO_EMOTIONS = {
  normal: "/images/akari_haregi_normal.png",
  shy: "/images/akari_haregi_shy.png",
  smile: "/images/akari_haregi_smile.png",
  sad: "/images/akari_haregi_sad.png",
  smug: "/images/akari_haregi_smug.png",
  // 以下の感情画像がない場合は normal を使用する設定
  angry: "/images/akari_haregi_normal.png",
  surprised: "/images/akari_haregi_normal.png",
  wink: "/images/akari_haregi_normal.png",
};

// ★ラブラブモード用画像（親密度100以上で使用）
const LOVE_IMAGES = {
  maid: "/images/akari_maid_love.png",
  santa: "/images/akari_santa_love.png",
  swimsuit: "/images/akari_swim_love.png",
  bunny: "/images/akari_bunny_love.png",
  kimono: "/images/akari_haregi_love.png" // ★更新
};

const ROOMWEAR_IMAGE = "/images/akari_roomwear.png";

// 背景画像（jpg）
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

export default function VisualNovelDisplay({ messages, outfit = 'maid', currentPlan = 'free', affection = 0 }) {
  const [currentEmotion, setCurrentEmotion] = useState('normal');
  const [currentSituation, setCurrentSituation] = useState(null); 
  const [displayedText, setDisplayedText] = useState('');
  const [showUI, setShowUI] = useState(true);
  const [isNightTime, setIsNightTime] = useState(false); 
  const [isRoomwearTime, setIsRoomwearTime] = useState(false); 
  const scrollRef = useRef(null);
  
  // ★修正：タイマー競合を防ぐためのRef
  const typingRef = useRef(null);

  const isLoveMode = affection >= 100;

  // プランの正規化
  const plan = currentPlan?.toUpperCase() || 'FREE';

  const toggleUI = () => setShowUI(!showUI);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsNightTime(hour >= 18 || hour < 5);
      
      // ★修正：状態が変わった瞬間を検知するために変数化
      const isRoomwear = (hour >= 23 || hour < 5);
      setIsRoomwearTime(isRoomwear);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // メッセージ表示ロジック（通常）
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
      // ★新しいメッセージが来たら、ルームウェアの独り言タイマーなどをクリアして優先する
      if (typingRef.current) clearInterval(typingRef.current);

      let content = lastMsg.content;
      const emotionRegex = /\[(.*?)\]/g;
      let match;
      const emoKeyMap = { '通常': 'normal', '笑顔': 'smile', '怒り': 'angry', '照れ': 'shy', '悲しみ': 'sad', '驚き': 'surprised', 'ドヤ': 'smug', 'ウィンク': 'wink' };

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
    return () => {
        if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [messages, currentSituation]);


  // ★追加：晴れ着制限（非ロイヤル会員へのお断りメッセージ）
  useEffect(() => {
    if (outfit === 'kimono' && plan !== 'ROYAL') {
        // 既存のタイマーをクリア
        if (typingRef.current) clearInterval(typingRef.current);

        // 表情を「困り」や「悲しみ」に設定（ここではsad）
        setCurrentEmotion('sad'); 

        // 指定のメッセージ
        const rejectionText = "それはロイヤル会員さんだけの特別な衣装なので...ごめんなさい💦";
        
        setDisplayedText('');
        let i = 0;
        typingRef.current = setInterval(() => {
            setDisplayedText(rejectionText.substring(0, i + 1));
            i++;
            if (i >= rejectionText.length) clearInterval(typingRef.current);
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 30);
    }
  }, [outfit, plan]);


  // ★追加：23時（ルームウェア時間）になった瞬間のイベント
  useEffect(() => {
    if (isRoomwearTime && !isLoveMode) { // ラブラブモード以外のときだけ発動
        if (typingRef.current) clearInterval(typingRef.current);

        setCurrentEmotion('shy');
        const specialText = "ご主人様、夜も更けてきましたのでそろそろ着替えさせていただきました。その…ご主人様の好きなルームウェアです。ちょっと恥ずかしいですけど…どうですか？";
        
        setDisplayedText('');
        let i = 0;
        typingRef.current = setInterval(() => {
            setDisplayedText(specialText.substring(0, i + 1));
            i++;
            if (i >= specialText.length) clearInterval(typingRef.current);
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 30);
    }
  }, [isRoomwearTime]);

  // --- 画像決定 ---
  let characterSrc = MAID_EMOTIONS[currentEmotion] || MAID_EMOTIONS.normal;
  
  let activeOutfit = outfit;

  // プランによる衣装強制変更ロジック
  if (outfit === 'swimsuit' || outfit === 'bunny') {
    if (plan === 'FREE') activeOutfit = 'maid';
  } else if (outfit === 'santa') {
    if (plan !== 'ROYAL') activeOutfit = 'maid';
  } else if (outfit === 'kimono') { // ★追加：晴れ着制限
    if (plan !== 'ROYAL') activeOutfit = 'maid';
  }

  if (isRoomwearTime && activeOutfit === 'maid' && !isLoveMode) {
    characterSrc = ROOMWEAR_IMAGE;
  } else {
    if (isLoveMode) {
        characterSrc = LOVE_IMAGES[activeOutfit] || LOVE_IMAGES.maid;
    } else {
        switch (activeOutfit) {
          case 'santa':
            characterSrc = SANTA_EMOTIONS[currentEmotion] || SANTA_EMOTIONS.normal;
            break;
          case 'swimsuit':
            characterSrc = SWIM_EMOTIONS[currentEmotion] || SWIM_EMOTIONS.normal;
            break;
          case 'bunny':
            characterSrc = BUNNY_EMOTIONS[currentEmotion] || BUNNY_EMOTIONS.normal;
            break;
          case 'kimono': // ★追加
            characterSrc = KIMONO_EMOTIONS[currentEmotion] || KIMONO_EMOTIONS.normal;
            break;
          default:
            characterSrc = MAID_EMOTIONS[currentEmotion] || MAID_EMOTIONS.normal;
        }
    }
  }

  // ★スマホ版のサイズ調整
  // 晴れ着も少し大きめに見せたい場合はここに追加（サンタと同じ扱いにする）
  const adjustPosition = (activeOutfit === 'santa' || activeOutfit === 'kimono') || isLoveMode;
  const imageScale = isLoveMode ? "scale-110" : "scale-100";

  const imageStyle = adjustPosition
    // サンタ・晴れ着・デレモード用
    ? `h-[150%] w-auto -bottom-[60%] md:h-auto md:max-h-[220%] md:-bottom-[120%] ${imageScale}` 
    // 通常時
    : "h-[140%] w-auto -bottom-[50%] md:h-auto md:max-h-[140%] md:-bottom-[45%]";

  let currentBg = isNightTime ? BG_NIGHT : BG_DAY;
  if (plan === 'ROYAL') {
    currentBg = isNightTime ? BG_ROYAL_NIGHT : BG_ROYAL_DAY;
  }
  if (currentSituation) {
    currentBg = currentSituation.image;
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden cursor-pointer select-none outline-none caret-transparent" onClick={toggleUI}>
      {/* 背景レイヤー */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img src={currentBg} alt="BG" className="w-full h-full object-cover transition-opacity duration-500"/>
      </div>

      {/* デレフィルター */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-1 ${
          isLoveMode ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(255, 192, 203, 0.1) 40%, rgba(255, 20, 147, 0.3) 100%)',
        }}
      />

      {/* デレ演出 */}
      {isLoveMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
           <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-pink-300 rounded-full blur-[4px] animate-pulse opacity-60" />
           <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-white rounded-full blur-[6px] animate-bounce opacity-50" style={{ animationDuration: '3s' }} />
           <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-pink-200 rounded-full blur-[2px] animate-ping opacity-70" style={{ animationDuration: '2s' }} />
        </div>
      )}

      {/* キャラクター画像 */}
      {!currentSituation && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
          <img 
            key={characterSrc} 
            src={characterSrc} 
            alt="Akari" 
            className={`${imageStyle} w-auto object-cover relative drop-shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}
          />
        </div>
      )}

      {/* UIウィンドウ */}
      {showUI && (
        <div className="absolute bottom-0 left-0 w-full z-20 pb-6 px-2 md:pb-8 md:px-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-32 pointer-events-none" >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`
              pointer-events-auto max-w-4xl mx-auto rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md border transition-colors duration-500
              ${isLoveMode 
                ? 'bg-pink-900/10 border-pink-400/30'
                : 'bg-black/10 border-white/10'
              }
            `}
          >
            <div className="text-pink-400 font-bold text-lg mb-2 flex items-center gap-2 drop-shadow-md">
              <span>あかり</span>
              {isLoveMode && <span className="text-xs text-white bg-pink-600/80 px-2 py-0.5 rounded-full border border-white/20 animate-pulse shadow-sm">❤ Love ❤</span>}
              {currentSituation && <span className="text-xs text-gray-300 bg-gray-800/80 px-2 py-0.5 rounded-full border border-white/20">イベント中</span>}
            </div>
            <div 
              ref={scrollRef} 
              className="text-white text-base md:text-xl leading-relaxed h-32 overflow-y-auto pr-2 custom-scrollbar select-text caret-auto drop-shadow-sm font-medium"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }} 
            >
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? displayedText : <span className="text-gray-300 text-sm animate-pulse">（あかりの返答を待っています...）</span>}
            </div>
          </div>
        </div>
      )}
      
      {/* プリロード */}
      <div className="hidden">
        {Object.values(MAID_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(SANTA_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(SWIM_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(BUNNY_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(KIMONO_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(LOVE_IMAGES).map(s => <img key={s} src={s} />)}
        {SITUATION_DEFINITIONS.map(d => <img key={d.id} src={d.image} />)}
        <img src={BG_DAY} /><img src={BG_NIGHT} /><img src={ROOMWEAR_IMAGE} />
        <img src={BG_ROYAL_DAY} /><img src={BG_ROYAL_NIGHT} />
      </div>
    </div>
  );
}