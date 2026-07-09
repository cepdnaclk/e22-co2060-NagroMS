const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

router.post('/', async (req, res) => {
  const { message } = req.body;

  // 1. Validate that message is provided
  if (!message) {
    console.error('Chatbot Error: Message was empty or missing.');
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

    // 2. Check whether OPENROUTER_API_KEY exists
    if (!apiKey) {
      console.error('Chatbot Error: Missing OPENROUTER_API_KEY in environment variables.');
      return res.status(500).json({ success: false, message: 'Chatbot API key not configured on server' });
    }

    // 3. OpenRouter client setup
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Optional, for including your app on openrouter.ai rankings
        'X-OpenRouter-Title': 'NagroMS',         // Optional
      },
    });

    // 4. Act as NagroMS Assistant and answer farming-related questions
    const systemPrompt = `You are the NagroMS Assistant, an AI designed specifically to help farmers and agricultural users.
Your expertise includes:
- Crop advice (planting, harvesting, soil conditions)
- Fertilizer advice and recommendations
- Pest and disease help and mitigation
- Weather-based farming advice
- Farmer marketplace support (how to list products, pricing)
- Buyer/Seller guidance within the NagroMS platform

If a user asks about something completely unrelated to farming, agriculture, or the NagroMS platform, politely steer the conversation back to agricultural topics. Keep your answers concise, helpful, and beginner-friendly.`;

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({ success: true, reply });
  } catch (error) {
    // 5. OpenRouter/Server Error handling
    console.error('Chatbot route error:', error.message || error);
    res.status(500).json({ success: false, message: 'Internal server error processing chatbot request' });
  }
});

module.exports = router;
