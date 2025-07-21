import express from 'express';
import multer from 'multer';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
const upload = multer();
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// Serve static files from 'public'
app.use(express.static('public'));

// Endpoint pour extraction OCR via OpenAI
app.post('/extract-stats', upload.single('image'), async (req, res) => {
  try {
    const b64 = req.file.buffer.toString('base64');
    const prompt = `Voici une capture d'écran d'une arme éveillée Albion Online (base64) : ${b64}\n` +
                   `Renvoie-moi STRICTEMENT ce JSON : {"harmonisation":<int>,"tension":<float>,"legendary":<int>} `;
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    });
    const content = response.data.choices[0].message.content;
    const data = JSON.parse(content);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OCR IA failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));