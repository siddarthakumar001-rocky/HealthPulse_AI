const axios = require('axios');

/**
 * Grok AI Service
 * Strictly follows the xAI API format and includes debug logging.
 */
const queryGrok = async (userInput) => {
  console.log("Doctor AI route hit");
  console.log("Prompt:", userInput);

  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Grok API Key is missing.");
  }

  if (!userInput || userInput.trim() === '') {
    return {
      success: false,
      message: "Prompt is required"
    };
  }

  const requestBody = {
    "model": "grok-4-1-fast-reasoning",
    "messages": [
      {
        "role": "system",
        "content": "You are an AI doctor. Analyze medical reports and provide insights."
      },
      {
        "role": "user",
        "content": userInput
      }
    ]
  };

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;
    return {
      success: true,
      reply: aiReply
    };
  } catch (error) {
    console.error("[Grok Service] Error:", error.response?.data || error.message);
    return {
      success: false,
      message: "AI request failed",
      error: error.response?.data || error.message
    };
  }
};

module.exports = { queryGrok };
