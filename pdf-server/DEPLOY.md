# Déploiement du service PDF MBP

Micro-service Puppeteer qui convertit le HTML A4 d'un courrier en PDF, pour
l'envoyer en pièce jointe des courriers par email. Appelé **serveur à serveur**
par l'Edge Function `courrier-email` (le jeton reste donc secret côté Supabase).

## Jeton d'authentification (généré)

```
PDF_AUTH_TOKEN=eb1a534eb51a13f5dfa6c2f3c383282426f8f666a4977232
```

> Garde-le secret. Il faudra le poser **à deux endroits** : sur l'hébergeur du
> service (variable d'env) ET en secret Supabase (étape 3b).

## Option recommandée : Render (gratuit, Docker)

1. Crée un compte sur https://render.com (gratuit).
2. **New + → Web Service** → connecte le dépôt GitHub `mabellepromo/ma-belle-promo`.
3. Configuration :
   - **Root Directory** : `pdf-server`
   - **Runtime** : `Docker` (le `Dockerfile` est détecté automatiquement)
   - **Instance Type** : `Free`
4. **Environment → Add Environment Variable** :
   - `PDF_AUTH_TOKEN` = `eb1a534eb51a13f5dfa6c2f3c383282426f8f666a4977232`
5. **Create Web Service**. Render build l'image (~3-5 min) et fournit une URL du
   type `https://mbp-pdf-server.onrender.com`.
6. Vérifie : ouvrir l'URL dans le navigateur doit afficher `MBP PDF server OK`.

> ⚠️ Free tier : le service s'endort après ~15 min d'inactivité ; la première
> requête après une mise en veille prend ~30-50 s (démarrage à froid). Acceptable
> pour des courriers à l'unité.

## Alternatives

- **Fly.io** : même `Dockerfile`. `fly launch` dans `pdf-server/`, puis
  `fly secrets set PDF_AUTH_TOKEN=...`.
- **Oracle Cloud (VM gratuite always-free)** : plus de mise en route mais aucune
  veille ni limite — voir la piste déjà notée pour DocuSeal.

## Test manuel (une fois en ligne)

```bash
curl -X POST https://TON-URL.onrender.com/generate-pdf \
  -H "Content-Type: application/json" \
  -H "x-pdf-token: eb1a534eb51a13f5dfa6c2f3c383282426f8f666a4977232" \
  -d '{"html":"<h1>Test MBP</h1>"}' --output test.pdf
```

## Ensuite (étape 3b)

Une fois l'URL connue, on pose deux secrets Supabase :
```
PDF_SERVER_URL=https://TON-URL.onrender.com
PDF_AUTH_TOKEN=eb1a534eb51a13f5dfa6c2f3c383282426f8f666a4977232
```
et je branche `courrier-email` pour récupérer le PDF et le joindre à l'email.
