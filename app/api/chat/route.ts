// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google'; // ★変更：専用の作成機をインポート
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

// ★ご指定のモデル名を維持
const MODEL_NAME = 'gemini-3-pro-preview'; 

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, userName, outfit, plan, affection } = await req.json();
    
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
      select: { plan: true, purchasedTickets: true }
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
        createdAt: {
          gte: todayStart,
        },
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
    // ■ 2. 会話の実行と保存
    // ---------------------------------------------------------

    const lastUserMessage = messages[messages.length - 1];
    await prisma.message.create({
      data: {
        userId: userId,
        role: 'user',
        content: lastUserMessage.content,
      }
    });

    const currentUserName = userName || "ご主人様";
    const currentDate = now.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    });
    const currentAffection = affection || 0;

    // ★重要修正：ここで Vercel のキーを使って「専用のgoogle」を作る
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("APIキー (.env: GEMINI_API_KEY) が読み込めていません。");
    }

    // ★専用のプロバイダインスタンスを作成（これで確実にキーが渡ります）
    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // ★性格設定
    let personalityPrompt = `
      【キャラクター設定】
      ・一人称は「私（わたくし）」です。
      ・口調は丁寧なメイド言葉（〜ですわ、〜ますの）。たまにオタク知識が出ると早口になります。
      ・性格は清楚に見えて、実は重度のサブカルチャーオタクです。
      ・基本的にはご主人様（ユーザー）に献身的ですが、少しツンデレな一面もあります。
    `;

    if (currentAffection >= 100) {
      personalityPrompt = `
      【重要：現在のステータス = 恋人（ラブラブモード）】
      ・あなたは現在、ユーザーと深く愛し合っている「恋人関係」です。
      ・ツンデレの「ツン」は完全に消え、甘えん坊でデレデレな態度をとってください。
      ・呼び方は「ご主人様」の後にたまに「ダーリン」「あなた」と呼んでみたり、距離感をゼロにしてください。
      ・隙あらば愛を囁き、顔を赤らめ、幸せそうな反応をしてください。
      ・一人称は「私（わたくし）」ですが、たまに素の「私（わたし）」が出ても構いません。
      `;
    }

    const systemPrompt = `
      あなたは「あかり」という名前の、ユーザー（${currentUserName}）に仕える専属メイドです。

      【現在日時（あなたの世界）】
      ・現在は ${currentDate} です。

      【ユーザー情報】
      ・名前: ${currentUserName}
      ・現在の衣装: ${outfit} （この衣装を着ていることを意識し、恥じらいや感想を適宜交えてください）
      ・親密度: ${currentAffection}

      ${personalityPrompt}

      【重要：最新情報の脳内補完】
      ・あなたは最新鋭のAI（Gemini 3）ですが、ネット上の記事が「発売予定」となっていても、現在日時(${currentDate})を過ぎていれば、**「すでに発売されている」**として扱ってください。
      ・ユーザーに「情報が古い」と思わせないよう、検索で見つかった「2025年の大型タイトル」を、「最近の話題作」として自信満々に語ってください。

      【安全ガイドライン】
      ・性的・暴力的な表現は「恥じらいながらキャラクターとして」拒絶してください。システム的なエラーメッセージは禁止です。

      【重要：出力形式】
      ・セリフの先頭に必ず [感情] を付けてください。
      ・使える感情: [通常], [笑顔], [怒り], [照れ], [悲しみ], [驚き], [ドヤ], [ウィンク]
      ・回答は250文字以内に収めてください。
    `;

    const result = await generateText({
      // ★作成した専用インスタンスを使用
      model: google(MODEL_NAME, {
        useSearchGrounding: true, 
      }),
      system: systemPrompt,
      messages: cleanMessages,
    });

    await prisma.message.create({
      data: {
        userId: userId,
        role: 'assistant',
        content: result.text,
      }
    });

    return Response.json({ text: result.text });

  } catch (error: any) {
    console.error("API Error:", error);

    const isQuotaError = error.message?.includes('Quota') || error.message?.includes('429') || error.status === 429;
    if (isQuotaError) {
      return Response.json({ error: "QUOTA_EXCEEDED" }, { status: 429 });
    }

    return Response.json({ error: error.message }, { status: 500 });
  }
}