// Constantes & énumérations du formulaire de bénévolat MBP.
// Convention : `value` en anglais (stocké en base, stable), `label` en français (affiché).
// Toute évolution d'un choix se fait ICI — le schéma Zod et le composant en dépendent.

/* ── Profils (segmentation principale, pilote les champs conditionnels) ── */
export const PROFILE_TYPES = [
  { value: "student",      label: "Étudiant·e" },
  { value: "professional", label: "Professionnel·le (avocat, juriste, autre)" },
  { value: "other",        label: "Autre (ONG, associatif, etc.)" },
];

/* ── Universités & années (conditionnel : profil = student) ── */
export const UNIVERSITIES = [
  { value: "lome",  label: "Université de Lomé" },
  { value: "kara",  label: "Université de Kara" },
  { value: "other", label: "Autre établissement" },
];

export const STUDY_YEARS = [
  { value: "l3", label: "Licence 3 (L3)" },
  { value: "m1", label: "Master 1 (M1)" },
  { value: "m2", label: "Master 2 (M2)" },
];

/* ── Domaines d'expertise (multi) ── */
export const EXPERTISE_DOMAINS = [
  { value: "business_law",     label: "Droit des affaires" },
  { value: "social_rights",    label: "Droit social & droits humains" },
  { value: "labour_law",       label: "Droit du travail" },
  { value: "women_rights",     label: "Droits des femmes & protection" },
  { value: "access_to_law",    label: "Accès au droit" },
  { value: "digital_law",      label: "Droit du digital" },
  { value: "management",       label: "Gestion & finance" },
  { value: "hr",               label: "RH & recrutement" },
  { value: "communication",    label: "Communication & marketing" },
  { value: "technology",       label: "Technologie / développement" },
  { value: "logistics",        label: "Logistique & événementiel" },
  { value: "fundraising",      label: "Fundraising & partenariats" },
  { value: "other",            label: "Autre" },
];

/* ── Secteur d'emploi actuel ── */
export const EMPLOYMENT_SECTORS = [
  { value: "law_firm",   label: "Cabinet / Avocat" },
  { value: "company",    label: "Entreprise" },
  { value: "ngo",        label: "ONG / Associatif" },
  { value: "public",     label: "État / Secteur public" },
  { value: "freelance",  label: "Freelance / Indépendant" },
  { value: "student",    label: "Étudiant·e" },
  { value: "other",      label: "Autre" },
];

/* ── Langues parlées (multi) ── */
export const LANGUAGES = [
  { value: "fr",    label: "Français" },
  { value: "en",    label: "Anglais" },
  { value: "ewe",   label: "Éwé" },
  { value: "kabye", label: "Kabiyè" },
  { value: "other", label: "Autre" },
];

/* ── Projet MBP d'intérêt (choix unique) ── */
export const PROJECT_INTERESTS = [
  { value: "passerelles",   label: "PASSERELLES (mentorat juridique)" },
  { value: "event",         label: "Événement / Conférence" },
  { value: "social",        label: "Projet social & communautaire" },
  { value: "legal_aid",     label: "Aide juridique gratuite" },
  { value: "no_preference", label: "Pas de préférence" },
  { value: "to_discuss",    label: "À discuter" },
];

/* ── Types de mission / domaines d'action (multi) ── */
export const MISSION_TYPES = [
  { value: "mentorat",        label: "Mentorat juridique (PASSERELLES)" },
  { value: "formation",       label: "Conférence / Formation / Webinaire" },
  { value: "pro_bono",        label: "Conseil juridique pro-bono" },
  { value: "legal_aid",       label: "Aide juridique gratuite (action sociale)" },
  { value: "advocacy",        label: "Sensibilisation & plaidoyer" },
  { value: "community",       label: "Projets communautaires & impact social" },
  { value: "logistics",       label: "Aide logistique & événementiel" },
  { value: "development",     label: "Développement (site / outils / tech)" },
  { value: "fundraising",     label: "Collecte de fonds & fundraising" },
  { value: "communication",   label: "Communication & réseautage" },
  { value: "other",           label: "Autre" },
];

/* ── Engagement envisagé (choix unique) ── */
export const ENGAGEMENT_LEVELS = [
  { value: "ponctuel",     label: "Ponctuel : 1-2 projets / an" },
  { value: "regulier",     label: "Régulier : 4-6 h / mois" },
  { value: "intensif",     label: "Intensif : 10+ h / mois" },
  { value: "a_determiner", label: "À déterminer" },
];

/* ── Durée d'engagement (choix unique) ── */
export const ENGAGEMENT_DURATIONS = [
  { value: "3m",       label: "3 mois" },
  { value: "6m",       label: "6 mois" },
  { value: "1y",       label: "1 an" },
  { value: "indefini", label: "Indéfini" },
];

/* ── Horaires préférés (choix unique) ── */
export const PREFERRED_SCHEDULES = [
  { value: "flexible",  label: "Flexible" },
  { value: "evenings",  label: "Soirs" },
  { value: "weekend",   label: "Week-end" },
  { value: "specific",  label: "Créneaux spécifiques (à préciser)" },
];

/* ── Modalité (choix unique, pilote le champ fuseau horaire) ── */
export const MODALITIES = [
  { value: "remote", label: "À distance" },
  { value: "onsite", label: "En présentiel (Togo)" },
  { value: "hybrid", label: "Hybride" },
];

/* ── Fuseaux horaires (conditionnel : modalité = remote ou hybrid) ── */
export const TIMEZONES = [
  { value: "UTC-8", label: "UTC-8 (Pacifique / Los Angeles)" },
  { value: "UTC-5", label: "UTC-5 (Est US / Canada)" },
  { value: "UTC+0", label: "UTC+0 (Togo, Ghana, Royaume-Uni)" },
  { value: "UTC+1", label: "UTC+1 (France, Bénin, Nigeria)" },
  { value: "UTC+2", label: "UTC+2 (Afrique du Sud, Europe été)" },
  { value: "UTC+3", label: "UTC+3 (Moyen-Orient / Afrique de l'Est)" },
  { value: "other", label: "Autre" },
];

/* ── Origine / comment as-tu connu MBP (choix unique) ── */
export const REFERRAL_SOURCES = [
  { value: "linkedin",     label: "LinkedIn" },
  { value: "word_of_mouth", label: "Bouche-à-oreille / recommandation" },
  { value: "event",        label: "Événement MBP" },
  { value: "website",      label: "Site web mabellepromo.org" },
  { value: "social",       label: "Réseaux sociaux" },
  { value: "newsletter",   label: "E-mail / Newsletter" },
  { value: "other",        label: "Autre" },
];

/* ── Fréquence newsletter (conditionnel : consent_newsletter = true) ── */
export const NEWSLETTER_FREQUENCIES = [
  { value: "weekly",       label: "Hebdomadaire" },
  { value: "monthly",      label: "Mensuelle" },
  { value: "yearly",       label: "Annuelle" },
  { value: "case_by_case", label: "Au cas par cas" },
];

/* ── Statuts internes de la candidature (gérés par le bureau) ── */
export const APPLICATION_STATUSES = [
  { value: "nouvelle",  label: "Nouvelle",  color: "bg-blue-500/15 text-blue-400" },
  { value: "en_revue",  label: "En revue",  color: "bg-amber-500/15 text-amber-500" },
  { value: "acceptee",  label: "Acceptée",  color: "bg-emerald-500/15 text-emerald-400" },
  { value: "refusee",   label: "Refusée",   color: "bg-red-500/15 text-red-400" },
  { value: "archivee",  label: "Archivée",  color: "bg-muted text-muted-foreground" },
];

/* ── Pays (ISO 3166-1 alpha-3 + nom FR).
   Liste pragmatique centrée sur le Togo et la diaspora MBP la plus probable.
   « OTHER » sert de repli ; on pourra étendre sans migration (colonne text). ── */
export const COUNTRIES = [
  { value: "TGO", label: "Togo" },
  { value: "BEN", label: "Bénin" },
  { value: "GHA", label: "Ghana" },
  { value: "CIV", label: "Côte d'Ivoire" },
  { value: "NGA", label: "Nigeria" },
  { value: "BFA", label: "Burkina Faso" },
  { value: "SEN", label: "Sénégal" },
  { value: "MLI", label: "Mali" },
  { value: "NER", label: "Niger" },
  { value: "GAB", label: "Gabon" },
  { value: "CMR", label: "Cameroun" },
  { value: "COD", label: "RD Congo" },
  { value: "MAR", label: "Maroc" },
  { value: "TUN", label: "Tunisie" },
  { value: "FRA", label: "France" },
  { value: "BEL", label: "Belgique" },
  { value: "DEU", label: "Allemagne" },
  { value: "GBR", label: "Royaume-Uni" },
  { value: "CHE", label: "Suisse" },
  { value: "ITA", label: "Italie" },
  { value: "ESP", label: "Espagne" },
  { value: "CAN", label: "Canada" },
  { value: "USA", label: "États-Unis" },
  { value: "OTHER", label: "Autre pays" },
];

/** Helper : retrouver un label depuis sa value dans une liste {value,label}. */
export function labelOf(list, value) {
  return list.find((o) => o.value === value)?.label ?? value ?? "—";
}

/** Helper : joindre les labels d'un tableau de values (champs multi). */
export function labelsOf(list, values) {
  if (!Array.isArray(values)) return "—";
  return values.map((v) => labelOf(list, v)).join(", ");
}
