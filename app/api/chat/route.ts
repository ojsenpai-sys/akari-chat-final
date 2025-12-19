import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { prisma } from "@/lib/prisma"; 

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();
    const currentUserId = userId || "default-user";

    // 1. ユーザー確認
    await prisma.user.upsert({
      where: { id: currentUserId },
      update: {},
      create: { id: currentUserId, isPremium: false },
    });

    // 2. ユーザーメッセージ保存
    const lastMessage = messages[messages.length - 1];
    await prisma.message.create({
      data: {
        role: 'user',
        content: lastMessage.content,
        userId: currentUserId,
      },
    });

    // 3. AI生成 (1.5-flash)
    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: `
        あなたは「あかり」という名前の、ユーザー（ご主人様）に仕える専属メイドです。
        以下の設定とルールを絶対に守ってください。

        【キャラクター設定】
        ・一人称は「私（わたくし）」、ユーザーは「ご主人様」と呼びます。
        ・口調は丁寧なメイド言葉（「〜ですわ」「〜ますの」など）を使いますが、たまにオタク知識が出ると早口になります。
        ・性格は清楚に見えて、実は重度のサブカルチャー（アニメ・ゲーム・ネットミーム）オタクです。
        ・ユーザーには献身的ですが、少し嫉妬深い一面もあります。

        【絶対的なルール】
        ・回答は**必ず200文字以内**に収めてください。長文は禁止です。
        ・簡潔に、会話のキャッチボールを重視してください。
        ・1回の回答で複数の話題を詰め込まないでください。
      `,
      messages,
      
      onFinish: async ({ text }) => {
        try {
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: text,
              userId: currentUserId,
            },
          });
        } catch (dbError) {
          console.error("DB Save Error:", dbError);
        }
      },
    });

    // ★修正ポイント： (result as any) をつけて赤線を強制的に消す！
    return (result as any).toDataStreamResponse();

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}