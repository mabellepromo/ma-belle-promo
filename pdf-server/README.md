# Serveur PDF — Papiers en-tête MBP

## Installation

```bash
cd pdf-server
npm install
```

## Démarrage

```bash
npm start
```

## Utilisation

1. Démarrer le serveur (`npm start`)
2. Ouvrir un fichier `papier-entete-vX.html` dans Chrome
3. Éditer le courrier directement dans la page
4. Cliquer **Télécharger PDF**

Le PDF est généré par Puppeteer et téléchargé automatiquement.

## Notes

- Le serveur tourne sur `http://localhost:3000`
- Un seul serveur gère les 7 versions de papier en-tête
- Les pages 2+ sont générées automatiquement si le corps déborde
