export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      status: 'ok',
      provider: 'groq'
    });
  }

  if (req.method === 'POST') {
    try {
      const { message } = req.body;

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content:
                  'You are Medix Assistant helping users navigate healthcare services.',
              },
              {
                role: 'user',
                content: message,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      return res.status(200).json({
        reply:
          data.choices?.[0]?.message?.content ||
          'No reply',
      });

    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    error: 'Method not allowed',
  });
}
