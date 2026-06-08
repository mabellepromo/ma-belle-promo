// Utilitaires de parsing de dates pour les automatisations.
// Plusieurs champs de date en base sont du texte français libre, non parsable
// par new Date() :
//   - members.anniversaire : « 09 août », « 26 juillet », « 1er janvier »
//   - evenements.date       : « vendredi 26 juin 2026 », « 2 Décembre 2022 »
// Ces helpers normalisent les accents/la casse puis extraient jour/mois/année.

const FR_MONTHS: Record<string, number> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};

// Minuscules + suppression des accents : « août » → « aout », « Décembre » → « decembre »
function normalize(raw: string): string {
  return raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Parse un couple jour + mois français SANS année (anniversaires).
// Gère « 09 août », « 1er janvier ». Retombe sur new Date() pour l'ISO « 1980-06-08 ».
export function parseDayMonthFr(raw: string | null | undefined): { month: number; day: number } | null {
  if (!raw) return null;
  const s = normalize(raw);
  const m = s.match(/(\d{1,2})\s*(?:er)?\s+([a-z]+)/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = FR_MONTHS[m[2]];
    if (month && day >= 1 && day <= 31) return { month, day };
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  return null;
}

// Parse une date française COMPLÈTE avec année (événements).
// Gère « vendredi 26 juin 2026 », « 2 Décembre 2022 ». Renvoie une Date UTC à
// minuit, ou null. Retombe sur new Date() pour les formats ISO.
export function parseFullDateFr(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const s = normalize(raw);
  const m = s.match(/(\d{1,2})\s*(?:er)?\s+([a-z]+)\s+(\d{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = FR_MONTHS[m[2]];
    const year = parseInt(m[3], 10);
    if (month && day >= 1 && day <= 31) return new Date(Date.UTC(year, month - 1, day));
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}
