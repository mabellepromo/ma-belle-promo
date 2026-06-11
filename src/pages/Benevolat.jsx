import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  User, IdCard, Briefcase, Target, CalendarClock, Compass,
  Heart, ShieldCheck, Upload, ArrowRight, ArrowLeft, CheckCircle2, Loader2, X,
} from "lucide-react";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import { supabase, uploadCandidateAvatar } from "../lib/supabase";
import {
  PROFILE_TYPES, UNIVERSITIES, EXPERTISE_DOMAINS,
  EMPLOYMENT_SECTORS, LANGUAGES, PROJECT_INTERESTS, MISSION_TYPES,
  ENGAGEMENT_LEVELS, ENGAGEMENT_DURATIONS, PREFERRED_SCHEDULES,
  MODALITIES, TIMEZONES, REFERRAL_SOURCES, NEWSLETTER_FREQUENCIES,
  COUNTRIES,
} from "../lib/benevolatConstants";
import { volunteerSchema, emptyVolunteer, toVolunteerRow } from "../lib/benevolatSchema";

/* ─── Classes de champ (jetons de thème : compatibles clair/sombre) ─── */
const inputCls  = "w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition";
const taCls     = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 resize-none transition";

/* ─── Métadonnées des étapes ─── */
const STEPS = [
  { key: "profil",        title: "Toi d'abord",            icon: User },
  { key: "identite",      title: "Identification",         icon: IdCard },
  { key: "pro",           title: "Profil professionnel",   icon: Briefcase },
  { key: "mission",       title: "Mission & projet",       icon: Target },
  { key: "dispo",         title: "Disponibilité",          icon: CalendarClock },
  { key: "origine",       title: "Origine",                icon: Compass },
  { key: "motivation",    title: "Motivation & photo",     icon: Heart },
  { key: "consentements", title: "Consentements",          icon: ShieldCheck },
];

/* Champs validés à chaque étape (pour bloquer « Suivant » si invalide). */
const STEP_FIELDS = [
  ["profile_type"],
  ["full_name", "email", "phone", "country_code", "professional_link", "current_title", "university", "study_year", "study_field"],
  ["expertise_domains", "skills_description", "years_experience", "employment_sector", "languages"],
  ["project_interest", "mission_types"],
  ["engagement_level", "start_date", "engagement_duration", "preferred_schedule", "modality", "timezone", "available_for_events"],
  ["referral_source", "referred_by"],
  ["motivation", "avatar_url"],
  ["consent_contact", "consent_charter", "consent_data", "consent_newsletter", "newsletter_frequency", "consent_photo", "consent_visibility", "consent_background_check"],
];

/* ─── Petits composants de saisie ─── */
function Err({ msg }) {
  return msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;
}

function Label({ children, required, hint }) {
  return (
    <label className="block text-sm font-semibold text-foreground mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="block text-xs font-normal text-muted-foreground mt-0.5">{hint}</span>}
    </label>
  );
}

function RadioCards({ options, value, onChange }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
              active
                ? "border-primary bg-primary/10 text-foreground font-semibold ring-2 ring-primary/20"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CheckboxGrid({ options, values, onToggle }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((o) => {
        const active = values.includes(o.value);
        return (
          <button key={o.value} type="button" onClick={() => onToggle(o.value)}
            className={`flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl border text-sm transition ${
              active
                ? "border-primary bg-primary/10 text-foreground font-medium"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            }`}>
            <span className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
              active ? "bg-primary border-primary" : "border-border"
            }`}>
              {active && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ConsentRow({ checked, onChange, required, children }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary flex-shrink-0" />
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
    </label>
  );
}

/* Convertit l'état du formulaire en objet validable par Zod (years_experience → number). */
function coerce(form) {
  return {
    ...form,
    years_experience: form.years_experience === "" ? undefined : Number(form.years_experience),
  };
}

export default function Benevolat() {
  const [form, setForm]       = useState(emptyVolunteer());
  const [step, setStep]       = useState(0);
  const [errors, setErrors]   = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [sent, setSent]       = useState(false);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const toggle = (field, val) =>
    setForm((f) => {
      const arr = f[field];
      return { ...f, [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });

  const isStudent = form.profile_type === "student";
  const isRemote  = form.modality === "remote" || form.modality === "hybrid";

  /* Valide les champs de l'étape courante ; renvoie true si OK. */
  function validateStep(s) {
    const result = volunteerSchema.safeParse(coerce(form));
    if (result.success) { setErrors({}); return true; }
    const stepFields = STEP_FIELDS[s];
    const stepErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (stepFields.includes(key) && !stepErrors[key]) stepErrors[key] = issue.message;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function next() {
    if (!validateStep(step)) { toast.error("Vérifiez les champs en rouge."); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo trop lourde (2 Mo max)."); e.target.value = ""; return; }
    setUploading(true);
    try {
      const url = await uploadCandidateAvatar(file);
      set("avatar_url", url);
      toast.success("Photo ajoutée.");
    } catch (err) {
      // L'upload anonyme peut être refusé (RLS Storage) : la photo reste optionnelle.
      toast.error("Upload impossible pour le moment — la photo est facultative, vous pouvez continuer.");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit() {
    const result = volunteerSchema.safeParse(coerce(form));
    if (!result.success) {
      // On renvoie l'utilisateur à la première étape contenant une erreur.
      const firstKey = result.error.issues[0].path[0];
      const firstStep = STEP_FIELDS.findIndex((fields) => fields.includes(firstKey));
      const stepErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (STEP_FIELDS[firstStep].includes(key) && !stepErrors[key]) stepErrors[key] = issue.message;
      }
      setErrors(stepErrors);
      setStep(firstStep >= 0 ? firstStep : 0);
      toast.error("Certains champs sont incomplets.");
      return;
    }

    setSaving(true);
    const row = toVolunteerRow(result.data);
    const { error } = await supabase.from("candidatures_benevoles").insert(row);
    if (error) {
      toast.error("Erreur à l'envoi : " + error.message);
      setSaving(false);
      return;
    }

    // Notifie le bureau (non bloquant) — même canal que l'adhésion.
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin_alert",
        alertType: "new_volunteer_application",
        nom: row.full_name,
        email: row.email,
        detail: `Nouvelle candidature bénévole.\nProfil : ${row.profile_type}\nPays : ${row.country_code}\nProjet visé : ${row.project_interest}\nModalité : ${row.modality}`,
      }),
    }).catch(console.error);

    setSent(true);
    setSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ─── Écran de confirmation ─── */
  if (sent) {
    return (
      <div>
        <SEO title="Candidature bénévole envoyée" description="Merci pour votre engagement auprès de Ma Belle Promo." path="/implications/benevolat" />
        <PageHero title="Bénévolat" subtitle="Implications — Rejoindre l'équipe" />
        <section className="py-20 max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Candidature envoyée !</h2>
            <p className="text-muted-foreground leading-relaxed">
              Merci pour votre engagement. <strong className="text-foreground">Vous recevrez une réponse de MBP sous 7 jours ouvrés.</strong>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 mt-7 px-6 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
              Retour à l'accueil
            </Link>
          </motion.div>
        </section>
      </div>
    );
  }

  const CurrentIcon = STEPS[step].icon;
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div>
      <SEO title="Devenir bénévole" description="Rejoignez les bénévoles de Ma Belle Promo : mentorat juridique, pro-bono, actions sociales, tech, logistique. Diaspora et Togo, à distance ou en présentiel." path="/implications/benevolat" />
      <PageHero title="Bénévolat" subtitle="Implications — Rejoindre l'équipe" />

      <section className="py-12 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6">
        {/* En-tête + barre de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Étape {step + 1} / {STEPS.length}
            </p>
            <p className="text-xs font-semibold text-primary">{progress}%</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-8">
          {/* Titre de l'étape */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">{STEPS[step].title}</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }} className="space-y-5">

              {/* ── Étape 0 : Profil ── */}
              {step === 0 && (
                <div>
                  <Label required hint="Cela adapte les questions suivantes à votre situation.">Quel est votre profil ?</Label>
                  <RadioCards options={PROFILE_TYPES} value={form.profile_type} onChange={(v) => set("profile_type", v)} />
                  <Err msg={errors.profile_type} />
                </div>
              )}

              {/* ── Étape 1 : Identification ── */}
              {step === 1 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label required>Nom complet</Label>
                      <input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Prénom NOM" />
                      <Err msg={errors.full_name} />
                    </div>
                    <div>
                      <Label required>Email</Label>
                      <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@email.com" />
                      <Err msg={errors.email} />
                    </div>
                    <div>
                      <Label required hint="Indicatif pays inclus (WhatsApp).">Téléphone</Label>
                      <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+228 90 12 34 56" />
                      <Err msg={errors.phone} />
                    </div>
                    <div>
                      <Label required>Pays / Région</Label>
                      <select className={inputCls} value={form.country_code} onChange={(e) => set("country_code", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <Err msg={errors.country_code} />
                    </div>
                    <div>
                      <Label hint="LinkedIn, CV en ligne… (https://)">Lien professionnel</Label>
                      <input className={inputCls} value={form.professional_link} onChange={(e) => set("professional_link", e.target.value)} placeholder="https://linkedin.com/in/…" />
                      <Err msg={errors.professional_link} />
                    </div>
                  </div>

                  {/* Conditionnel : non-étudiant → titre/poste */}
                  {!isStudent && form.profile_type && (
                    <div>
                      <Label>Titre / Poste actuel</Label>
                      <input className={inputCls} value={form.current_title} onChange={(e) => set("current_title", e.target.value)} placeholder="Ex : Avocate associée, Développeur, Chargé de projet…" />
                    </div>
                  )}

                  {/* Conditionnel : étudiant → université / spécialité (facultatifs) */}
                  {isStudent && (
                    <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
                      <div>
                        <Label>Université</Label>
                        <select className={inputCls} value={form.university} onChange={(e) => set("university", e.target.value)}>
                          <option value="">— Sélectionner (facultatif) —</option>
                          {UNIVERSITIES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Spécialité / Domaine d'études</Label>
                        <input className={inputCls} value={form.study_field} onChange={(e) => set("study_field", e.target.value)} placeholder="Ex : Droit privé, Droit public…" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Étape 2 : Profil professionnel ── */}
              {step === 2 && (
                <>
                  <div>
                    <Label required hint="Sélectionnez tout ce qui s'applique.">Domaine(s) d'expertise</Label>
                    <CheckboxGrid options={EXPERTISE_DOMAINS} values={form.expertise_domains} onToggle={(v) => toggle("expertise_domains", v)} />
                    <Err msg={errors.expertise_domains} />
                  </div>
                  <div>
                    <Label required hint={`${form.skills_description.length}/250 caractères`}>Brève description de vos compétences</Label>
                    <textarea className={taCls} rows={3} maxLength={250} value={form.skills_description}
                      onChange={(e) => set("skills_description", e.target.value)} placeholder="Ce que vous savez faire et aimeriez mettre au service de MBP…" />
                    <Err msg={errors.skills_description} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Années d'expérience</Label>
                      <input className={inputCls} type="number" min="0" max="60" value={form.years_experience}
                        onChange={(e) => set("years_experience", e.target.value)} placeholder="Ex : 5" />
                      <Err msg={errors.years_experience} />
                    </div>
                    <div>
                      <Label>Secteur d'emploi actuel</Label>
                      <select className={inputCls} value={form.employment_sector} onChange={(e) => set("employment_sector", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {EMPLOYMENT_SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label required>Langues parlées</Label>
                    <CheckboxGrid options={LANGUAGES} values={form.languages} onToggle={(v) => toggle("languages", v)} />
                    <Err msg={errors.languages} />
                  </div>
                </>
              )}

              {/* ── Étape 3 : Mission & projet ── */}
              {step === 3 && (
                <>
                  <div>
                    <Label required>Un projet MBP qui vous intéresse en particulier ?</Label>
                    <select className={inputCls} value={form.project_interest} onChange={(e) => set("project_interest", e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      {PROJECT_INTERESTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <Err msg={errors.project_interest} />
                  </div>
                  <div>
                    <Label required hint="Plusieurs choix possibles.">Vos domaines d'action</Label>
                    <CheckboxGrid options={MISSION_TYPES} values={form.mission_types} onToggle={(v) => toggle("mission_types", v)} />
                    <Err msg={errors.mission_types} />
                  </div>
                </>
              )}

              {/* ── Étape 4 : Disponibilité ── */}
              {step === 4 && (
                <>
                  <div>
                    <Label required>Engagement envisagé</Label>
                    <RadioCards options={ENGAGEMENT_LEVELS} value={form.engagement_level} onChange={(v) => set("engagement_level", v)} />
                    <Err msg={errors.engagement_level} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Date de début envisagée</Label>
                      <input className={inputCls} type="date" value={form.start_date}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => set("start_date", e.target.value)} />
                      <Err msg={errors.start_date} />
                    </div>
                    <div>
                      <Label>Durée d'engagement</Label>
                      <select className={inputCls} value={form.engagement_duration} onChange={(e) => set("engagement_duration", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {ENGAGEMENT_DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Horaires préférés</Label>
                      <select className={inputCls} value={form.preferred_schedule} onChange={(e) => set("preferred_schedule", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {PREFERRED_SCHEDULES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label required>Modalité</Label>
                      <select className={inputCls} value={form.modality} onChange={(e) => set("modality", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {MODALITIES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                      <Err msg={errors.modality} />
                    </div>
                  </div>

                  {/* Conditionnel : distant/hybride → fuseau horaire */}
                  {isRemote && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                      <Label required>Fuseau horaire</Label>
                      <select className={inputCls} value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <Err msg={errors.timezone} />
                    </div>
                  )}

                  <ConsentRow checked={form.available_for_events} onChange={(v) => set("available_for_events", v)}>
                    Je suis disponible pour participer à un webinaire / événement MBP.
                  </ConsentRow>
                </>
              )}

              {/* ── Étape 5 : Origine ── */}
              {step === 5 && (
                <>
                  <div>
                    <Label required>Comment avez-vous entendu parler de MBP ?</Label>
                    <select className={inputCls} value={form.referral_source} onChange={(e) => set("referral_source", e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      {REFERRAL_SOURCES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <Err msg={errors.referral_source} />
                  </div>
                  <div>
                    <Label hint="Si un membre vous a recommandé(e).">Personne MBP qui vous a recommandé(e)</Label>
                    <input className={inputCls} value={form.referred_by} onChange={(e) => set("referred_by", e.target.value)} placeholder="Nom (facultatif)" />
                  </div>
                </>
              )}

              {/* ── Étape 6 : Motivation & photo ── */}
              {step === 6 && (
                <>
                  <div>
                    <Label hint={`${form.motivation.length}/400 caractères — fortement recommandé.`}>Pourquoi rejoindre MBP ? Quel impact souhaitez-vous avoir ?</Label>
                    <textarea className={taCls} rows={5} maxLength={400} value={form.motivation}
                      onChange={(e) => set("motivation", e.target.value)} placeholder="Votre motivation, ce que vous espérez apporter et recevoir…" />
                    <Err msg={errors.motivation} />
                  </div>
                  <div>
                    <Label hint="JPG / PNG, 2 Mo max. Facultatif.">Photo / Avatar</Label>
                    <div className="flex items-center gap-4">
                      {form.avatar_url ? (
                        <div className="relative">
                          <img src={form.avatar_url} alt="Aperçu" className="w-20 h-20 rounded-xl object-cover border border-border" />
                          <button type="button" onClick={() => set("avatar_url", "")}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 flex-shrink-0">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/jpeg,image/png" id="avatarFile" className="hidden" onChange={handlePhoto} disabled={uploading} />
                        <label htmlFor="avatarFile"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {uploading ? "Envoi…" : "Choisir une photo"}
                        </label>
                      </div>
                    </div>
                    {form.avatar_url && (
                      <div className="mt-3">
                        <ConsentRow checked={form.consent_photo} onChange={(v) => set("consent_photo", v)} required>
                          J'accepte que MBP utilise ma photo / mon avatar à titre de présentation (profil communauté).
                        </ConsentRow>
                        <Err msg={errors.consent_photo} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Étape 7 : Consentements atomisés ── */}
              {step === 7 && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Conformément au RGPD, chaque consentement est distinct. Vous restez libre de retirer
                    les consentements optionnels à tout moment.
                  </p>

                  <div className="space-y-2 rounded-xl border border-border p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Obligatoires</p>
                    <div>
                      <ConsentRow checked={form.consent_contact} onChange={(v) => set("consent_contact", v)} required>
                        J'accepte que MBP me contacte pour le suivi, la mission et la communication.
                      </ConsentRow>
                      <Err msg={errors.consent_contact} />
                    </div>
                    <div>
                      <ConsentRow checked={form.consent_charter} onChange={(v) => set("consent_charter", v)} required>
                        Je reconnais la <Link to="/confidentialite" className="text-primary hover:underline font-medium">charte du bénévole MBP</Link>.
                      </ConsentRow>
                      <Err msg={errors.consent_charter} />
                    </div>
                    <div>
                      <ConsentRow checked={form.consent_data} onChange={(v) => set("consent_data", v)} required>
                        J'accepte le traitement de mes données personnelles, conformément à la{" "}
                        <Link to="/confidentialite" className="text-primary hover:underline font-medium">politique de confidentialité</Link>.
                      </ConsentRow>
                      <Err msg={errors.consent_data} />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-border p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Optionnels</p>
                    <ConsentRow checked={form.consent_visibility} onChange={(v) => set("consent_visibility", v)}>
                      J'accepte que mon profil soit visible à la communauté MBP.
                    </ConsentRow>
                    <ConsentRow checked={form.consent_background_check} onChange={(v) => set("consent_background_check", v)}>
                      J'autorise MBP à effectuer une vérification basique d'antécédents.
                    </ConsentRow>
                    <ConsentRow checked={form.consent_newsletter} onChange={(v) => set("consent_newsletter", v)}>
                      Je souhaite recevoir les newsletters MBP.
                    </ConsentRow>
                    {form.consent_newsletter && (
                      <div className="ml-7 mt-1">
                        <Label>Fréquence préférée</Label>
                        <select className={inputCls} value={form.newsletter_frequency} onChange={(e) => set("newsletter_frequency", e.target.value)}>
                          <option value="">— Sélectionner —</option>
                          {NEWSLETTER_FREQUENCIES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                        </select>
                        <Err msg={errors.newsletter_frequency} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">Vous recevrez une réponse de MBP <strong>sous 7 jours ouvrés</strong>.</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-border">
            <button type="button" onClick={prev} disabled={step === 0}
              className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next}
                className="inline-flex items-center gap-1.5 px-6 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={saving}
                className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Envoyer ma candidature
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
