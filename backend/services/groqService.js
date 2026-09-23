const axios = require('axios');
const { breakers } = require('./resilienceService');
const logger = require('../utils/logger');

/**
 * Groq AI Service with Circuit Breaker Protection
 * Provides free, high-speed clinical reasoning using Llama-3.
 */
const queryGroq = async (userInput) => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_')) {
    return { success: false, message: "Groq API Key is missing. Please add GROQ_API_KEY to your .env file." };
  }

  const requestBody = {
    model: "llama-3.3-70b-versatile",
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

  const action = async () => {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 9000
      }
    );

    return {
      success: true,
      reply: response.data.choices[0].message.content
    };
  };

  const fallback = (err) => {
    logger.warn('[Groq Circuit Breaker Triggered] Returning fallback response:', { error: err.message });
    return {
      success: true,
      fallback: true,
      reply: "Our primary AI clinical reasoning service is currently experiencing high load. Based on clinical heuristics, please ensure adequate hydration, monitor vitals, and consult a registered medical professional if symptoms persist or escalate."
    };
  };

  return await breakers.groq.execute(action, fallback);
};

module.exports = { queryGroq };
