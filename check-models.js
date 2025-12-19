const fs = require('fs');
const https = require('https');

// .env.local から APIキーを読み込む簡易的な処理
let apiKey = '';
try {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.error("❌ .env.local が見つかりません。");
  process.exit(1);
}

if (!apiKey) {
  console.error("❌ APIキーが読み込めませんでした。");
  process.exit(1);
}

console.log("🔍 利用可能なモデルを問い合わせ中...");

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error("❌ APIエラー:", json.error.message);
      } else if (json.models) {
        console.log("\n✅ 利用可能なモデル一覧:");
        // チャットに使えそうなモデル（generateContent対応）だけ表示
        const chatModels = json.models
          .filter(m => m.supportedGenerationMethods.includes("generateContent"))
          .map(m => m.name.replace('models/', ''));
        
        chatModels.forEach(name => console.log(` - ${name}`));
        
        console.log("\n💡 推奨: 上記の中から 'gemini-1.5-flash' または 'gemini-1.5-pro' を選びます。");
      }
    } catch (e) {
      console.error("解析エラー:", e);
    }
  });
}).on('error', (e) => {
  console.error("通信エラー:", e);
});