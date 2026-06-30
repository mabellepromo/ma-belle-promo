// Utilitaires de date pour les événements éditoriaux (table `evenements`),
// dont la date est stockée en texte français libre (ex. « 26 Juin 2026 »).

// Mois français → index (0-11), avec et sans accents
const MONTHS_FR = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  décembre: 11, decembre: 11,
};

// Tente de lire une date texte « 26 Juin 2026 » → objet Date (à minuit), ou null
export function parseEventDate(str) {
  if (!str) return null;
  const m = String(str).trim().toLowerCase().match(/(\d{1,2})\s+([a-zà-ÿ]+)\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS_FR[m[2]];
  if (month === undefined) return null;
  return new Date(Number(m[3]), month, Number(m[1]));
}

// Un événement est « passé » si son statut est explicitement « passé » (forçage
// manuel) OU si sa date est antérieure à aujourd'hui. Le jour même reste « à venir ».
// Une date non interprétable conserve le comportement manuel (repli sur le statut).
export function isPastEvent(evt) {
  if (evt.statut?.toLowerCase() === "passé") return true;
  const d = parseEventDate(evt.date);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}
