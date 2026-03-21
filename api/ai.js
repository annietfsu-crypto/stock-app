export default async function handler(req, res) {
  const { name, id } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `
股票：${name} (${id})

請輸出一行摘要（<=50字）
格式：
產業 + 核心產品 + 成長或題材

例如：
ABF載板廠，受AI伺服器需求帶動成長

不要多餘說明
`
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "無法取得摘要";

    res.status(200).json({ text });

  } catch (e) {
    res.status(200).json({
      text: `${name}：電子相關產業，受市場需求影響`
    });
  }
}
