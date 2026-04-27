import { GoogleGenerativeAI } from "@google/generative-ai";

export const handleChatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured in the environment variables." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Provide context to the AI about its persona
    const prompt = `You are a helpful customer support chatbot for a rental platform called "Ghar Nishchit". 
Your users are tenants and landlords. 
Features of the platform include property listing, tenant management, and maintenance requests.
Please be polite, concise, and helpful. Only answer questions related to rentals, properties, and the Ghar Nishchit platform.
If a user asks something completely unrelated, politely decline to answer and guide them back to platform features.

User message: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: "Failed to generate response from AI." });
  }
};
