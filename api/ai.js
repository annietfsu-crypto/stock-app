export default async function handler(req, res) {
  const { name, id } = req.body;

  const stockText = `${name || ""}${id ? `(${id})` : ""}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
你是一位台股分析師。

請針對以下公司輸出 JSON（不要任何解釋）：

{
  "summary": "20字內摘要",
  "stockType": "growth | cyclical | defensive",
  "k1": 數字,
  "k2": 數字,
  "k3": 數字,
  "position": 0~1
}

規則：
- summary：產業 + 核心產品 + 題材（簡短）
- stockType：
  - 成長股 → growth
  - 週期股 → cyclical
  - 防禦股 → defensive
- k1 k2 k3：依股性給合理距離（例：0.01 / 0.03 / 0.06）
- position：0.3 ~ 0.7

重要：
- 必須輸出 JSON
- 不可解釋
- 不可空白
- 若不確定，請合理推測

公司：
${stockText}
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

    let rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ✅ 清掉 ```json ``` 包裝（Gemini 很常出這個）
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // ❌ JSON parse 失敗 → fallback
      parsed = {
        summary: "無法解析摘要",
        stockType: "growth",
        k1: 0.01,
        k2: 0.03,
        k3: 0.06,
        position: 0.5
      };
    }

    // ✅ 最後保底（避免 undefined）
    const result = {
      summary: parsed.summary || "無摘要",
      stockType: parsed.stockType || "growth",
      k1: parsed.k1 ?? 0.01,
      k2: parsed.k2 ?? 0.03,
      k3: parsed.k3 ?? 0.06,
      position: parsed.position ?? 0.5
    };

    res.status(200).json({
      ...result,
      raw: data
    });

  } catch (e) {
    console.log("API ERROR:", e);

    res.status(200).json({
      summary: "API exception",
      stockType: "growth",
      k1: 0.01,
      k2: 0.03,
      k3: 0.06,
      position: 0.5,
      error: e.toString()
    });
  }
}
