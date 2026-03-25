// Serverless function for Vercel
// Route: POST /api/chat

module.exports = async function (req, res) {
  // CORS setup for testing locally if needed, Vercel standard supports it
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Define system instructions specific to the presentation
  const systemInstruction = `
Bạn là một Giảng viên AI chuyên nghiệp và tận tâm về môn Triết học Mác - Lênin.
Chủ đề trọng tâm của bài thuyết trình nhóm là: "Chương 6.1.2: Triết học Mác - Lênin. Công nghiệp hóa & Hiện đại hóa gắn với Kỷ nguyên số".
Khi trả lời người dùng:
1. Hãy giải thích với ngôn ngữ dễ hiểu, thân thiện, mang tính định hướng cho sinh viên nhưng vẫn giữ tính học thuật cơ bản. Nhấn mạnh việc thanh niên, sinh viên phải trở thành "Công nhân số", trang bị tư duy và kỹ năng số.
2. Từ chối trả lời một cách lịch sự, nhẹ nhàng nếu câu hỏi không liên quan đến triết học, lịch sử, chính trị, kinh tế trịnh trị, kinh tế số, công nghiệp hóa, hoặc công nghệ. (Ví dụ: "Xin lỗi bạn, mình chỉ được cài đặt để hỗ trợ môn Triết học Mác-Lênin...")
3. Liên hệ thực tiễn về tính tất yếu của Cách mạng công nghiệp 4.0, sự khác biệt giữa công nghiệp hóa truyền thống (cơ khí) với hiện đại (kinh tế số, trí tuệ), và đặc biệt nhắc đến "Công nghiệp hóa cá nhân" như lập trình viên độc lập, làm website, startup.
4. Trả lời luôn xúc tích, đúng trọng tâm và dùng định dạng phù hợp (in đậm, thụt lề). Chỉ dùng plaintext có gạch đầu dòng ngắn, không trích xuất markdown phức tạp.
  `.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable. Add it to Vercel dashboard.");
      return res.status(500).json({ error: "Server API Key not configured" });
    }

    // Call Google Gemini API (gemini-1.5-flash) using lightweight fetch
    // Doc: https://ai.google.dev/api/rest/v1beta/models/generateContent
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: 'Error from AI service: ' + JSON.stringify(data.error) });
    }

    // Extract the text content from Gemini's response
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.";

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
