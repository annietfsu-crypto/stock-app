export default async function handler(req, res) {
  try {
    const { name, id } = req.body;

    const company = name && id ? `${name}(${id})` : (name || id || "未知公司");

    const prompt = `
你是一位專業的台股分析師，專精半導體與電子供應鏈。
當用戶給你一個台股公司名稱或股票代號時，請嚴格遵守以下規則輸出僅一行摘要（總字數必須低於20字，絕對無任何空格、換行或多餘標點）：

輸出格式必須完全符合：
【該公司主要產業】+【核心具體產品名稱】+【近3個月或當前最熱門成長題材/股價表現】

規則細節：
1. 產業要具體（例如：IC載板廠、砷化鎵晶圓代工廠），不可用泛稱如電子、半導體
2. 核心產品必須明確列出實際產品（例如：ABF載板、GaAs功率放大器、VCSEL光電元件）
3. 題材要具體（例如：AI伺服器需求、低軌衛星、光通訊）
4. 整句不超過20字
5. 不可有空格
6. 只輸出一行，不可有任何前言或解釋

如果無法確定公司業務，請只輸出：
UNKNOWN

現在公司是：${company}
請直接輸出結果：
`;

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
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RAW:", JSON.stringify(data));

    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // ===== 🔥 嚴格驗證（核心） =====

    const isInvalid =
      !text ||
      text.includes("UNKNOWN") ||
      text.length > 25 || // 超長直接當錯
      text.includes(" ") || // 有空格不合規
      text.includes("\n") || // 多行不合規
      text.includes("電子") || // 過度泛化
      text.includes("半導體");

    if (isInvalid) {
      text = "無法取得摘要";
    }

    return res.status(200).json({ text });

  } catch (e) {
    console.error("AI ERROR:", e);

    return res.status(200).json({
      text: "無法取得摘要"
    });
  }
}
