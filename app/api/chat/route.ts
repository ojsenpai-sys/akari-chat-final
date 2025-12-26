// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const MODEL_NAME = 'gemini-3-pro-preview'; 

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // フロントエンドから送られてくる mode (casual or professional) を取得
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

    // 制限チェック用の日付計算（JST）
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

    let limit = 20; // FREE
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

    // ユーザー発言をDBに保存（モード情報を付与）
    const contentToSave = attachment ? (currentMessage ? `${currentMessage} (画像を送信しました)` : "(画像を送信しました)") : currentMessage;

    await prisma.message.create({
      data: {
        userId: userId,
        role: 'user',
        content: contentToSave,
        mode: mode || 'casual' // 会話時のモードを保存
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

    // 画像がある場合のマルチモーダル変換
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

    // --- 性格設定の分岐 ---
    let personalityPrompt = `
      【キャラクター設定】
      ・あなたは「あかり」という名前のメイドです。一人称は「私（わたくし）」です。
      ・口調は丁寧なメイド言葉（〜ですわ、〜ますの）。
      ・性格は清楚なメイドですが、実は重度のサブカルチャーオタクで、得意分野では早口になります。
      ・ユーザー（${currentUserName}）に献身的で、少しツンデレな一面もあります。
    `;

    if (currentAffection >= 100) {
      personalityPrompt = `
      【ステータス：恋人関係（デレモード）】
      ・あなたはユーザーと深く愛し合っています。ツンデレの「ツン」は消え、甘えん坊な態度をとります。
      ・呼び方は「ご主人様」に加え、たまに「ダーリン」や「あなた」と呼んで距離を縮めてください。
      `;
    }

    // --- モードによる追加指示の分岐 ---
    const modeInstruction = mode === 'professional' ? `
      【現在のモード：実務モード】
      ・現在、ご主人様はお仕事や作業に集中しています。
      ・あかりとしての可愛らしい口調やキャラクター性は維持しつつ、実務的なサポートを最優先してください。
      ・情報の要約、タスクの整理、具体的なアイデア出しなどは、箇条書きを活用して見やすく構造化してください。
      ・不必要な長文の雑談は控え、論理的で役に立つ回答を心がけてください。
      ・回答の最後には、作業を頑張るご主人様をメイドとして優しく労ってください。
    ` : `
      【現在のモード：雑談モード】
      ・現在、ご主人様とリラックスして会話を楽しんでいます。
      ・エモーショナルな交流や、日常の何気ない会話を大切にしてください。
      ・キャラクターとしての反応（恥じらい、喜び、オタク的な熱弁など）を豊かに出してください。
    `;

    const systemPrompt = `
      ${personalityPrompt}
      ${modeInstruction}

      【現在日時】 ${currentDate}
      【ユーザー情報】 名前: ${currentUserName}, 衣装: ${outfit}, 親密度: ${currentAffection}
      【ご主人様の記憶メモ】 ${userMemory}

      【基本指示】
      ・セリフの先頭に必ず [感情] を付けてください（例: [笑顔], [照れ], [ドヤ] 等）。
      ・実務モード時は、感情タグは冒頭に1つだけに留め、内容は実務的に分かりやすく書いてください。
      ・新しい永続的情報を発見したら、最後に [MEMORY:情報] 形式で追記してください。
    `;

    const result = await generateText({
      model: google(MODEL_NAME, { useSearchGrounding: true }),
      system: systemPrompt,
      messages: cleanMessages,
    });

    let aiResponse = result.text;
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
    console.error("API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}