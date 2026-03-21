export default async function handler(req, res) {
  try {
    const { name, id } = req.body || {};

    if (!name || !id) {
      return res.status(200).json({
        text: "❌ 缺少股票資訊"
      });
    }

    // ===== 檢查 KEY =====
    if (!process.env.GEMINI_API_KEY) {
      console.log("❌ GEMINI KEY MISSING");
      return res.status(200).json({
        text: "❌ API KEY 未設定"
      });
    }

    console.log("✅ GEMINI KEY OK");

    // ===== 呼叫 Gemini =====
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
股票：${name} (${id})

請輸出一行摘要（<=50字）
格式：
產業 + 核心產品 + 成長動能或題材

範例：
ABF載板廠，受AI伺服器需求帶動成長
IC設計公司，主攻高速傳輸晶片，受AI應用推升
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const raw = await response.text();
    console.log("🧠 GEMINI RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return res.status(200).json({
        text: "❌ AI 回傳解析失敗"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return res.status(200).json({
        text: "❌ AI 無有效輸出"
      });
    }

    return res.status(200).json({ text });

  } catch (e) {
    console.log("❌ GEMINI ERROR:", e);
    return res.status(200).json({
      text: "❌ API exception"
    });
  }
}
