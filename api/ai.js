export default async function handler(req, res) {
  console.log("KEY:", process.env.GEMINI_API_KEY);
  const { name, id } = req.body;

  const stockText = `${name || ""}${id ? `(${id})` : ""}`;

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
你是一位專業的台股分析師，專精半導體與電子供應鏈。

請針對以下公司輸出「一行摘要」（20字內）：

【格式】
產業 + 核心產品 + 近期題材

【規則】
- 可使用空格與標點符號
- 盡量精簡（<=20字）

【範例】
IC載板廠 ABF載板 + AI需求強
砷化鎵代工 GaAs PA + 光通訊成長

【公司】
${stockText}

【輸出】
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RAW:", JSON.stringify(data));

    // 👉 完全不做判斷，直接拿
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "（沒有抓到text）";

    // 🔥 直接把所有東西回給前端
    res.status(200).json({
      text,
      raw: data
    });

  } catch (e) {
    console.log("API ERROR:", e);

    res.status(200).json({
      text: "API exception",
      error: e.toString()
    });
  }
}




