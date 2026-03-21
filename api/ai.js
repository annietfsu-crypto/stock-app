export default async function handler(req, res) {
  try {
    const { name, id } = req.body || {};

    // ===== 基本防呆 =====
    if (!name || !id) {
      return res.status(200).json({
        text: "❌ 缺少股票資訊"
      });
    }

    // ===== 檢查 API KEY =====
    if (!process.env.OPENAI_API_KEY) {
      console.log("❌ OPENAI_API_KEY MISSING");
      return res.status(200).json({
        text: "❌ API KEY 未設定"
      });
    }

    console.log("✅ KEY EXISTS");

    // ===== 呼叫 OpenAI =====
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "你是台股分析助手，輸出精簡、專業、交易導向摘要"
          },
          {
            role: "user",
            content: `
股票：${name} (${id})

請輸出一行摘要（<=50字）
格式：
產業 + 核心產品 + 成長動能或題材

範例：
ABF載板廠，受AI伺服器需求帶動成長
IC設計公司，主攻高速傳輸晶片，受AI應用推升
`
          }
        ],
        temperature: 0.7
      })
    });

    const raw = await response.text();
    console.log("🧠 OPENAI RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.log("❌ JSON parse error");
      return res.status(200).json({
        text: "❌ AI 回傳格式錯誤"
      });
    }

    // ===== API error =====
    if (data.error) {
      console.log("❌ OPENAI ERROR:", data.error);
      return res.status(200).json({
        text: "❌ " + data.error.message
      });
    }

    // ===== 正常解析 =====
    const text =
      data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      console.log("❌ EMPTY RESPONSE");
      return res.status(200).json({
        text: "❌ AI 無有效輸出"
      });
    }

    // ===== 成功 =====
    return res.status(200).json({ text });

  } catch (e) {
    console.log("❌ API EXCEPTION:", e);
    return res.status(200).json({
      text: "❌ API exception"
    });
  }
}
