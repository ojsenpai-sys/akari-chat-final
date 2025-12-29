// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, X, Heart, Star, Sparkles, MessageCircle, Volume2, VolumeX, Maximize2, Minimize2, ChevronDown, Lock } from 'lucide-react';

// --- BGM設定 ---
const BGM_NORMAL = "/audio/bgm_normal.mp3";
const BGM_LOVE = "/audio/bgm_love.mp3";
const MAX_VOLUME = 0.4;
const FADE_STEP = 0.02;
const FADE_INTERVAL = 50;

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

// ★追加：黒髪ツインテール衣装の定義
const TWIN_MAID_EMOTIONS = {
  normal: "/images/akari_twin_normal.png",
  shy: "/images/akari_twin_shy.png",
  smile: "/images/akari_twin_smile.png",
  angry: "/images/akari_twin_normal.png",
  sad: "/images/akari_twin_sad.png",
  surprised: "/images/akari_twin_normal.png",
  smug: "/images/akari_twin_smug.png",
  wink: "/images/akari_twin_normal.png",
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

const LOVE_IMAGES = {
  maid: "/images/akari_maid_love.png",
  twin_maid: "/images/akari_twin_love.png", // ★追加
  santa: "/images/akari_santa_love.png",
  swimsuit: "/images/akari_swim_love.png",
  bunny: "/images/akari_bunny_love.png",
  kimono: "/images/akari_haregi_love.png"
};

const ROOMWEAR_IMAGE = "/images/akari_roomwear.png"; 
const ROOMWEAR_LOVE_IMAGE = "/images/akari_roomwear_love.png"; 

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

const EmotionParticles = ({ emotion }) => {
  if (emotion === 'smile' || emotion === 'wink') {
    return (
      <div className="absolute inset-0 pointer-events-none z-30">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute animate-ping" style={{
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`, animationDuration: '3s'
          }}>
            <Sparkles className="text-yellow-300 w-4 h-4 opacity-40" />
          </div>
        ))}
      </div>
    );
  }
  if (emotion === 'shy') {
    return (
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute animate-bounce" style={{
            bottom: '-10%', left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 2}s`,
            opacity: 0.6
          }}>
            <Heart className="text-pink-400 fill-pink-400 w-6 h-6" />
          </div>
        ))}
      </div>
    );
  }
  if (emotion === 'sad') {
    return (
      <div className="absolute inset-0 pointer-events-none z-30 bg-blue-900/10 transition-colors">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-[1px] h-8 bg-blue-200/40 animate-pulse" style={{
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            animationDuration: '1s'
          }} />
        ))}
      </div>
    );
  }
  if (emotion === 'angry') {
    return (
      <div className="absolute inset-0 pointer-events-none z-30 border-4 border-red-500/20 animate-pulse" />
    );
  }
  return null;
};

const ManualModal = ({ onClose, t }) => {
  const isJP = t.charName === 'あかり';
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] overflow-hidden shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-pink-500 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-bold text-lg md:text-xl">{t.manualTitle}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-pink-600 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar text-gray-800 space-y-8 bg-pink-50/30 text-left">
          <section>
            <h3 className="text-pink-600 font-bold text-xl border-b-2 border-pink-200 pb-2 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> {t.conceptTitle}
            </h3>
            <p className="font-bold text-lg mb-2 text-center text-gray-700">
              {isJP ? "「寂しさも、仕事の悩みも、これ1⼈で解決。」" : '"Solving loneliness and work worries, all by herself."'}
            </p>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {t.conceptDesc}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100">
                <h4 className="font-bold text-pink-500 mb-2">{isJP ? "A面：オタク友達として（癒やし）" : "A-Side: As an Otaku Friend (Healing)"}</h4>
                <div className="aspect-video bg-pink-100 rounded-md mb-2 overflow-hidden">
                    <img src="/images/akari_maid_love.png" className="w-full h-full object-cover object-top opacity-80" alt="Healing" />
                </div>
                <p className="text-xs text-gray-600">
                  {isJP ? "アニメの感想を語り合ったり、愚痴を聞いてもらったり。清楚な⾒た⽬で、実は重度のサブカル好き。「尊すぎて叫んでしまいましたわ︕」とあなたに共感します。" : "Discuss anime, share your daily stress, and more. She looks elegant but is secretly a hardcore subculture fan who sympathizes with your passion."}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <h4 className="font-bold text-blue-500 mb-2">{isJP ? "B面：超有能な秘書として（実務）" : "B-Side: As a Capable Assistant (Professional)"}</h4>
                <div className="aspect-video bg-blue-100 rounded-md mb-2 overflow-hidden">
                    <img src="/images/akari_normal.png" className="w-full h-full object-cover object-top opacity-80" alt="Work" />
                </div>
                <p className="text-xs text-gray-600">
                  {isJP ? "検索機能を駆使して、最新ニュースの取得、翻訳、コードのデバッグまでこなします。「ご主⼈様、最新のドキュメントをまとめましたわ」と、仕事の相棒としても活躍します。" : "She uses web search to get news, translate, and even debug code. She will be your reliable partner for professional tasks."}
                </p>
              </div>
            </div>
          </section>
          <div className="pt-8 pb-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-pink-500 mb-2 drop-shadow-sm">
              {isJP ? "さあ、あかりとの⽣活を始めましょう。" : "Start your life with Akari."}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VisualNovelDisplay({ messages, outfit = 'maid', currentPlan = 'free', affection = 0, onManualChange, onOutfitChange, charName = 'あかり', t }) {
  const [currentEmotion, setCurrentEmotion] = useState('normal');
  const [currentSituation, setCurrentSituation] = useState(null); 
  const [displayedText, setDisplayedText] = useState('');
  const [showUI, setShowUI] = useState(true);
  const [isNightTime, setIsNightTime] = useState(false); 
  const [isRoomwearTime, setIsRoomwearTime] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isShaking, setIsShaking] = useState(false);
  const [showOutfitMenu, setShowOutfitMenu] = useState(false); // ★衣装メニュー用

  const lastProcessedMessageId = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const scrollRef = useRef(null);
  const typingRef = useRef(null);

  const isLoveMode = affection >= 100;
  const plan = currentPlan?.toUpperCase() || 'FREE';
  const isJP = t?.charName === 'あかり';

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const fadeVolume = (targetVolume, callback) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    const audio = audioRef.current;
    if (!audio) return;
    fadeIntervalRef.current = setInterval(() => {
      const currentVol = audio.volume;
      if (Math.abs(currentVol - targetVolume) < FADE_STEP) {
        audio.volume = targetVolume;
        clearInterval(fadeIntervalRef.current);
        if (callback) callback();
      } else {
        audio.volume = currentVol < targetVolume 
          ? Math.min(MAX_VOLUME, currentVol + FADE_STEP)
          : Math.max(0, currentVol - FADE_STEP);
      }
    }, FADE_INTERVAL);
  };

  useEffect(() => {
    if (onManualChange) onManualChange(showManual);
  }, [showManual, onManualChange]);

  const handleScreenClick = () => {
    if (audioRef.current && audioRef.current.paused && !isMuted) {
      audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
      fadeVolume(MAX_VOLUME);
    }
    setShowUI(!showUI);
    setShowOutfitMenu(false); // クリックでメニューを閉じる
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      if (typingRef.current) clearInterval(typingRef.current);
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        // ★修正：改行詰めをここでも適用
        const cleanContent = lastMsg.content.replace(/\[.*?\]/g, '').replace(/\n\s*\n/g, '\n').trim();
        setDisplayedText(cleanContent);
      }
    }
    setIsExpanded(!isExpanded);
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
      audioRef.current.volume = 0;
    }
    const audio = audioRef.current;
    const targetSrc = isLoveMode ? BGM_LOVE : BGM_NORMAL;

    audio.muted = isMuted;

    if (!audio.src.includes(targetSrc)) {
      fadeVolume(0, () => {
        audio.src = targetSrc;
        if (!isMuted) {
          audio.play().then(() => {
            fadeVolume(MAX_VOLUME);
          }).catch(e => {});
        }
      });
    } else {
      if (isMuted) {
        fadeVolume(0); 
      } else {
        if (audio.paused && audio.src) {
          audio.play().then(() => fadeVolume(MAX_VOLUME)).catch(e => {});
        } else {
          fadeVolume(MAX_VOLUME);
        }
      }
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isLoveMode, isMuted]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === 'user') {
      const text = lastMsg.content;
      const nextSituation = SITUATION_DEFINITIONS.find(def => def.triggers.some(keyword => text.includes(keyword)));
      if (nextSituation) setCurrentSituation(nextSituation);
      else if (currentSituation && currentSituation.releases.some(keyword => text.includes(keyword))) setCurrentSituation(null);
    }

    if (lastMsg.role === 'assistant') {
      if (lastProcessedMessageId.current === lastMsg.id) return; 
      lastProcessedMessageId.current = lastMsg.id;
      setIsExpanded(false);
      if (typingRef.current) clearInterval(typingRef.current);
      let content = lastMsg.content;
      const emoKeyMap = { '通常': 'normal', '笑顔': 'smile', '怒り': 'angry', '照れ': 'shy', '悲しみ': 'sad', '驚き': 'surprised', 'ドヤ': 'smug', 'ウィンク': 'wink' };
      const emotionRegex = /\[(.*?)\]/g;
      let match;
      while ((match = emotionRegex.exec(content)) !== null) {
        const emo = emoKeyMap[match[1]];
        if (emo) {
          setCurrentEmotion(emo);
          if (emo === 'angry' || emo === 'surprised') triggerShake();
        }
      }
      
      // ★修正：2つ以上の連続する改行を1つにまとめ、空行を排除する
      const cleanContent = content.replace(/\[.*?\]/g, '').replace(/\n\s*\n/g, '\n').trim();
      
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
    if ((outfit === 'kimono' || outfit === 'twin_maid') && plan !== 'ROYAL') {
        if (typingRef.current) clearInterval(typingRef.current);
        setCurrentEmotion('sad'); 
        setDisplayedText(isJP ? "それはロイヤル会員さんだけの特別な衣装なので...ごめんなさい💦" : "I'm sorry, this outfit is for Royal members only...💦"); 
    }
  }, [outfit, plan, isJP]);

  useEffect(() => {
    if (isRoomwearTime && !isLoveMode) {
        if (typingRef.current) clearInterval(typingRef.current);
        setCurrentEmotion('shy');
        setDisplayedText(isJP ? "ご主人様、夜も更けてきましたのでそろそろ着替えさせていただきました。その…ご主人様の好きなルームウェアです。ちょっと恥ずかしいですけど…どうですか？" : "Master, it's getting late..."); 
    }
  }, [isRoomwearTime, isLoveMode, isJP]);

  let characterSrc = MAID_EMOTIONS[currentEmotion] || MAID_EMOTIONS.normal;
  let activeOutfit = outfit;

  if (outfit === 'swimsuit' || outfit === 'bunny') { 
    if (plan === 'FREE') activeOutfit = 'maid'; 
  } else if (outfit === 'santa' || outfit === 'kimono' || outfit === 'twin_maid') { 
    if (plan !== 'ROYAL') activeOutfit = 'maid'; 
  }

  if (isRoomwearTime && activeOutfit === 'maid') {
    characterSrc = isLoveMode ? ROOMWEAR_LOVE_IMAGE : ROOMWEAR_IMAGE;
  } else {
    if (isLoveMode) characterSrc = LOVE_IMAGES[activeOutfit] || LOVE_IMAGES.maid;
    else {
        switch (activeOutfit) {
          case 'twin_maid': characterSrc = TWIN_MAID_EMOTIONS[currentEmotion] || TWIN_MAID_EMOTIONS.normal; break;
          case 'santa': characterSrc = SANTA_EMOTIONS[currentEmotion] || SANTA_EMOTIONS.normal; break;
          case 'swimsuit': characterSrc = SWIM_EMOTIONS[currentEmotion] || SWIM_EMOTIONS.normal; break;
          case 'bunny': characterSrc = BUNNY_EMOTIONS[currentEmotion] || BUNNY_EMOTIONS.normal; break;
          case 'kimono': characterSrc = KIMONO_EMOTIONS[currentEmotion] || KIMONO_EMOTIONS.normal; break;
          default: characterSrc = MAID_EMOTIONS[currentEmotion] || MAID_EMOTIONS.normal;
        }
    }
  }

  // ★膝上表示のため twin_maid はメイドと同じ位置に設定
  const adjustPosition = (activeOutfit === 'santa' || activeOutfit === 'kimono') || isLoveMode;
  const imageScale = isLoveMode ? "scale-110" : "scale-100";
  const imageStyle = adjustPosition
    ? `h-[150%] w-auto -bottom-[60%] md:h-auto md:max-h-[220%] md:-bottom-[120%] ${imageScale}` 
    : "h-[140%] w-auto -bottom-[50%] md:h-auto md:max-h-[140%] md:-bottom-[45%]";

  let currentBg = (plan === 'ROYAL') ? (isNightTime ? BG_ROYAL_NIGHT : BG_ROYAL_DAY) : (isNightTime ? BG_NIGHT : BG_DAY);
  if (currentSituation) currentBg = currentSituation.image;

  const getWindowBorderColor = () => {
    if (isLoveMode) return 'border-pink-400';
    switch (currentEmotion) {
      case 'shy': return 'border-rose-300';
      case 'angry': return 'border-red-500';
      case 'smile': return 'border-yellow-300';
      case 'sad': return 'border-blue-400';
      default: return 'border-white/10';
    }
  };

  // ★衣装リスト
  const outfitList = [
    { id: 'maid', label: isJP ? '通常メイド' : 'Maid', royal: false },
    { id: 'twin_maid', label: isJP ? 'ツインテールメイド' : 'Twin Tail Maid', royal: true },
    { id: 'swimsuit', label: isJP ? '水着' : 'Swimsuit', royal: false },
    { id: 'bunny', label: isJP ? 'バニー' : 'Bunny', royal: false },
    { id: 'kimono', label: isJP ? '晴れ着' : 'Kimono', royal: true },
  ];

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden cursor-pointer select-none outline-none caret-transparent transition-transform duration-100 ${isShaking ? 'animate-bounce' : ''}`} onClick={handleScreenClick}>
      <div className="absolute inset-0 w-full h-full z-0"><img src={currentBg} alt="BG" className="w-full h-full object-cover transition-opacity duration-500"/></div>
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-1 ${isLoveMode ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'radial-gradient(circle, rgba(255, 192, 203, 0.1) 40%, rgba(255, 20, 147, 0.3) 100%)' }} />

      <EmotionParticles emotion={currentEmotion} />

      {!currentSituation && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
          <img key={characterSrc} src={characterSrc} alt="Akari" className={`${imageStyle} w-auto object-cover relative drop-shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`} />
        </div>
      )}

      {showUI && (
        <>
          {/* ★左上の衣装セレクター */}
          <div className="absolute top-4 left-4 z-50 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowOutfitMenu(!showOutfitMenu)}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-bold">{outfitList.find(o => o.id === outfit)?.label || outfit}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showOutfitMenu ? 'rotate-180' : ''}`} />
            </button>

            {showOutfitMenu && (
              <div className="absolute top-12 left-0 w-56 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {outfitList.map((item) => (
                  <button
                    key={item.id}
                    disabled={item.royal && plan !== 'ROYAL'}
                    onClick={() => {
                      if (onOutfitChange) onOutfitChange(item.id);
                      setShowOutfitMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${outfit === item.id ? 'bg-pink-500/20 text-pink-400' : 'text-white/80 hover:bg-white/10'} ${item.royal && plan !== 'ROYAL' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <span>{item.label}</span>
                    {item.royal && <Lock className={`w-3 h-3 ${plan === 'ROYAL' ? 'text-yellow-400' : 'text-gray-400'}`} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右上のメニュー */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-3">
            <button onClick={(e) => { e.stopPropagation(); setShowManual(true); }} className="bg-white/80 hover:bg-pink-100 text-pink-600 p-2 rounded-full shadow-lg border-2 border-pink-200 transition-all transform hover:scale-110" title="Manual"><BookOpen className="w-6 h-6" /></button>
            <button onClick={toggleMute} className="bg-white/80 hover:bg-gray-100 text-gray-600 p-2 rounded-full shadow-lg border-2 border-gray-200 transition-all transform hover:scale-110" title="Mute">{isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}</button>
          </div>
        </>
      )}

      {showUI && (
        <div className="absolute bottom-0 left-0 w-full z-40 pb-6 px-2 md:pb-8 md:px-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32 pointer-events-none" >
          <div onClick={(e) => e.stopPropagation()} className={`pointer-events-auto max-w-4xl mx-auto rounded-3xl p-4 shadow-2xl backdrop-blur-lg border-2 transition-all duration-500 ${getWindowBorderColor()} ${isLoveMode ? 'bg-pink-900/20' : 'border-white/10 bg-black/20'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-pink-400 font-bold text-lg flex items-center gap-2 drop-shadow-md">
                <span>{t.charName}</span>
                {isLoveMode && <span className="text-xs text-white bg-pink-600/80 px-2 py-0.5 rounded-full border border-white/20 animate-pulse shadow-sm">❤ Love ❤</span>}
                {currentSituation && <span className="text-xs text-gray-300 bg-gray-800/80 px-2 py-0.5 rounded-full border border-white/20">{isJP ? 'イベント中' : 'EVENT'}</span>}
              </div>
              
              <button onClick={toggleExpand} className="text-white/60 hover:text-white transition-colors p-1" title={isExpanded ? "Close" : "Expand All"}>
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>

            <div 
              ref={scrollRef} 
              className={`whitespace-pre-wrap text-white text-base md:text-xl leading-relaxed overflow-y-auto pr-2 custom-scrollbar select-text caret-auto drop-shadow-sm font-medium transition-all duration-500 ${isExpanded ? 'h-64' : 'h-24'}`} 
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? displayedText : <span className="text-gray-300 text-sm animate-pulse">{isJP ? '（あかりの返答を待っています...）' : '...'}</span>}
            </div>
          </div>
        </div>
      )}
      
      {showManual && <ManualModal onClose={() => setShowManual(false)} t={t} />}
      
      <div className="hidden">
        {Object.values(MAID_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(TWIN_MAID_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(SANTA_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(SWIM_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(BUNNY_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(KIMONO_EMOTIONS).map(s => <img key={s} src={s} />)}
        {Object.values(LOVE_IMAGES).map(s => <img key={s} src={s} />)}
        {SITUATION_DEFINITIONS.map(d => <img key={d.id} src={d.image} />)}
      </div>
    </div>
  );
}