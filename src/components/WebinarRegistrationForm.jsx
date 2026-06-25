import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, Loader2, Mail, User, Phone, Briefcase, Building2, Video, AlertCircle, MapPin, Users } from "lucide-react";
import { registerToWebinar } from "@/hooks/useWebinars";
import { useLocalAuth } from "@/lib/LocalAuth";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const EMPTY_FORM = {
  email:                "",
  nom_complet:          "",
  telephone:            "",
  profession:           "",
  organisation:         "",
  raison_participation: "",
  mode_participation:   "",
  gdpr_consent:         false,
  newsletter_opt_in:    false,
};

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function WebinarRegistrationForm({ event, onSuccess }) {
  const { session } = useLocalAuth();
  const [form, setForm]         = useState(() => ({
    ...EMPTY_FORM,
    email: session?.email || "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed]   = useState(false);
  const [token, setToken]           = useState(null);

  if (!event) return null;

  const isClosed = event.status === "closed";

  // Un événement hybride propose les deux modes : on laisse l'inscrit choisir.
  // Sinon le mode est déduit du format de l'événement.
  const isHybride = event.format === "hybride";
  const autoMode  = event.format === "presentiel" ? "presentiel"
                  : event.format === "en_ligne"   ? "en_ligne"
                  : null;

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
      toast.error("Adresse email invalide.");
      return;
    }
    if (!form.nom_complet.trim()) {
      toast.error("Le nom complet est obligatoire.");
      return;
    }
    if (isHybride && !form.mode_participation) {
      toast.error("Merci d'indiquer si vous participez en présentiel ou en ligne.");
      return;
    }
    if (event.gdpr_consent_required && !form.gdpr_consent) {
      toast.error("Vous devez accepter la politique de confidentialité.");
      return;
    }

    setSubmitting(true);
    try {
      // Mode choisi pour un hybride, sinon déduit du format de l'événement
      const result = await registerToWebinar(event.id, {
        ...form,
        mode_participation: isHybride ? form.mode_participation : autoMode,
      });
      setToken(result.unregistration_token);

      // Email de confirmation
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type:             "webinar_confirmation",
            to_email:         form.email.trim(),
            to_name:          form.nom_complet.trim(),
            event_title:      event.title,
            event_date:       fmtDate(event.date_time),
            zoom_link:        event.zoom_link || null,
            unregister_token: result.unregistration_token,
          }),
        });
      } catch {
        // L'inscription est faite, l'email est secondaire
      }

      setConfirmed(true);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isClosed) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p className="font-semibold text-foreground">Inscriptions fermées</p>
        <p className="text-sm text-muted-foreground mt-1">
          Les inscriptions pour cet événement ne sont plus disponibles.
        </p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700/40 p-8 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">Inscription confirmée !</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Un email de confirmation a été envoyé à <strong>{form.email}</strong>.
        </p>
        {event.zoom_link && (
          <a
            href={event.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
          >
            <Video className="w-4 h-4" /> Accéder au Zoom
          </a>
        )}
        <p className="text-xs text-muted-foreground mt-6">
          Pour vous désinscrire, cliquez sur le lien dans votre email de confirmation.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Mini-récap event */}
      <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-center gap-3">
        {event.affiche
          ? <img src={event.affiche} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          : <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 text-primary" />
            </div>}
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight">{event.title}</p>
          {event.date_time && (
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{fmtDate(event.date_time)}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {event.lieu && (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {event.lieu}
              </span>
            )}
            {event.zoom_link && (
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Video className="w-3 h-3" />
                {{zoom:"Zoom",meet:"Google Meet",teams:"Teams",facebook:"Facebook Live",youtube:"YouTube Live"}[event.plateforme] || "En ligne"} — lien envoyé par email
              </span>
            )}
            {event.max_participants && (
              <span className="text-xs text-muted-foreground">Max. {event.max_participants} places</span>
            )}
          </div>
        </div>
      </div>

      {/* Champs obligatoires */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={form.nom_complet}
              onChange={e => set("nom_complet", e.target.value)}
              placeholder="Prénom Nom"
              required
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Champs optionnels */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="tel"
              value={form.telephone}
              onChange={e => set("telephone", e.target.value)}
              placeholder="+228 XX XX XX XX"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Profession</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={form.profession}
              onChange={e => set("profession", e.target.value)}
              placeholder="Avocat, Magistrat, Juriste…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Organisation</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={form.organisation}
              onChange={e => set("organisation", e.target.value)}
              placeholder="Cabinet, Tribunal, Entreprise…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Raison de participation</label>
          <select
            value={form.raison_participation}
            onChange={e => set("raison_participation", e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">— Sélectionner —</option>
            <option value="professionnel">Intérêt professionnel</option>
            <option value="etudiant">Étudiant / formation</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      {/* Mode de participation — uniquement pour les événements hybrides */}
      {isHybride && (
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Comment souhaitez-vous participer ? <span className="text-red-500">*</span>
          </label>
          <div className="grid sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Les places en présentiel sont complètes"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/40 text-left opacity-60 cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-muted-foreground leading-tight">En présentiel</p>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500">
                    Complet
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {event.lieu || "Sur place"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => set("mode_participation", "en_ligne")}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                form.mode_participation === "en_ligne"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                form.mode_participation === "en_ligne" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">En ligne</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  Diffusion {{zoom:"Zoom",meet:"Google Meet",teams:"Teams",facebook:"Facebook Live",youtube:"YouTube Live"}[event.plateforme] || "en ligne"} — lien par email
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Les places en présentiel sont complètes"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/40 text-left opacity-60 cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-muted-foreground leading-tight">Présentiel + En ligne</p>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500">
                    Complet
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  Vous recevrez le billet QR <em>et</em> le lien de connexion
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* RGPD */}
      {event.gdpr_consent_required && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed mb-3">
            En vous inscrivant, vos données (email, nom, profession) seront stockées dans notre base
            pour vous envoyer le lien Zoom et les informations complémentaires. Conformément au RGPD,
            vous pouvez vous désinscrire ou demander la suppression de vos données à tout moment en
            écrivant à{" "}
            <a href="mailto:contact@mabellepromo.org" className="underline">
              contact@mabellepromo.org
            </a>.
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.gdpr_consent}
              onChange={e => set("gdpr_consent", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
              J'accepte que mes données soient utilisées pour cet événement <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
      )}

      {/* Newsletter opt-in */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={form.newsletter_opt_in}
          onChange={e => set("newsletter_opt_in", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
        />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          Je souhaite recevoir les prochaines actualités de l'association Ma Belle Promo
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-sm rounded-xl transition-colors"
      >
        {submitting
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Inscription en cours…</>
          : "M'inscrire à ce webinaire"}
      </button>
    </form>
  );
}
