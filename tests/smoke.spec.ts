import { test, expect, type Page } from '@playwright/test';

/**
 * Tests « smoke » : on visite chaque page publique et on vérifie
 * qu'elle s'affiche SANS erreur JavaScript et SANS écran de crash.
 *
 * Aucun login, aucun email, aucune écriture en base : ces tests sont
 * 100 % en lecture et ne déclenchent aucun effet de bord.
 *
 * Objectif : détecter en quelques secondes si une modification a cassé
 * le rendu d'une page (import manquant, erreur runtime, composant absent…).
 */

// Liste des routes publiques sans paramètre (cf. src/App.jsx).
// Les routes avec :id (détail article, projet, galerie…) sont testées
// séparément car elles nécessitent un identifiant réel.
const PUBLIC_ROUTES = [
  '/',
  '/boutique',
  '/association/qui-sommes-nous',
  '/association/credo',
  '/association/ambition',
  '/association/equipe',
  '/association/sponsors',
  '/activites/evenements',
  '/activites/projets',
  '/activites/programmes',
  '/activites/plan-action-2026',
  '/implications/adherents',
  '/implications/adhesion',
  '/implications/benevolat',
  '/implications/charte-benevole',
  '/implications/cotisation',
  '/implications/soutenir',
  '/informations/actualites',
  '/informations/mediatheque',
  '/informations/documents',
  '/informations/contacts',
  '/informations/communiques',
  '/don',
  '/espace-membre',
  '/annuaire',
  '/ressources',
  '/opportunites',
  '/galeries',
  '/mentions-legales',
  '/confidentialite',
];

// Franchit la porte de maintenance (cf. MaintenanceGate.jsx) en posant
// le drapeau de session AVANT que l'app React ne le lise au démarrage.
async function bypassMaintenance(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('mbp_access_granted', '1');
  });
}

test.describe('Smoke — pages publiques', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`la page ${route} s'affiche sans erreur`, async ({ page }) => {
      // On collecte toute erreur JavaScript non gérée survenue sur la page.
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      await bypassMaintenance(page);

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Le serveur (Vite) doit répondre sans erreur HTTP.
      expect(response?.status(), `statut HTTP de ${route}`).toBeLessThan(400);

      // La porte de maintenance ne doit pas s'afficher (bypass réussi).
      await expect(
        page.getByPlaceholder("Code d'accès"),
        `${route} ne doit pas afficher l'écran de maintenance`
      ).toHaveCount(0);

      // Du contenu réel doit être rendu dans la page.
      await expect(page.locator('body')).not.toBeEmpty();

      // Aucune erreur JavaScript non gérée ne doit s'être produite.
      expect(pageErrors, `erreurs JS sur ${route}`).toEqual([]);
    });
  }
});
