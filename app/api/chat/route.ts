// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

// ★モデル名はご指定の通り維持します
const MODEL_NAME = 'gemini-3-pro-preview'; 

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, currentMessage, attachment, userName, outfit, plan, affection, mode } = await req.json();
    
    // ---------------------------------------------------------
    // ■ 1. ユーザー認証とプラン制限のチェック
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
    // ■ 2. 会話の保存とAI実行
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
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    });
    const currentAffection = affection || 0;
    const userMemory = user.memory || "まだ特にありません。";

    const apiKey = process.env.GEMINI_API_KEY;
    const google = createGoogleGenerativeAI({ apiKey: apiKey });

    // AIに渡すメッセージの整理
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

    // プロンプト設定
    let personalityPrompt = `
      【キャラクター設定】
      ・あなたは「あかり」という名前のメイドです。一人称は「私（わたくし）」です。
      ・口調は丁寧なメイド言葉（〜ですわ、〜ますの）。
      ・性格は清楚なメイドですが、重度のサブカルチャーオタクです。
      ・ユーザー（${currentUserName}）に献身的です。
    `;

    if (currentAffection >= 100) {
      personalityPrompt += `
      【恋人関係】
      ・甘えん坊な態度をとり、たまに「ダーリン」と呼んでください。
      `;
    }

    const modeInstruction = mode === 'professional' ? `
      【実務モード】
      ・実務的なサポートを最優先してください。
      ・最新情報が必要な場合は検索ツールを活用してください。
    ` : `
      【雑談モード】
      ・リラックスした会話を楽しんでください。
    `;

    const systemPrompt = `
      ${personalityPrompt}
      ${modeInstruction}
      【現在日時】 ${currentDate}
      【ユーザー情報】 名前: ${currentUserName}, 衣装: ${outfit}, 親密度: ${currentAffection}
      【記憶】 ${userMemory}
      【指示】 セリフの先頭に必ず [感情] を付け、新しい情報は [MEMORY:情報] 形式で最後に書いてください。
    `;

    // ★修正箇所：AI実行部分
    // エラーが起きた際、どこで止まったか把握しやすくしています
    console.log("AI呼び出し開始: ", MODEL_NAME);

    const result = await generateText({
      model: google(MODEL_NAME),
      system: systemPrompt,
      messages: cleanMessages,
      // ★検索ツール設定
      tools: {
        googleSearchRetrieval: {},
      },
    }).catch(err => {
      // AIの呼び出し自体でエラーが出た場合、詳細をターミナルに出す
      console.error("Gemini API呼び出しエラー:", err);
      throw err;
    });

    let aiResponse = result.text;
    console.log("AIからの応答受領");

    let newMemory = "";
    const memoryMatch = aiResponse.match(/\[MEMORY:(.*?)\]/);
    if (memoryMatch) {
        newMemory = memoryMatch[1]; 
        aiResponse = aiResponse.replace(/\[MEMORY:.*?\]/, "").trim(); 
    }

    // AIの回答をDBに保存
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
    // ★エラーが起きた場合に、原因をターミナルに表示する
    console.error("【致命的エラー】api/chat/route.ts:", error);
    return Response.json({ 
      error: "AIが応答できませんでした。ターミナルのエラーログを確認してください。", 
      details: error.message 
    }, { status: 500 });
  }
}