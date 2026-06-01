'use strict';

const express   = require('express');
const puppeteer = require('puppeteer');

const app = express();

/* CORS — autorise les requêtes depuis file:// */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));

app.post('/generate-pdf', async (req, res) => {
  const { html, baseURL } = req.body;
  if (!html) return res.status(400).json({ error: 'html manquant' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    /* Attendre chargement des polices et pagination JS */
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '93px',
        left: '0'
      },
      displayHeaderFooter: false
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="courrier-mbp.pdf"'
    });
    res.send(pdf);

  } catch (err) {
    console.error('Erreur Puppeteer :', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(3000, () => {
  console.log('Serveur PDF MBP démarré → http://localhost:3000');
});
