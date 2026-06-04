import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import {
  Zap, Play, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, ChevronUp, RefreshCw, Info, Mail, Settings2,
  Calendar, CreditCard, Users, PartyPopper, Bell, ReceiptText, UserX, Handshake, Briefcase
} from "lucide-react";

// Métadonnées statiques de chaque automatisation
const AUTOMATION_META = {
  birthday_reminder: {
    icon: PartyPopper,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    cron: "Chaque jour à 8h",
    type: "cron",
  },
  cotisation_reminder: {
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    cron: "Chaque jour à 9h",
    type: "cron",
  },
  welcome_email: {
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    cron: "Déclenchement manuel",
    type: "trigger",
  },
  event_reminder: {
    icon: Bell,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    cron: "Chaque jour à 8h",
    type: "cron",
  },
  ag_convocation: {
    icon: Calendar,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    cron: "Chaque jour à 8h",
    type: "cron",
  },
  payment_receipt: {
    icon: ReceiptText,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    cron: "Déclenchement manuel",
    type: "trigger",
  },
  dormant_member_alert: {
    icon: UserX,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    cron: "1er de chaque mois",
    type: "cron",
  },
  convention_reminder: {
    icon: Handshake,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    cron: "Chaque jour à 8h",
    type: "cron",
  },
  opportunite_notification: {
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    cron: "Déclenchement manuel",
    type: "trigger",
  },
};

// Nom de la fonction Supabase correspondante
function funcName(id) {
  return id.replace(/_/g, "-");
}

function StatusBadge({ status }) {
  if (!status) return null;
  const map = {
    success: { icon: CheckCircle2, label: "Succès",   cls: "text-emerald-400 bg-emerald-400/10" },
    error:   { icon: XCircle,      label: "Erreur",   cls: "text-red-400    bg-red-400/10"      },
    skipped: { icon: AlertCircle,  label: "Ignoré",   cls: "text-amber-400  bg-amber-400/10"    },
  };
  const cfg = map[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200
        ${checked ? "bg-emerald-500 border-emerald-500" : "bg-muted border-border"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 mt-0.5 ml-0.5 rounded-full bg-white shadow
          transform transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function ConfigDisplay({ config }) {
  const entries = Object.entries(config).filter(([k]) => k !== "cron");
  if (entries.length === 0) return null;

  const labels = {
    email_enabled:      "Email",
    whatsapp_enabled:   "WhatsApp",
    delays_days:        "Jalons (jours)",
    days_before:        "Délai avant (jours)",
    inactivity_months:  "Inactivité (mois)",
    alert_email:        "Email d'alerte",
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{labels[key] || key}</span>
          <span className="text-foreground font-medium">
            {Array.isArray(val) ? val.join(", ") :
             typeof val === "boolean" ? (val ? "Oui" : "Non") :
             String(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConfigEditor({ automationId, config, onSaved }) {
  const [draft, setDraft] = useState(() => JSON.stringify(config, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    try {
      const parsed = JSON.parse(draft);
      setSaving(true);
      setError("");
      const { error: err } = await supabase
        .from("automations")
        .update({ config: parsed })
        .eq("id", automationId);
      if (err) throw err;
      toast.success("Configuration sauvegardée");
      onSaved(parsed);
    } catch (e) {
      setError(e.message || "JSON invalide");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <textarea
        className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono
          text-foreground focus:outline-none focus:border-primary/50 resize-none"
        value={draft}
        onChange={e => { setDraft(e.target.value); setError(""); }}
        spellCheck={false}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
          hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </div>
  );
}

function AutomationCard({ auto, onToggle, onTest }) {
  const [expanded, setExpanded]   = useState(false);
  const [editConfig, setEditConfig] = useState(false);
  const [testing, setTesting]     = useState(false);
  const [localConfig, setLocalConfig] = useState(auto.config);

  const meta = AUTOMATION_META[auto.id] || {
    icon: Zap, color: "text-foreground", bg: "bg-muted", border: "border-border", cron: "—", type: "cron",
  };
  const Icon = meta.icon;

  const handleTest = async () => {
    setTesting(true);
    try {
      await onTest(auto.id);
    } finally {
      setTesting(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`rounded-xl border bg-card overflow-hidden transition-all duration-200
      ${auto.enabled ? "border-primary/30 shadow-sm shadow-primary/5" : "border-border"}`}
    >
      {/* Header de la carte */}
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Icône */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} border ${meta.border}`}>
            <Icon className={`w-5 h-5 ${meta.color}`} />
          </div>

          {/* Titre + description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-sm text-foreground">{auto.name}</h3>
              <StatusBadge status={auto.last_status} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{auto.description}</p>
          </div>

          {/* Toggle ON/OFF */}
          <div className="flex-shrink-0">
            <Toggle
              checked={auto.enabled}
              onChange={(val) => onToggle(auto.id, val)}
            />
          </div>
        </div>

        {/* Méta-infos compactes */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meta.cron}
          </span>
          {auto.last_run && (
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {fmtDate(auto.last_run)}
            </span>
          )}
          {auto.next_run && auto.enabled && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Play className="w-3 h-3" />
              {fmtDate(auto.next_run)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <button
          onClick={handleTest}
          disabled={testing}
          title="Exécuter maintenant en mode test"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-muted hover:bg-accent text-foreground border border-border
            disabled:opacity-50 transition-colors"
        >
          {testing
            ? <><RefreshCw className="w-3 h-3 animate-spin" /> Test en cours…</>
            : <><Play className="w-3 h-3" /> Tester maintenant</>}
        </button>

        <button
          onClick={() => { setExpanded(v => !v); setEditConfig(false); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
            text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
        >
          <Settings2 className="w-3 h-3" />
          Config
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {auto.last_error && (
          <span className="text-xs text-red-400 truncate ml-1" title={auto.last_error}>
            ⚠ {auto.last_error.slice(0, 60)}…
          </span>
        )}
      </div>

      {/* Panneau config dépliable */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Configuration</span>
            <button
              onClick={() => setEditConfig(v => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {editConfig ? "Annuler" : "Modifier JSON"}
            </button>
          </div>

          {editConfig ? (
            <ConfigEditor
              automationId={auto.id}
              config={localConfig}
              onSaved={(c) => { setLocalConfig(c); setEditConfig(false); }}
            />
          ) : (
            <ConfigDisplay config={localConfig} />
          )}

          {/* Note WhatsApp si pertinent */}
          {localConfig.whatsapp_enabled !== undefined && (
            <div className="mt-3 flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">
                WhatsApp nécessite un serveur Node.js persistant séparé (whatsapp-web.js).
                Non compatible avec Vercel/Edge Functions. Configurer <code className="font-mono">WHATSAPP_API_URL</code> dans les secrets Supabase.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AutomatisationsSection() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading]         = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .order("id");
    if (error) {
      toast.error("Impossible de charger les automatisations : " + error.message);
    } else {
      setAutomations(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, enabled) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled } : a));
    const { error } = await supabase
      .from("automations")
      .update({ enabled })
      .eq("id", id);
    if (error) {
      toast.error("Erreur : " + error.message);
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !enabled } : a));
    } else {
      toast.success(enabled ? "Automatisation activée" : "Automatisation désactivée");
    }
  };

  const handleTest = async (id) => {
    const { data, error } = await supabase.functions.invoke(funcName(id));
    if (error) {
      toast.error(`Erreur test "${id}" : ${error.message}`);
    } else if (data?.skipped) {
      toast.info(`Automatisation ignorée : ${data.reason || "désactivée"}`);
    } else if (data?.success) {
      const sent = data.sent ?? 0;
      toast.success(`Test réussi — ${sent} email${sent > 1 ? "s" : ""} envoyé${sent > 1 ? "s" : ""}`);
    } else {
      toast.error(`Erreur : ${data?.error || "Réponse inattendue"}`);
    }
    // Recharge pour voir le nouveau last_run
    await load();
  };

  const enabledCount = automations.filter(a => a.enabled).length;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Automatisations</h1>
            <p className="text-xs text-muted-foreground">
              {enabledCount} active{enabledCount > 1 ? "s" : ""} sur {automations.length}
            </p>
          </div>
          <button
            onClick={load}
            className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Bandeau d'information */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300 leading-relaxed space-y-1">
            <p>
              Toutes les automatisations sont <strong>désactivées par défaut</strong>. Activez-les individuellement avec le toggle.
              Les cron jobs Supabase doivent être configurés séparément (voir <code className="font-mono">supabase/migrations/20260519_automations.sql</code>).
            </p>
            <p>
              Le bouton <strong>"Tester maintenant"</strong> exécute la fonction immédiatement quel que soit le planning,
              mais respecte l'état activé/désactivé et les protections anti-doublon.
            </p>
          </div>
        </div>
      </div>

      {/* Section emails */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Emails Brevo</h2>
        </div>
        <div className="space-y-3">
          {automations.map(auto => (
            <AutomationCard
              key={auto.id}
              auto={auto}
              onToggle={handleToggle}
              onTest={handleTest}
            />
          ))}
        </div>
      </div>

      {/* Section WhatsApp — info future */}
      <div className="rounded-xl border border-dashed border-border p-4 bg-muted/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-sm font-bold">WA</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">WhatsApp — Configuration requise</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les notifications WhatsApp (anniversaires, rappels) nécessitent un serveur Node.js persistant
              avec <code className="font-mono text-xs">whatsapp-web.js</code>. Ce serveur doit tourner 24h/24
              et ne peut pas être hébergé sur Vercel ou Supabase Edge Functions.
              Une fois le serveur déployé (ex : Railway, Render, VPS), configurez la variable
              <code className="font-mono text-xs mx-1">WHATSAPP_API_URL</code>
              dans les secrets Supabase et activez <code className="font-mono text-xs">whatsapp_enabled</code>
              dans la config des automatisations concernées.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
