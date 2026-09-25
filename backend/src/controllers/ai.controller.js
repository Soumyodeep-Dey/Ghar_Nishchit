const SYSTEM_PROMPT = `You are the Ghar Nishchit support assistant. Answer only questions about using the rental platform. Be concise and do not claim features that are not described by the application. Landlords manage properties, tenants, maintenance and payments. Tenants browse properties, pay rent, submit maintenance requests and message landlords.`;

export const chat = async (req, res) => {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 2000) {
      return res.status(400).json({ message: 'Message must contain between 1 and 2000 characters' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey) {
      return res.status(503).json({ message: 'AI assistant is not configured' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
        }),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      console.error('[AI] Gemini request failed:', response.status);
      return res.status(502).json({ message: 'AI service is temporarily unavailable' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!reply) return res.status(502).json({ message: 'AI service returned an empty response' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[AI] chat failed:', error.name === 'AbortError' ? 'request timeout' : error.message);
    return res.status(error.name === 'AbortError' ? 504 : 500).json({ message: 'AI request failed' });
  }
};
