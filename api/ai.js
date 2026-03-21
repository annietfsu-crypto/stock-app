export default async function handler(req, res) {
  const { name, id } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
你是一個專業的台股分析師，
針對台股：${name} (${id})

請「務必輸出一行文字的公司簡介」，不要有空白：
我要的產出格式是：
該公司的產業 + 該公司的核心產品 + 近3個月的成長或主要題材

下面是希望的產出格式範例：
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

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // ✅ fallback（關鍵）
    if (!text || text.trim() === "") {
      return res.status(200).json({
        text: `${name}：電子相關產業，受市場需求波動影響`
      });
    }

    res.status(200).json({ text });

  } catch (e) {
    console.error("AI ERROR:", e);
    res.status(200).json({
      text: `${name}：產業相關公司（AI暫時無法取得）`
    });
  }
}
