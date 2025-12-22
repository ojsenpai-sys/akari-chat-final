// check-models.js
const fs = require('fs');
const path = require('path');

// 1. .envファイルからAPIキーを直接読み込む（ライブラリ不要）
const envPath = path.resolve(__dirname, '.env');
let apiKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  // APIキーの行を探す
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('GOOGLE_GENERATIVE_AI_API_KEY=')) {
      apiKey = line.split('=')[1].trim();
      // クォートなどがついていたら外す
      apiKey = apiKey.replace(/^["']|["']$/g, '');
      break;
    }
  }
} catch (e) {
  console.error("❌ .envファイルが見つかりません。");
  process.exit(1);
}

if (!apiKey) {
  console.error("❌ APIキーが .env から読み取れませんでした。");
  process.exit(1);
}

console.log("🔍 APIキーを確認しました。利用可能なモデルを問い合わせています...");

// 2. Googleのサーバーに直接問い合わせる
async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ エラーが発生しました:", data.error.message);
      return;
    }

    console.log("\n=== ✨ あなたが現在利用可能なモデル一覧 ✨ ===");
    const models = data.models || [];
    
    // Geminiと名のつくものだけ表示
    const geminiModels = models.filter(m => m.name.includes('gemini'));
    
    if (geminiModels.length === 0) {
      console.log("（Geminiモデルが見つかりませんでした。APIキーの種類を確認してください）");
    } else {
      geminiModels.forEach(model => {
        // "models/gemini-pro" のような形なので "models/" を消して表示
        console.log(`- ${model.name.replace('models/', '')}`);
      });
    }
    console.log("================================================\n");
    console.log("※ この一覧にある名前（例: gemini-1.5-flash）を route.ts に設定してください。");

  } catch (error) {
    console.error("❌ 通信エラー:", error);
  }
}

listModels();