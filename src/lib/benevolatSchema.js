// Schéma de validation du formulaire de bénévolat MBP (Zod 3).
// Le projet est en JavaScript : on obtient les "types" via JSDoc + z.infer
// (typecheck assuré par `npm run typecheck` sur jsconfig.json).
//
// Règles clés :
//  - champs conditionnels selon profile_type (étudiant) et modality (distant) ;
//  - consentements ATOMISÉS : 3 obligatoires (contact, charte, RGPD) + optionnels ;
//  - date de début >= aujourd'hui ; téléphone format international ; URL https.

import { z } from "zod";

import {
  PROFILE_TYPES, UNIVERSITIES, STUDY_YEARS, EXPERTISE_DOMAINS,
  EMPLOYMENT_SECTORS, LANGUAGES, PROJECT_INTERESTS, MISSION_TYPES,
  ENGAGEMENT_LEVELS, ENGAGEMENT_DURATIONS, PREFERRED_SCHEDULES,
  MODALITIES, TIMEZONES, REFERRAL_SOURCES, NEWSLETTER_FREQUENCIES,
  COUNTRIES,
} from "./benevolatConstants";
import { CHARTE_VERSION } from "./charteBenevolat";

/** Construit un z.enum à partir d'une liste {value,label}. */
const enumFrom = (list, msg) =>
  z.enum(/** @type {[string, ...string[]]} */(list.map((o) => o.value)), {
    errorMap: () => ({ message: msg }),
  });

// Téléphone international façon WhatsApp : « +228 90 12 34 56 », au moins 8 chiffres.
const PHONE_RE = /^\+[1-9]\d{0,3}[\s.-]?(?:\d[\s.-]?){7,14}$/;
// On exige une URL https valide pour les liens pro (LinkedIn, CV en ligne…).
const HTTPS_RE = /^https:\/\/.+/i;

// Date du jour à minuit (comparaison « >= aujourd'hui » sans piège de fuseau).
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const volunteerSchema = z
  .object({
    // ── Section 1 : profil ──
    profile_type: enumFrom(PROFILE_TYPES, "Sélectionnez votre profil."),

    // ── Section 2 : identification ──
    full_name: z
      .string({ required_error: "Le nom complet est obligatoire." })
      .trim()
      .min(2, "Indiquez votre nom complet.")
      .max(120, "Nom trop long (120 caractères max)."),
    email: z
      .string({ required_error: "L'email est obligatoire." })
      .trim()
      .min(1, "L'email est obligatoire.")
      .email("Adresse email invalide."),
    phone: z
      .string({ required_error: "Le téléphone est obligatoire." })
      .trim()
      .regex(PHONE_RE, "Format attendu : +228 90 12 34 56 (indicatif pays inclus)."),
    country_code: enumFrom(COUNTRIES, "Sélectionnez votre pays."),
    professional_link: z
      .string()
      .trim()
      .regex(HTTPS_RE, "Le lien doit commencer par https://")
      .optional()
      .or(z.literal("")),
    current_title: z.string().trim().max(120).optional().or(z.literal("")),

    // Conditionnels étudiant
    university: enumFrom(UNIVERSITIES, "Sélectionnez votre université.").optional().or(z.literal("")),
    study_year: enumFrom(STUDY_YEARS, "Sélectionnez votre année.").optional().or(z.literal("")),
    study_field: z.string().trim().max(120).optional().or(z.literal("")),

    // ── Section 3 : profil professionnel ──
    expertise_domains: z
      .array(enumFrom(EXPERTISE_DOMAINS, "Domaine invalide."))
      .min(1, "Sélectionnez au moins un domaine d'expertise."),
    skills_description: z
      .string({ required_error: "Décrivez brièvement vos compétences." })
      .trim()
      .min(10, "Donnez quelques mots sur vos compétences (10 caractères min).")
      .max(250, "250 caractères maximum."),
    years_experience: z
      .number({ invalid_type_error: "Indiquez un nombre d'années." })
      .int("Nombre entier attendu.")
      .min(0, "Valeur invalide.")
      .max(60, "Valeur invalide."),
    employment_sector: enumFrom(EMPLOYMENT_SECTORS, "Secteur invalide.").optional().or(z.literal("")),
    languages: z
      .array(enumFrom(LANGUAGES, "Langue invalide."))
      .min(1, "Sélectionnez au moins une langue."),

    // ── Section 4 : mission & projet ──
    project_interest: enumFrom(PROJECT_INTERESTS, "Sélectionnez un projet."),
    mission_types: z
      .array(enumFrom(MISSION_TYPES, "Mission invalide."))
      .min(1, "Sélectionnez au moins un domaine d'action."),
    // Missions ouvertes qui intéressent le candidat (ids → matérialisées par le bureau)
    mission_interets: z.array(z.string().uuid()).optional().default([]),

    // ── Section 5 : disponibilité & engagement ──
    engagement_level: enumFrom(ENGAGEMENT_LEVELS, "Sélectionnez un niveau d'engagement."),
    start_date: z
      .string({ required_error: "Indiquez une date de début." })
      .min(1, "Indiquez une date de début.")
      .refine((v) => v >= todayISO(), "La date doit être aujourd'hui ou ultérieure."),
    engagement_duration: enumFrom(ENGAGEMENT_DURATIONS, "Durée invalide.").optional().or(z.literal("")),
    preferred_schedule: enumFrom(PREFERRED_SCHEDULES, "Créneau invalide.").optional().or(z.literal("")),
    modality: enumFrom(MODALITIES, "Sélectionnez une modalité."),
    timezone: enumFrom(TIMEZONES, "Fuseau invalide.").optional().or(z.literal("")),
    available_for_events: z.boolean().default(false),

    // ── Section 6 : origine ──
    referral_source: enumFrom(REFERRAL_SOURCES, "Indiquez comment vous nous avez connus."),
    referred_by: z.string().trim().max(120).optional().or(z.literal("")),

    // ── Section 7 : motivation ──
    motivation: z.string().trim().max(400, "400 caractères maximum.").optional().or(z.literal("")),

    // ── Section 9 : photo (optionnelle) ──
    avatar_url: z.string().trim().optional().or(z.literal("")),

    // ── Section 8 : consentements atomisés ──
    consent_contact: z.literal(true, {
      errorMap: () => ({ message: "Ce consentement est requis pour traiter votre candidature." }),
    }),
    consent_charter: z.literal(true, {
      errorMap: () => ({ message: "Vous devez reconnaître la charte du bénévole." }),
    }),
    consent_data: z.literal(true, {
      errorMap: () => ({ message: "Le consentement au traitement des données (RGPD) est requis." }),
    }),
    consent_visibility: z.boolean().default(false),
    consent_newsletter: z.boolean().default(false),
    newsletter_frequency: enumFrom(NEWSLETTER_FREQUENCIES, "Fréquence invalide.").optional().or(z.literal("")),
    consent_photo: z.boolean().default(false),
    consent_background_check: z.boolean().default(false),
  })
  // ── Champs conditionnels : étudiant ──
  .superRefine((data, ctx) => {
    // Modalité à distance / hybride → fuseau horaire requis
    if ((data.modality === "remote" || data.modality === "hybrid") && !data.timezone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["timezone"], message: "Précisez votre fuseau horaire." });
    }
    // Newsletter cochée → fréquence requise
    if (data.consent_newsletter && !data.newsletter_frequency) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["newsletter_frequency"], message: "Choisissez une fréquence." });
    }
    // Photo fournie → consentement image requis
    if (data.avatar_url && !data.consent_photo) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["consent_photo"], message: "Le consentement à l'usage de votre photo est requis." });
    }
  });

/**
 * @typedef {z.infer<typeof volunteerSchema>} VolunteerInput
 */

/** Valeurs initiales du formulaire (état React contrôlé). */
export function emptyVolunteer() {
  return {
    profile_type: "",
    full_name: "",
    email: "",
    phone: "",
    country_code: "",
    professional_link: "",
    current_title: "",
    university: "",
    study_year: "",
    study_field: "",
    expertise_domains: [],
    skills_description: "",
    years_experience: "",
    employment_sector: "",
    languages: ["fr"],
    project_interest: "",
    mission_types: [],
    mission_interets: [],
    engagement_level: "",
    start_date: "",
    engagement_duration: "",
    preferred_schedule: "",
    modality: "",
    timezone: "",
    available_for_events: false,
    referral_source: "",
    referred_by: "",
    motivation: "",
    avatar_url: "",
    consent_contact: false,
    consent_charter: false,
    consent_data: false,
    consent_visibility: false,
    consent_newsletter: false,
    newsletter_frequency: "",
    consent_photo: false,
    consent_background_check: false,
  };
}

/**
 * Transforme l'état du formulaire en ligne prête pour `insert` Supabase.
 * Les champs vides deviennent null ; les booléens et tableaux sont conservés.
 * @param {VolunteerInput} data
 */
export function toVolunteerRow(data) {
  const orNull = (v) => (v === "" || v === undefined ? null : v);
  return {
    profile_type: data.profile_type,
    full_name: data.full_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    country_code: data.country_code,
    professional_link: orNull(data.professional_link),
    current_title: orNull(data.current_title),
    university: orNull(data.university),
    study_year: orNull(data.study_year),
    study_field: orNull(data.study_field),
    expertise_domains: data.expertise_domains,
    skills_description: data.skills_description.trim(),
    years_experience: Number(data.years_experience),
    employment_sector: orNull(data.employment_sector),
    languages: data.languages,
    project_interest: data.project_interest,
    mission_types: data.mission_types,
    mission_interets: Array.isArray(data.mission_interets) ? data.mission_interets : [],
    engagement_level: data.engagement_level,
    start_date: data.start_date,
    engagement_duration: orNull(data.engagement_duration),
    preferred_schedule: orNull(data.preferred_schedule),
    modality: data.modality,
    timezone: orNull(data.timezone),
    available_for_events: !!data.available_for_events,
    referral_source: data.referral_source,
    referred_by: orNull(data.referred_by),
    motivation: orNull(data.motivation),
    avatar_url: orNull(data.avatar_url),
    consent_contact: !!data.consent_contact,
    consent_charter: !!data.consent_charter,
    consent_data: !!data.consent_data,
    consent_data_at: data.consent_data ? new Date().toISOString() : null,
    consent_visibility: !!data.consent_visibility,
    consent_newsletter: !!data.consent_newsletter,
    newsletter_frequency: data.consent_newsletter ? orNull(data.newsletter_frequency) : null,
    consent_photo: !!data.consent_photo,
    consent_background_check: !!data.consent_background_check,
    // Traçabilité de l'acceptation de la charte (version + horodatage + user agent)
    charter_version:     data.consent_charter ? CHARTE_VERSION : null,
    charter_accepted_at: data.consent_charter ? new Date().toISOString() : null,
    charter_user_agent:  (data.consent_charter && typeof navigator !== "undefined") ? navigator.userAgent : null,
    statut: "nouvelle",
  };
}
