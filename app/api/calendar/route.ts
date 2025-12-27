// @ts-nocheck
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 1. ユーザーセッションの確認
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id;

    // 2. データベースからGoogle連携情報を取得（アクセストークンを取り出す）
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google',
      },
    });

    if (!account || !account.access_token) {
      return NextResponse.json({ error: "Google account not linked or token missing" }, { status: 400 });
    }

    // 3. 今日の開始時間と終了時間を計算 (JST)
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    // 4. Google Calendar APIへリクエスト
    // primaryはメインのカレンダーを指します
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      }
    );

    const data = await calendarResponse.json();

    if (data.error) {
      console.error("Google Calendar API Error:", data.error);
      return NextResponse.json({ error: "Failed to fetch calendar", details: data.error }, { status: 500 });
    }

    // 5. 必要な情報（予定のタイトルと時間）だけを抽出して返す
    const events = data.items?.map((event: any) => ({
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    })) || [];

    return NextResponse.json({ events });

  } catch (error) {
    console.error("Calendar API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}