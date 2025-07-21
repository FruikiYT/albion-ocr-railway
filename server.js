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

// OCR serveur avec Tesseract.js
app.post('/extract-stats', upload.single('image'), async (req, res) => {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(
      req.file.buffer,
      'fra+eng',
      { logger: () => {} }
    );

    // Normalisation du texte
    const normalize = (s) => s.replace(/\u00A0/g, ' ').replace(/\n/g, ' ');
    const raw = normalize(text);

    // Fonction utilitaire pour extraire le nombre après une clé
    const findAfter = (txt, key) => {
      const idx = txt.toLowerCase().indexOf(key.toLowerCase());
      if (idx < 0) return null;
      const slice = txt.slice(idx + key.length);
      const m = slice.match(/(\d[\d\s]*[.,]?\d*)/);
      return m ? m[1].trim() : null;
    };

    // Extraction : on prend d'abord la légendaire, puis harmonisation et tension
    const lRaw = findAfter(raw, 'Valeur légendaire');
    const hRaw = findAfter(raw, 'Harmonisation');
    const tRaw = findAfter(raw, 'Tension');

    if (!lRaw || !hRaw || !tRaw) {
      throw new Error('Impossible d’extraire toutes les valeurs');
    }

    const harmonisation = parseInt(hRaw.replace(/\D/g, ''), 10);
    const tension = parseFloat(tRaw.replace(',', '.'));
    const legendary = parseInt(lRaw.replace(/\D/g, ''), 10);

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
