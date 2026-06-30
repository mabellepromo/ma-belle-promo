'use strict';

// Micro-service de génération PDF (Puppeteer) pour les courriers MBP.
// Reçoit le HTML A4 d'un courrier et renvoie le PDF correspondant.
//
// Sécurité : si la variable d'env PDF_AUTH_TOKEN est définie, chaque requête
// /generate-pdf doit présenter l'en-tête `x-pdf-token` avec cette valeur.
// L'appelant prévu est l'Edge Function courrier-email (serveur à serveur),
// le jeton reste donc secret côté Supabase.

const express   = require('express');
const puppeteer = require('puppeteer');

const app  = express();
const PORT  = process.env.PORT || 3000;
const TOKEN = process.env.PDF_AUTH_TOKEN || '';

/* CORS — autorise les appels (l'auth se fait par jeton, pas par origine) */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-pdf-token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '12mb' }));

/* Health check (Render / monitoring) */
app.get('/', (_req, res) => res.status(200).send('MBP PDF server OK'));

app.post('/generate-pdf', async (req, res) => {
  // Auth par jeton (si configuré)
  if (TOKEN && req.get('x-pdf-token') !== TOKEN) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { html } = req.body || {};
  if (!html) return res.status(400).json({ error: 'html manquant' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    /* Attendre le chargement des polices */
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '93px', left: '0' },
      displayHeaderFooter: false,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="courrier-mbp.pdf"',
    });
    res.send(pdf);
  } catch (err) {
    console.error('Erreur Puppeteer :', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Serveur PDF MBP démarré → port ${PORT}`);
});
