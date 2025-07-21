// server.js
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Sert tout le contenu statique du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Renvoie index.html à la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint qui reçoit l'image, appelle l'API et renvoie le JSON
app.post('/extract-stats', upload.single('image'), async (req, res) => {
  try {
    const b64 = req.file.buffer.toString('base64');
    const prompt = `
Voici une capture d'écran d'une arme éveillée d'Albion Online (base64) :
${b64}

Renvoie-moi STRICTEMENT ce JSON :
{"harmonisation":<int>,"tension":<float>,"legendary":<int>}
`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0].message.content;
    const data = JSON.parse(content);
    return res.json(data);
  } catch (err) {
    console.error('❌ Serveur error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`→ Server listening on http://localhost:${PORT}`);
});
