import fetch from 'node-fetch';

export const generateImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Bhabakana',
      },
      body: JSON.stringify({
        prompt,
        model: "stability-ai/stable-diffusion-xl", // You can change the model if needed
        n: 1, // Number of images to generate
        size: "1024x1024", // Image size
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ message: 'Server error during image generation' });
  }
};