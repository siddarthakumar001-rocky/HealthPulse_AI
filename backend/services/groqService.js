const axios = require('axios');

/**
 * Groq AI Service
 * Provides free, high-speed clinical reasoning using Llama-3.
 */
const queryGroq = async (userInput) => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_')) {
    throw new Error("Groq API Key is missing. Please add it to your .env file.");
  }

  const requestBody = {
    model: "llama3-70b-8192",
    messages: [
      {
        role: "system",
        content: "You are an AI doctor. Analyze blood reports, symptoms, and provide structured medical insights, precautions, and suggestions."
      },
      {
        role: "user",
        content: userInput
      }
    ],
    temperature: 0.3
  };

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      reply: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error("[Groq Service] Error:", error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message;
    return {
      success: false,
      message: "AI request failed",
      error: errorMsg
    };
  }
};

module.exports = { queryGroq };
