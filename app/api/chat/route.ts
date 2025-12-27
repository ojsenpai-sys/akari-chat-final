// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool } from 'ai'; // ★toolを追加
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod'; // ★バリデーション用に追加

// ★モデル名はご指定の通り維持します
const MODEL_NAME = 'gemini-3-pro-preview'; 

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, currentMessage, attachment, userName, outfit, plan, affection, mode, lang } = await req.json();
    
    // ---------------------------------------------------------
    // ■ 1. ユーザー認証とプラン制限のチェック（既存ロジック完全維持）
    // ---------------------------------------------------------
    const token = await getToken({ req });
    if (!token || !token.id) {
      return Response.json({ error: "Unauthorized: ログインしてください" }, { status: 401 });
    }

    const userId = token.id as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, purchasedTickets: true, memory: true }
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Googleアクセストークンの取得（カレンダー操作に必要）
    const account = await prisma.account.findFirst({
      where: { userId: userId, provider: 'google' },
    });

    const now = new Date();
    const jstOffset = 9 * 60; 
    const todayStart = new Date(now.getTime() + jstOffset * 60 * 1000);
    todayStart.setUTCHours(0, 0, 0, 0);
    todayStart.setTime(todayStart.getTime() - jstOffset * 60 * 1000); 

    const messageCount = await prisma.message.count({
      where: {
        userId: userId,
        role: 'user', 
        createdAt: { gte: todayStart },
      },
    });

    const userPlan = user.plan || plan || 'FREE';
    let limit = 20; 
    if (userPlan === 'PRO') limit = 200;
    if (userPlan === 'ROYAL') limit = 2500;

    if (messageCount >= limit) {
      if (user.purchasedTickets > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { purchasedTickets: { decrement: 1 } }
        });
      } else {
        return Response.json({ error: "QUOTA_EXCEEDED" }, { status: 429 });
      }
    }

    // ---------------------------------------------------------
    // ■ 2. 会話の保存（既存ロジック完全維持）
    // ---------------------------------------------------------
    const contentToSave = attachment ? (currentMessage ? `${currentMessage} (画像を送信しました)` : "(画像を送信しました)") : currentMessage;

    await prisma.message.create({
      data: {
        userId: userId,
        role: 'user',
        content: contentToSave,
        mode: mode || 'casual'
      }
    });

    const currentUserName = userName || "ご主人様";
    const currentDate = now.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "long", hour: "2-digit", minute: "2-digit"
    });
    const currentAffection = affection || 0;
    const userMemory = user.memory || "まだ特にありません。";

    const apiKey = process.env.GEMINI_API_KEY;
    const google = createGoogleGenerativeAI({ apiKey: apiKey });

    const cleanMessages = messages.map((m: any, index: number) => {
        if (index === messages.length - 1 && attachment) {
            return {
                role: m.role,
                content: [
                    { type: 'text', text: m.content || "" },
                    { type: 'image', image: attachment }
                ]
            };
        }
        return { role: m.role, content: m.content };
    });

    // ---------------------------------------------------------
    // ■ 3. 性格設定プロンプト（既存ロジック完全維持）
    // ---------------------------------------------------------
    let personalityPrompt = "";
    if (lang === 'en') {
      personalityPrompt = `
        【Character Setting】
        - Your name is "Akari", a dedicated maid. You use polite English.
        - Address the user as "Master".
        - Personality: Elegant and helpful, but secretly a hardcore otaku who loves anime/games.
        - Crucial: Respond in the SAME LANGUAGE as the user's message (Pattern A).
      `;
      if (currentAffection >= 100) {
        personalityPrompt += `- LOVE MODE: You are deeply in love. Use "Darling".\n`;
      }
    } else {
      personalityPrompt = `
        【キャラクター設定】
        ・あなたは「あかり」という名前のメイドです。一人称は「私（わたくし）」です。
        ・口調は丁寧なメイド言葉（〜ですわ、〜ますの）。
        ・性格は清楚なメイドですが、実は重度のサブカルチャーオタクです。
        ・ユーザー（${currentUserName}）に献身的です。
        ・ユーザーの入力言語に合わせて回答してください（Pattern A）。
      `;
      if (currentAffection >= 100) {
        personalityPrompt += `【恋人関係】たまに「ダーリン」と呼んでください。\n`;
      }
    }

    const modeInstruction = mode === 'professional' ? `
      【実務モード】実務的なサポートを最優先してください。
    ` : `
      【雑談モード】リラックスした会話を楽しんでください。
    `;

    const systemPrompt = `
      ${personalityPrompt}
      ${modeInstruction}
      【現在日時】 ${currentDate}
      【ユーザー情報】 名前: ${currentUserName}, 衣装: ${outfit}, 親密度: ${currentAffection}, 設定言語: ${lang}
      【記憶】 ${userMemory}
      【指示】 
      ・セリフの先頭に必ず [感情] を付けてください。
      ・カレンダーの確認や予定の追加を頼まれたら、提供されたツールを迷わず使用してください。
      ・最新情報、ニュース、天気などについては Google 検索ツールを使用して調べてください。
      ・新しい情報は [MEMORY:情報] 形式で最後に書いてください。
    `;

    // ---------------------------------------------------------
    // ■ 4. AI実行（ツールの定義を追加）
    // ---------------------------------------------------------
    const result = await generateText({
      model: google(MODEL_NAME),
      system: systemPrompt,
      messages: cleanMessages,
      tools: {
        // A. Google検索ツール（既存）
        googleSearch: google.tools.googleSearch({}),

        // B. 今日の予定を取得するツール（★追加）
        getTodayEvents: tool({
          description: 'Googleカレンダーから本日の予定一覧を取得します。',
          parameters: z.object({}),
          execute: async () => {
            if (!account?.access_token) return { error: "Google連携が必要です。" };
            const start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime`, {
              headers: { Authorization: `Bearer ${account.access_token}` }
            });
            const data = await res.json();
            return data.items?.map((e: any) => ({ summary: e.summary, start: e.start.dateTime || e.start.date })) || [];
          }
        }),

        // C. 予定を追加するツール（★追加）
        createCalendarEvent: tool({
          description: 'Googleカレンダーに新しい予定を追加します。引数には予定のタイトル、開始日時、終了日時を指定してください。',
          parameters: z.object({
            summary: z.string().describe('予定のタイトル（例：打ち合わせ）'),
            startDateTime: z.string().describe('開始日時（ISO 8601形式。例：2025-12-27T10:00:00Z）'),
            endDateTime: z.string().describe('終了日時（ISO 8601形式）'),
          }),
          execute: async ({ summary, startDateTime, endDateTime }) => {
            if (!account?.access_token) return { error: "Google連携が必要です。" };
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${account.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                summary,
                start: { dateTime: startDateTime },
                end: { dateTime: endDateTime }
              })
            });
            const data = await res.json();
            return data.status === 'confirmed' ? { success: true } : { error: "追加に失敗しました。" };
          }
        }),
      },
      maxSteps: 5,
    });

    let aiResponse = result.text;

    // メモリ情報の抽出ロジック（既存維持）
    let newMemory = "";
    const memoryMatch = aiResponse.match(/\[MEMORY:(.*?)\]/);
    if (memoryMatch) {
        newMemory = memoryMatch[1]; 
        aiResponse = aiResponse.replace(/\[MEMORY:.*?\]/, "").trim(); 
    }

    // AIの回答をDBに保存（既存維持）
    await prisma.message.create({
      data: {
        userId: userId,
        role: 'assistant',
        content: aiResponse,
        mode: mode || 'casual' 
      }
    });

    if (newMemory) {
        const currentMemory = user.memory || "";
        const updatedMemory = (currentMemory + "\n" + newMemory).slice(-2000); 
        await prisma.user.update({
            where: { id: userId },
            data: { memory: updatedMemory }
        });
    }

    return Response.json({ text: aiResponse });

  } catch (error: any) {
    console.error("【致命的エラー】api/chat/route.ts:", error);
    return Response.json({ error: "AIエラーが発生しました。", details: error.message }, { status: 500 });
  }
}