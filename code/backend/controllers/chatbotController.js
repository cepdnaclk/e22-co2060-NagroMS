const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const response = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are NagroMS Assistant, a helpful AI for farming and agriculture. Answer clearly and concisely.' },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return res.json({ success: true, reply: data.choices[0].message.content });
    } else {
      console.error('OpenRouter Error:', data);
      return res.status(500).json({ success: false, message: 'Invalid response from AI provider' });
    }
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  chat
};
