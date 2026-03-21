export default async function handler(req, res) {
  const { name, id } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
請輸出一行摘要（50字內）
格式：
產業 + 核心產品 + 題材

例如：
ABF載板廠，受AI伺服器需求帶動成長
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RAW:", JSON.stringify(data));

    // ✅ 正確解析
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(200).json({
        text: "❌ AI 無有效輸出"
      });
    }

    res.status(200).json({ text });

  } catch (e) {
    console.error("AI ERROR:", e);
    res.status(200).json({
      text: "❌ API exception"
    });
  }
}
