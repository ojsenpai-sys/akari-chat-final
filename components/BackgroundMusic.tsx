'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type Props = {
  isLoveMode: boolean; // 親密度100以上なら true
};

export default function BackgroundMusic({ isLoveMode }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);     // ミュート状態
  const [hasInteracted, setHasInteracted] = useState(false); // ユーザーが画面を触ったか

  // ファイルの場所
  const normalBgm = '/audio/bgm_normal.mp3';
  const loveBgm = '/audio/bgm_love.mp3';

  // 1. 再生ロジック（親密度が変わったら曲を変える）
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;  // ループ再生
      audioRef.current.volume = 0.3; // 音量は控えめに
    }

    const audio = audioRef.current;
    const targetSrc = isLoveMode ? loveBgm : normalBgm;

    // URL比較（すでに同じ曲ならリロードしない）
    // ※ローカル開発環境だと http://localhost... がつくので endsWith で判定
    if (!audio.src.endsWith(targetSrc.substring(1))) {
      audio.src = targetSrc;
      // ユーザーが一度でも操作済みなら、即座に再生
      if (hasInteracted && !isMuted) {
        audio.play().catch(e => console.log("再生待機中:", e));
      }
    }
  }, [isLoveMode, hasInteracted, isMuted, normalBgm, loveBgm]);

  // 2. 初回クリックで再生開始（ブラウザ制限対策）
  useEffect(() => {
    const startAudio = () => {
      setHasInteracted(true);
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log("再生エラー:", e));
      }
      // リスナー解除
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);
    
    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, [isMuted]);

  // 3. ミュート切替
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className={`p-3 rounded-full text-white border border-white/20 shadow-lg transition-all ${
            isMuted ? 'bg-gray-600/80' : 'bg-pink-600/80 hover:bg-pink-500 animate-pulse'
        }`}
        title={isMuted ? "BGMを再生" : "BGMをミュート"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
}