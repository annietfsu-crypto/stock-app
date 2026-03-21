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
        model: "gpt-4o-mini", // ⭐ 改這個（很重要）
        messages: [
          {
            role: "user",
            content: `
股票：${name} (${id})
請輸出一行摘要（<=50字）
格式：產業 + 核心產品 + 成長或題材
`
          }
        ]
      })
    });

    const data = await response.json();

    // 🔥 加這段（關鍵）
    console.log("OPENAI RAW:", JSON.stringify(data));

    if (!data.choices) {
      return res.status(200).json({
        text: "❌ AI錯誤：" + (data.error?.message || "unknown")
      });
    }

    const text = data.choices[0].message.content;

    res.status(200).json({ text });

  } catch (e) {
    res.status(200).json({
      text: "❌ API exception"
    });
  }
}
