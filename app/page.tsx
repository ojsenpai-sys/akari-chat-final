"use client";

import React, { useState, useEffect } from 'react';
import { Send, Settings } from 'lucide-react';
// インストール済みの最新SDKを指定
import { useChat } from '@ai-sdk/react';
import VisualNovelDisplay from './VisualNovelDisplay';

export default function Home() {
  // ★魔法1： (as any) を使って、useChat周りの型エラーを強制的に無視させる
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    onError: (e: any) => console.error("Chat Error:", e),
  } as any) as any;

  // ユーザーIDなど
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('ご主人様');
  const [showSettings, setShowSettings] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // 1. 初回起動時
  useEffect(() => {
    let storedId = localStorage.getItem("akari_user_id");
    if (!storedId) {
      storedId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("akari_user_id", storedId);
    }
    setUserId(storedId);

    setMessages([
      { 
        id: 'welcome', 
        // ★魔法2： (as const) をつけて、roleのエラーを回避
        role: 'assistant' as const, 
        content: `[笑顔]おかえりなさいませ、${userName}！ ずっとお待ちしておりましたわ。` 
      }
    ]);
  }, []);

  // 名前保存時の処理
  const saveName = () => {
    setShowSettings(false);
    setMessages([
      ...messages,
      { 
        id: Date.now().toString(),
        // ★魔法2：ここにも (as const)
        role: 'assistant' as const, 
        content: `[照れ]承知いたしました。これからは「${userName}」とお呼びしますね。改めまして、よろしくお願いします。` 
      }
    ]);
  };

  // エンターキーの制御（IME対応）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || isComposing) {
        return;
      }
      e.preventDefault();
      
      handleSubmit(e as any, {
        body: {
          userId: userId,
          userName: userName,
        },
      });
    }
  };

  return (
    <main className="flex h-screen flex-col bg-black overflow-hidden relative">
      <div className="flex-1 relative z-0">
        <VisualNovelDisplay messages={messages} />
      </div>

      {showSettings && (
        <div className="absolute top-20 right-4 z-[60] bg-gray-900/95 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-md w-72 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-pink-400 font-bold mb-4">呼び方の設定</h3>
          <input 
            type="text" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-black/50 text-white border border-white/10 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-pink-500"
            placeholder="例：お兄様、〇〇様"
          />
          <button 
            onClick={saveName}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg transition-colors font-bold"
          >
            設定を保存
          </button>
        </div>
      )}

      <div className="h-24 bg-gray-900 border-t border-white/10 p-4 flex items-center justify-center z-50">
        <form 
          className="w-full max-w-2xl flex gap-4 items-center bg-gray-800 p-2 rounded-full border border-white/5 shadow-inner"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e, { body: { userId, userName } });
          }}
        >
          <button 
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors ${showSettings ? 'text-pink-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings size={24} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
            placeholder="あかりに話しかける..."
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none"
          />
          
          <button type="submit" className="p-3 rounded-full bg-pink-600 text-white shadow-lg hover:bg-pink-500 transition-colors">
            <Send size={20} />
          </button>
        </form>
      </div>
    </main>
  );
}