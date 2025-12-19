"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Shirt, X, Check } from 'lucide-react';

// --- 設定エリア ---
const EMOTION_MAP: { [key: string]: string } = {
  '通常': 'normal',
  '笑顔': 'smile',
  '照れ': 'shy',
  '怒り': 'angry',
  '悲しみ': 'sad',
  '驚き': 'surprised',
  'ドヤ': 'smug',
  'ウィンク': 'wink',
};

const OUTFITS = ['maid', 'swim', 'bunny'] as const;
type Outfit = typeof OUTFITS[number];

const OUTFIT_LABELS: Record<Outfit, string> = {
  maid: 'メイド服',
  swim: '水着',
  bunny: 'バニーガール',
};

const OUTFIT_REACTIONS: Record<Outfit, { text: string; emotion: string }> = {
  maid: { text: "お待たせしました。基本のメイド服に戻りましたわ。やっぱりこれが一番落ち着きますね。", emotion: "笑顔" },
  swim: { text: "えっと…ご主人様、その…水着、似合ってますか？ あまりじろじろ見ないでください…。", emotion: "照れ" },
  bunny: { text: "どうですか？ …バニーガール。恥ずかしいですけど、ご主人様のために頑張りましたわ！", emotion: "照れ" }
};

const IMAGES = {
  bg: { day: '/images/bg_room_day.png', night: '/images/bg_room_night.png' },
};

// イベント発動ワード
const EVENT_TRIGGERS: Record<string, string[]> = {
  "event_sleeping.png": ["寝よう", "おやすみ", "布団", "一緒に寝"],
  "event_washing.png": ["背中流", "お風呂", "入浴", "洗いっこ"],
  "event_christmas.png": ["クリスマス", "イルミネーション", "デート", "外に行こう"],
  "event_cooking.png": ["お腹すい", "ご飯作って", "何か作って", "オムライス"],
  "event_dining.png": ["いただきます", "一緒に食べ", "ご飯食べる", "モグモグ"],
  "event_massage.png": ["疲れた", "肩凝った", "マッサージ", "癒やして"],
  "event_yoga.png": ["ヨガ", "運動", "ストレッチ", "ポーズ"],
  "event_onsen.png": ["温泉", "混浴", "露天風呂", "湯船"]
};

const RELEASE_KEYWORDS = ["おはよう", "起きて", "上がろう", "服着て", "帰ろう", "ごちそうさま", "終わろう", "戻って", "通常"];

type Props = {
  messages: any[];
};

export default function VisualNovelDisplay({ messages }: Props) {
  const lastMessage = messages[messages.length - 1];
  const isUser = lastMessage?.role === 'user';
  
  const [displayText, setDisplayText] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('通常');
  const [currentOutfit, setCurrentOutfit] = useState<Outfit>('maid');
  const [currentEventImage, setCurrentEventImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [showUI, setShowUI] = useState(true);
  const [showOutfitMenu, setShowOutfitMenu] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------------------------------
  // ★バグ修正1: 画像プリロード（点滅防止）
  // ----------------------------------------------------------------
  useEffect(() => {
    const imagesToPreload = [
      IMAGES.bg.day,
      IMAGES.bg.night,
      ...Object.keys(EVENT_TRIGGERS).map(img => `/images/${img}`),
      ...OUTFITS.flatMap(outfit => 
        Object.values(EMOTION_MAP).map(emotion => `/images/akari_${outfit}_${emotion}.png`)
      )
    ];

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // ユーザーID管理 & ロード
  useEffect(() => {
    let storedId = localStorage.getItem('akari_user_id');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('akari_user_id', storedId);
    }
    setUserId(storedId);

    const loadState = async () => {
      try {
        const res = await fetch(`/api/user/sync?userId=${storedId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.currentOutfit) setCurrentOutfit(data.currentOutfit as Outfit);
          if (data.currentEvent) setCurrentEventImage(data.currentEvent);
        }
      } catch (e) { console.error("状態ロード失敗:", e); }
    };
    loadState();
  }, []);

  // DB保存
  const saveStateToDB = async (outfit: string, event: string | null) => {
    if (!userId) return;
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, outfit, event }),
      });
    } catch (e) { console.error("状態保存失敗:", e); }
  };

  const getCharacterImagePath = () => {
    const emotionKey = EMOTION_MAP[currentEmotion] || 'normal';
    return `/images/akari_${currentOutfit}_${emotionKey}.png`;
  };

  const playVoice = async (text: string, emotion: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, emotion }), 
      });
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) { console.error(e); }
  };

  const startTyping = (text: string) => {
    if (typingTimeoutRef.current) clearInterval(typingTimeoutRef.current);
    let charIndex = 0;
    setDisplayText('');
    
    typingTimeoutRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        if (typingTimeoutRef.current) clearInterval(typingTimeoutRef.current);
      }
    }, 30);
  };

  const changeOutfit = (outfit: Outfit) => {
    setCurrentOutfit(outfit);
    setShowOutfitMenu(false);
    setCurrentEventImage(null);
    saveStateToDB(outfit, null);

    const reaction = OUTFIT_REACTIONS[outfit];
    setCurrentEmotion(reaction.emotion);
    startTyping(reaction.text);
    playVoice(reaction.text, reaction.emotion);
  };

  // メッセージ監視・イベント判定
  useEffect(() => {
    if (!lastMessage) return;

    const fullText = lastMessage.content;
    let nextEvent = currentEventImage;
    
    // ----------------------------------------------------------------
    // ★バグ修正2: イベント自爆防止
    // 必ず「ユーザーの発言(isUser)」である場合のみイベント判定を行う
    // ----------------------------------------------------------------
    if (isUser) {
      if (RELEASE_KEYWORDS.some(word => fullText.includes(word))) {
        nextEvent = null;
      } else {
        for (const [imageFile, keywords] of Object.entries(EVENT_TRIGGERS)) {
          if (keywords.some(word => fullText.includes(word))) {
            nextEvent = imageFile;
            break;
          }
        }
      }
      
      // 状態変化があれば保存
      if (nextEvent !== currentEventImage) {
        setCurrentEventImage(nextEvent);
        saveStateToDB(currentOutfit, nextEvent);
      }
    }

    // あかりのターン（ユーザーじゃない場合）のみ、表情変更と読み上げを行う
    if (!isUser) {
      let cleanText = fullText;
      Object.keys(EMOTION_MAP).forEach(tag => {
        const regex = new RegExp(`[\\[\\(【]${tag}[\\]\\)】]`, 'g');
        cleanText = cleanText.replace(regex, '');
      });
      cleanText = cleanText.trim();

      const match = fullText.match(/[\[\(【](.*?)[\]\)】]/);
      const emotionWord = match ? match[1] : '通常';
      const nextEmotion = EMOTION_MAP[emotionWord] ? emotionWord : '通常';

      setCurrentEmotion(nextEmotion);
      startTyping(cleanText);
      playVoice(cleanText, nextEmotion);
    }

    return () => {
      if (typingTimeoutRef.current) clearInterval(typingTimeoutRef.current);
    };
  }, [messages, lastMessage]); // 依存配列を最小限に

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = `/images/akari_normal.png`;
  };

  return (
    <div className="w-full h-full relative flex justify-center items-end bg-black cursor-pointer overflow-hidden" onClick={() => setShowUI(!showUI)}>
      <audio ref={audioRef} preload="auto" />
      
      {/* ---------------------------------------------------------------- */}
      {/* ★バグ修正3: イベント画像のスマホスクロール対応 */}
      {/* overflow-autoを追加し、画像サイズを大きく保つことでスクロール可能に */}
      {/* ---------------------------------------------------------------- */}
      {currentEventImage ? (
        <div className="absolute inset-0 z-10 animate-in fade-in duration-700 overflow-auto bg-black">
           <div className="min-w-full min-h-full flex justify-center items-center">
             <img 
              src={`/images/${currentEventImage}`}
              alt="Event"
              // min-w-[100vw]で画面幅いっぱいを保証しつつ、object-coverで綺麗に見せる
              className="min-w-[100vw] min-h-[100vh] object-cover"
              onError={() => setCurrentEventImage(null)}
            />
           </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.bg.day})` }} />
          <div className="absolute inset-0 flex justify-center items-start pointer-events-none z-10">
            <img 
              src={getCharacterImagePath()}
              onError={handleImageError}
              alt="あかり"
              className="h-[110vh] max-w-none object-contain translate-y-[2vh] drop-shadow-2xl transition-all duration-300" 
            />
          </div>
        </>
      )}

      {/* 衣装メニュー */}
      <div 
        className={`absolute top-4 left-4 z-50 transition-all duration-500 flex flex-col items-start gap-2 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={() => setShowOutfitMenu(!showOutfitMenu)}
          className={`p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 ${showOutfitMenu ? 'bg-pink-600 border-pink-400 text-white rotate-90' : 'bg-black/50 border-white/20 text-white hover:bg-pink-600/80'}`}
        >
          {showOutfitMenu ? <X size={24} /> : <Shirt size={24} />}
        </button>

        {showOutfitMenu && (
          <div className="bg-black/80 border border-white/20 rounded-xl p-2 flex flex-col gap-1 backdrop-blur-md shadow-2xl animate-in slide-in-from-left-4 fade-in duration-200">
            {OUTFITS.map((outfit) => (
              <button
                key={outfit}
                onClick={() => changeOutfit(outfit)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all w-48 text-left ${
                  currentOutfit === outfit 
                    ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="w-5 flex justify-center">
                   {currentOutfit === outfit && <Check size={16} />}
                </div>
                {OUTFIT_LABELS[outfit]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* ★バグ修正4: セリフ枠のスクロール対応 */}
      {/* ---------------------------------------------------------------- */}
      <div className={`absolute bottom-4 left-0 right-0 mx-auto w-[90%] max-w-2xl z-50 transition-all duration-500 transform ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
        <div className="bg-black/60 border border-white/20 rounded-2xl p-4 min-h-[100px] max-h-[40vh] overflow-y-auto backdrop-blur-md shadow-2xl">
          <div className="text-pink-400 font-bold text-lg mb-1 drop-shadow-md sticky top-0 bg-black/0">あかり</div>
          <div className="text-white text-base leading-relaxed font-medium drop-shadow-sm whitespace-pre-wrap">{displayText}</div>
        </div>
      </div>
    </div>
  );
}