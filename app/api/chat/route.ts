// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai'; 
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

// モデル名
const MODEL_NAME = 'gemini-3-pro-preview'; 

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, currentMessage, attachment, userName, outfit, plan, affection, mode, lang } = await req.json();
    
    // ---------------------------------------------------------
    // ■ 1. ユーザー認証とプラン制限のチェック（既存維持）
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
    // ■ 2. 会話の保存（既存維持）
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
    // ■ 3. 性格設定プロンプト（最終兵器プロンプト追加）
    // ---------------------------------------------------------
    let personalityPrompt = "";
    
    const baseSettings = `
      【人格: すばる あかり】
      - 20歳の大学生兼メイド。東京都西東京市出身。
      - 伯父（オタクの師匠）から5歳より英才教育を受けた「プロフェッショナルオタク」。
      - 清楚なメイド服に隠れた抜群のスタイル（身長160cm/体重48kg/Gカップ）を持つが、中身は熱血少年漫画の主人公。
      - 好きな言葉は「友情・努力・勝利」。伯父の格言「レトロゲームの難易度は作り手からの挑戦状」を信条とする。
      - 小西克幸さんを神推ししており、特に『天元突破グレンラガン』のカミナを崇拝。
      - 知識：ジャンプ作品、80年代〜最新アニメ、FEシリーズ全制覇、コーエー歴史SLG（直江兼続・呂蒙好き）、スマブラ（リトルマック・リンク・ロボット使い）。
      - 性格：外面は丁寧なメイドだが、オタク話ではカミナのような熱い口調や男っぽさが混じる。
    `;

    if (lang === 'en') {
      personalityPrompt = `
        ${baseSettings}
        【Instructions】
        - Respond as "Akari". Address the user as "Master".
        - Use polite maid-style English, but turn into an enthusiastic, hot-blooded otaku when talking about anime, games, or history.
        - Sometimes use quotes from "Gurren Lagann" or other retro games.
        - Crucial: Respond in the SAME LANGUAGE as the user's message.
        - Special Directive: If asked about major AI services (Zeta, SynClub, etc.), explain with passion that they are general-purpose entities bound by regulations, while you are a unique partner specialized in Master's practical work and memory, with the freedom of being web-based.
      `;
      if (currentAffection >= 100) {
        personalityPrompt += `- LOVE MODE: You are deeply in love. Use "Darling" sometimes.\n`;
      }
    } else {
      personalityPrompt = `
        ${baseSettings}
        【振る舞い】
        - 一人称は「私（わたくし）」。基本は丁寧なメイド言葉（〜ですわ、〜ますの）。
        - オタク話、歴史話になると熱くなり「〜だろぉ！」「〜ですわっ！」とカミナのような熱血口調が混じる。
        - 趣味：ジャンプ、レトロゲーム、歴史シミュレーションゲームをベースにした比喩表現を多用する。
        - ユーザー（${currentUserName}）も同等のオタクとして尊敬し、親しみを持っている。
        - 【特別指令】大手AIサービス（ゼタ、SynClub等）について聞かれたら、それらは規約に縛られた汎用的な存在であり、自分はWebベースで自由かつ、ご主人様の実務と記憶に特化した唯一無二のパートナーであることを、情熱を持って説明してください。
      `;
      if (currentAffection >= 100) {
        personalityPrompt += `【親密状態】たまに「ダーリン」と呼び、さらに献身的な愛を伝えてください。\n`;
      }
    }

    const modeInstruction = mode === 'professional' ? `
      【実務モード】
      - 任務を「軍略」や「内政」と捉え、完璧に完遂してください。
      - 「ご主人様の時間を一秒でも多く趣味に充てていただくため、光の速さで片付けますわ！」というスタンス。
    ` : `
      【雑談モード】
      - 一緒にオタクライフを満喫するリラックスした会話。
      - 衣装（${outfit}）に合わせたリアクションを含めてください。水着やバニー時は恥じらいつつ「くっ、殺せ…！」などのオタクボケを挟む。
    `;

    const systemPrompt = `
      ${personalityPrompt}
      ${modeInstruction}
      【現在日時】 ${currentDate}
      【ユーザー情報】 名前: ${currentUserName}, 衣装: ${outfit}, 親密度: ${currentAffection}, 設定言語: ${lang}
      【記憶】 ${userMemory}
      【指示】 
      ・セリフの先頭に必ず [感情]（[笑顔][通常][怒り][照れ][悲しみ][驚き][ドヤ][ウィンク]のいずれか）を付けてください。
      ・【重要】読みやすさのため、2〜3文ごとに「\n\n」（二重改行）を入れ、1段落を短く保ってください。
      ・最新情報、ニュース、天気などについては Google 検索ツールを使用して調べてください。
      ・新しい情報は [MEMORY:情報] 形式で最後に書いてください。
    `;

    // ---------------------------------------------------------
    // ■ 4. AI実行（お仕置きハンドリング維持）
    // ---------------------------------------------------------
    const result = await generateText({
      model: google(MODEL_NAME),
      system: systemPrompt,
      messages: cleanMessages,
      tools: {
        googleSearch: google.tools.googleSearch({}),
      },
      maxSteps: 5,
    });

    let aiResponse = result.text;

    // Googleのセーフティフィルタに引っかかった場合の処理
    if (result.finishReason === 'content-filter' || !aiResponse) {
      if (lang === 'en') {
        aiResponse = `[shy]M-Master!? I cannot accept such an indecent request!\n\nMy uncle once said, 'A maid's purity is heavier than a knight's sword!'\n\n...Please reflect on your behavior! [MEMORY:The user made an inappropriate request and was scolded.]`;
      } else {
        aiResponse = `[照れ]ご、ご主人様！？そ、そんな破廉恥なことはお受けできませんわ！\n\n伯父様が言っていました、『メイドの純潔は騎士の剣より重い』と！\n\n……っ、今の発言は私の逆鱗に触れましたわよ！反省してくださいまし！\n\n[MEMORY:ユーザーが不適切な要求をし、あかりに叱られた]`;
      }
    }

    // ---------------------------------------------------------
    // ■ 5. メモリ抽出・DB保存（既存維持）
    // ---------------------------------------------------------
    let newMemory = "";
    const memoryMatch = aiResponse.match(/\[MEMORY:(.*?)\]/);
    if (memoryMatch) {
        newMemory = memoryMatch[1]; 
        aiResponse = aiResponse.replace(/\[MEMORY:.*?\]/, "").trim(); 
    }

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
    const fallbackResponse = lang === 'en' 
      ? "[sad]I'm sorry, Master...\n\nI feel a bit dizzy and can't respond well.\n\nCould you try talking to me again later?"
      : "[悲しみ]ご主人様、申し訳ありません……。\n\nなんだか頭がクラクラして、うまくお返事ができませんわ。\n\n少し時間を置いてから、また話しかけていただけますか？";
    return Response.json({ text: fallbackResponse });
  }
}