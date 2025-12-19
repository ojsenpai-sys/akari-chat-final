import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, emotion = '通常' } = await req.json();

    // ★ 声質(speaker)は「ノーマル(2)」で固定
    const speaker = 2; 
    
    // 感情ごとのパラメータ設定
    let speedScale = 1.0; // 話す速さ
    let pitchScale = 0.0; // 声の高さ

    switch (emotion) {
      case '笑顔':
      case 'ドヤ':
      case 'ウィンク':
        speedScale = 1.1;  // 少し明るく元気よく
        pitchScale = 0.05;
        break;
      case '怒り':
        speedScale = 1.25; // 早口でまくしたてる
        pitchScale = -0.02;
        break;
      case '悲しみ':
        speedScale = 0.85; // ゆっくり、トーンを落とす
        pitchScale = -0.05;
        break;
      case '照れ':
        speedScale = 0.9;  // 少しもじもじと、高く甘めに
        pitchScale = 0.08;
        break;
      case '驚き':
        speedScale = 1.3;  // 速く鋭く
        pitchScale = 0.1;
        break;
      default:
        speedScale = 1.0;
        pitchScale = 0.0;
    }

    const queryResponse = await fetch(
      `http://localhost:50021/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`,
      { method: 'POST' }
    );
    const query = await queryResponse.json();

    // ★ パラメータを上書きして反映
    query.speedScale = speedScale;
    query.pitchScale = pitchScale;

    const synthesisResponse = await fetch(
      `http://localhost:50021/synthesis?speaker=${speaker}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      }
    );

    const audioBuffer = await synthesisResponse.arrayBuffer();
    return new NextResponse(audioBuffer, { headers: { 'Content-Type': 'audio/wav' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}