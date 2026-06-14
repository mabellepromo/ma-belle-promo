import { test, expect, type Page } from '@playwright/test';

/**
 * Test d'accès au dashboard SANS authentification.
 *
 * On vérifie uniquement la garde de sécurité : un visiteur non connecté
 * qui tente d'ouvrir /dashboard doit être renvoyé vers /login
 * (cf. AdminRoute dans src/App.jsx).
 *
 * Aucun identifiant réel n'est utilisé : ce test ne se connecte jamais,
 * n'envoie aucun email et n'écrit rien en base.
 */

// Franchit la porte de maintenance (cf. MaintenanceGate.jsx).
async function bypassMaintenance(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('mbp_access_granted', '1');
  });
}

test.describe('Sécurité du dashboard', () => {
  test('redirige vers /login si non authentifié', async ({ page }) => {
    await bypassMaintenance(page);

    await page.goto('/dashboard');

    // La garde AdminRoute doit renvoyer vers la page de connexion.
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
