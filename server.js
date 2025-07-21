// server.js
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import Tesseract from 'tesseract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer();

// Sert le front‑end statique
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// OCR serveur
app.post('/extract-stats', upload.single('image'), async (req, res) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.buffer,
      'fra+eng',
      { logger: () => {} }
    );
    const raw = text.replace(/\u00A0/g,' ').replace(/\n/g,' ');

    // Extraction par regex
    const findAfter = (key) => {
      const idx = raw.toLowerCase().indexOf(key.toLowerCase());
      if (idx < 0) return null;
      const slice = raw.slice(idx + key.length);
      const m = slice.match(/(\d[\d\s]*[.,]?\d*)/);
      return m ? m[1].trim() : null;
    };

    const hRaw = findAfter('Harmonisation');
    const tRaw = findAfter('Tension');
    const mLegend = raw.match(/valeur légendaire\D*?(\d{1,5})/i);

    if (!hRaw || !tRaw || !mLegend) {
      throw new Error('Valeurs introuvables dans le texte OCR');
    }

    const harmonisation = parseInt(hRaw.replace(/\D/g,''), 10);
    const tension      = parseFloat(tRaw.replace(',', '.'));
    const legendary    = parseInt(mLegend[1], 10);

    return res.json({ harmonisation, tension, legendary });
  } catch (err) {
    console.error('OCR server error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`→ Server listening on http://localhost:${PORT}`)
);
