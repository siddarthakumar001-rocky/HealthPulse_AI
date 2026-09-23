const axios = require('axios');
const { breakers } = require('./resilienceService');
const logger = require('../utils/logger');

/**
 * DeepSeek AI Agent Service with Circuit Breaker Protection
 * Provides advanced clinical reasoning and conversational health advice.
 */
const queryDeepSeek = async ({ prompt, context = {} }) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey || apiKey === 'your_deepseek_api_key_here' || apiKey.trim() === '') {
    throw new Error("DeepSeek API Key is missing. Please add it to your .env file.");
  }

  // Build the system prompt with user context
  const systemPrompt = `
    You are "Doctor AI", a high-precision medical informatics agent. 
    Your goal is to provide evidence-based clinical guidance and Ayurvedic lifestyle advice.
    
    USER CONTEXT:
    - Age: ${context.age || 'Unknown'}
    - Gender: ${context.gender || 'Unknown'}
    - Symptoms: ${context.symptoms || 'None'}
    - Blood Report: ${JSON.stringify(context.bloodReport || 'No report available')}
    - Skin Analysis: ${JSON.stringify(context.skinAnalysis || 'No skin scan available')}
    
    STRICT RULES:
    1. Always include a medical disclaimer.
    2. Focus on data-driven insights from the provided context.
    3. Provide actionable next steps (Medical + Ayurvedic).
    4. Keep the tone professional yet empathetic.
    5. Be concise.
  `;

  const action = async () => {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 9000
      }
    );

    return response.data.choices[0].message.content;
  };

  const fallback = (err) => {
    logger.warn('[DeepSeek Circuit Breaker Triggered] Returning clinical fallback:', { error: err.message });
    return "Disclaimer: HealthPulse AI medical services are temporarily operating in offline mode. Please review your extracted diagnostic report parameters in the dashboard, observe prescribed rest, and consult a qualified healthcare provider for personalized prescriptions.";
  };

  return await breakers.deepseek.execute(action, fallback);
};

module.exports = { queryDeepSeek };
