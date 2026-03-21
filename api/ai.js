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
你是一位專業的台股分析師。
請針對以下公司，以專業的台灣股市行情和動向的視角，提出一行摘要（20字內）：

輸出格式：
產業 + 核心產品 + 題材

允許：
- 空格
- 簡單描述

如果你不確定該公司，請根據網路的公開資訊或網站內容，合理推測其產業與產品（不可留空白）

【公司】
${stockText}

【輸出】
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔍 Debug：完整回傳
    console.log("GEMINI RAW:", JSON.stringify(data));

    // ✅ 安全抓取（避免 undefined）
    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // 🔥 fallback：如果抓不到，就把整包回傳（方便 debug）
    if (!text) {
      text = "（沒有抓到text）";
    }

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
