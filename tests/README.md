# Tests end-to-end (Playwright)

Suite de tests « smoke » : elle vérifie qu'aucune page ne plante.
**100 % en lecture** — aucun email envoyé, aucune écriture en base, aucun login réel.

## Lancer les tests

```bash
npm run test:e2e        # tous les tests (le serveur dev démarre tout seul)
npm run test:e2e:ui     # mode interactif (recommandé pour explorer/déboguer)
npx playwright show-report   # rapport HTML du dernier run
```

## Contenu

| Fichier | Ce qu'il vérifie |
|---------|------------------|
| `smoke.spec.ts` | Chaque page publique (cf. `src/App.jsx`) s'affiche sans erreur JavaScript ni écran de crash. Détecte instantanément une régression (import cassé, composant manquant…). |
| `auth.spec.ts` | La garde de sécurité : un visiteur non connecté qui ouvre `/dashboard` est bien renvoyé vers `/login`. |

## Notes importantes

- **Mode maintenance** : le site est protégé par `MaintenanceGate.jsx`. Les tests
  le franchissent en posant `sessionStorage["mbp_access_granted"] = "1"` avant
  chaque navigation (voir `bypassMaintenance` dans les specs).
- **Ajouter une page** : quand une nouvelle route publique est créée dans
  `src/App.jsx`, l'ajouter au tableau `PUBLIC_ROUTES` de `smoke.spec.ts`.
- Ces tests **ne déploient rien** et ne sont **pas inclus dans le build** :
  les supprimer n'a aucun effet sur le site en production.
