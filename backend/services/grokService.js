const axios = require('axios');
const { breakers } = require('./resilienceService');
const logger = require('../utils/logger');

/**
 * Grok AI Service with Circuit Breaker Protection
 * Uses the xAI OpenAI-compatible chat completions endpoint.
 */
const queryGrok = async (userInput) => {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      message: "Grok API Key is missing. Please add GROK_API_KEY to your .env file."
    };
  }

  // Handle both string input and object input (from aiAgentRoutes)
  const promptText = typeof userInput === 'string' ? userInput : userInput?.prompt || JSON.stringify(userInput);

  if (!promptText || promptText.trim() === '') {
    return {
      success: false,
      message: "Prompt is required"
    };
  }

  const requestBody = {
    model: "grok-3-mini-fast",
    messages: [
      {
        role: "system",
        content: "You are an expert AI medical doctor. Analyze symptoms, blood reports, and health data. Provide structured medical insights, precautions, and suggestions. Always remind the user to consult a real doctor for serious conditions."
      },
      {
        role: "user",
        content: promptText
      }
    ],
    temperature: 0.3
  };

  const action = async () => {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 9000
      }
    );

    const aiReply = response.data?.choices?.[0]?.message?.content;
    
    if (!aiReply) {
      return {
        success: false,
        message: "Received empty response from Grok AI."
      };
    }

    return {
      success: true,
      reply: aiReply
    };
  };

  const fallback = (err) => {
    logger.warn('[Grok Circuit Breaker Triggered] Returning clinical fallback:', { error: err.message });
    return {
      success: true,
      fallback: true,
      reply: "Disclaimer: HealthPulse Doctor AI is currently operating with offline heuristics. For any concerning symptoms, chest discomfort, or high fever, please seek direct in-person evaluation at your nearest primary health center."
    };
  };

  return await breakers.grok.execute(action, fallback);
};

module.exports = { queryGrok };
