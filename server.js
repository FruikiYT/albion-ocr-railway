// server.js
import express from 'express';
import multer from 'multer';
// Nouvelle importation pour OpenAI v4+
import OpenAI from 'openai';

const app = express();
const upload = multer();

// Instanciation du client OpenAI v4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Sert le front‑end statique dans /public
app.use(express.static('public'));

// Endpoint OCR→JSON
app.post('/extract-stats', upload.single('image'), async (req, res) => {
  try {
    const b64 = req.file.buffer.toString('base64');
    const prompt = `
Voici une capture d'écran d'une arme éveillée d'Albion Online (base64) : ${b64}
Renvoie-moi STRICTEMENT ce JSON :
{"harmonisation":<int>,"tension":<float>,"legendary":<int>}
`;

    // Nouvelle méthode pour créer une chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0].message.content;
    const data = JSON.parse(content);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'OCR IA failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
