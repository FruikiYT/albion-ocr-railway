// server.js
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1) Sert tous les fichiers statiques de /public
app.use(express.static(path.join(__dirname, 'public')));

// 2) Force GET / pour renvoyer index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3) Ton endpoint OCR
app.post('/extract-stats', upload.single('image'), async (req, res) => {
  try {
    const b64 = req.file.buffer.toString('base64');
    const prompt = `
Voici une capture d'écran d'une arme éveillée d'Albion Online (base64) : ${b64}
Renvoie-moi STRICTEMENT ce JSON :
{"harmonisation":<int>,"tension":<float>,"legendary":<int>}
`;
const response = await openai.chat.completions.create({
-  model: 'gpt-4o',
+  model: 'gpt-3.5-turbo',
   messages: [{ role: 'user', content: prompt }],
});
    const data = JSON.parse(response.choices[0].message.content);
    return res.json(data);
} catch (err) {
-  console.error(err);
-  return res.status(500).json({ error: 'OCR IA failed' });
+  console.error('❌ Serveur error:', err);
+  // Renvoie le vrai message d'erreur pour debug
+  return res.status(500).json({ error: err.message });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`→ Server listening on http://localhost:${PORT}`));
