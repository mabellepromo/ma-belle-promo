import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, Link2, BarChart2, Eye, EyeOff, Loader2, X,
  ChevronUp, ChevronDown, Send, Check, Clock, UserPlus, Download,
  RefreshCw, Copy, Palette, Image, GitBranch, Columns, ShieldCheck, Printer, Pencil,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { openDoc } from "@/lib/documentGenerators";
import { generateSondageAnalyse, generateFicheInscription } from "@/lib/sondageAnalyseGenerator";
import {
  useSondages, getSondageResults, getInvitationStats,
  createInvitations, markInvitationsSent, SONDAGE_THEMES, anonymiserSoumissions,
  getSoumissionsDetail, deleteSoumission, updateSoumissionReponses,
} from "../../hooks/useSondages";
import { inp, Field } from "./shared";
import { useConfirm } from "@/hooks/useConfirm";

const COLORS = ["bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];
const COLOR_HEX = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#f43f5e", "#06b6d4"];

const Q_TYPES = [
  { value: "single",   label: "Choix unique" },
  { value: "multiple", label: "Choix multiple" },
  { value: "dropdown", label: "Déroulante" },
  { value: "ouinon",   label: "Oui / Non" },
  { value: "texte",    label: "Texte libre" },
  { value: "date",     label: "Date" },
  { value: "note",     label: "Note /5" },
  { value: "echelle",  label: "Échelle 1–10" },
  { value: "effectifs", label: "Effectifs par option" },
];

const Q_TYPE_LABELS = {
  ouinon: "Oui/Non", single: "Choix unique", multiple: "Choix multiple",
  dropdown: "Déroulante", texte: "Texte libre", date: "Date", note: "Note /5",
  echelle: "Échelle 1–10", effectifs: "Effectifs par option",
};

// Index sentinelle de l'option « Autre (précisez) » dans valeur_options
const OTHER_INDEX = -1;

const VALIDATIONS = [
  { value: "",          label: "Texte libre" },
  { value: "email",     label: "Email" },
  { value: "nombre",    label: "Nombre" },
  { value: "telephone", label: "Téléphone" },
];

// ── Export CSV ─────────────────────────────────────────────────────────────
async function exportCSV(sondage) {
  const { data: soumissions } = await supabase
    .from("sondage_soumissions").select("*").eq("sondage_id", sondage.id).order("created_at");
  if (!soumissions?.length) { toast.info("Aucune réponse à exporter."); return; }

  const ids = soumissions.map(s => s.id);
  const { data: reponses } = await supabase.from("sondage_reponses").select("*").in("soumission_id", ids);

  const questions = sondage.questions || [];
  const headers = ["Date", "Nom", "Email", ...questions.map(q => q.libelle)];
  const rows = soumissions.map(s => {
    const nom   = s.repondant_nom   || "Anonyme";
    const email = s.repondant_email || "";
    const date  = new Date(s.created_at).toLocaleDateString("fr-FR");
    const vals = questions.map(q => {
      const rep = (reponses || []).find(r => r.soumission_id === s.id && r.question_id === q.id);
      if (!rep) return "";
      if (q.type === "texte" || q.type === "date" || q.type === "effectifs") return rep.valeur_texte || "";
      if (q.type === "note" || q.type === "echelle") return rep.valeur_note ?? "";
      if (q.type === "ouinon") return rep.valeur_options?.includes(0) ? "Oui" : rep.valeur_options?.includes(1) ? "Non" : "";
      const otherLabel = () => `Autre : ${rep.valeur_texte || ""}`;
      if (q.type === "single" || q.type === "dropdown") {
        const idx = rep.valeur_options?.[0];
        if (idx === OTHER_INDEX) return otherLabel();
        return idx != null ? (q.options?.[idx] || "") : "";
      }
      if (q.type === "multiple") {
        return (rep.valeur_options || [])
          .map(i => i === OTHER_INDEX ? otherLabel() : q.options?.[i])
          .filter(Boolean).join("; ");
      }
      return "";
    });
    return [date, nom, email, ...vals];
  });

  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map(r => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sondage-${sondage.titre.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${soumissions.length} réponse${soumissions.length !== 1 ? "s" : ""} exportée${soumissions.length !== 1 ? "s" : ""}.`);
}

// ── Résultats par question (dashboard) ────────────────────────────────────
function QuestionResults({ question, reponses, total }) {
  const qr = reponses.filter(r => r.question_id === question.id);

  if (question.type === "texte" || question.type === "effectifs") {
    const textes = qr.map(r => r.valeur_texte).filter(Boolean);
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-1">{textes.length} réponse{textes.length !== 1 ? "s" : ""}</p>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {textes.length === 0
            ? <p className="text-xs italic text-muted-foreground">Aucune réponse.</p>
            : textes.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-muted/60 rounded-lg px-2.5 py-1.5">
                <span className="font-bold text-primary flex-shrink-0">{i + 1}.</span>
                <span>{t}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (question.type === "date") {
    const dates = qr.map(r => r.valeur_texte).filter(Boolean);
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-1">{dates.length} réponse{dates.length !== 1 ? "s" : ""}</p>
        <div className="flex flex-wrap gap-1">
          {dates.map((d, i) => (
            <span key={i} className="text-xs bg-blue-500/15 text-blue-400 rounded-full px-2 py-0.5">
              {new Date(d).toLocaleDateString("fr-FR")}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "echelle") {
    const notes = qr.map(r => r.valeur_note).filter(v => v != null);
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : "—";
    const scale = Array.from({ length: 10 }, (_, i) => i + 1);
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-2">Moyenne : <strong className="text-foreground">{avg}/10</strong> · {notes.length} réponse{notes.length !== 1 ? "s" : ""}</p>
        {scale.map(n => {
          const c = notes.filter(v => v === n).length;
          const pct = notes.length ? Math.round((c / notes.length) * 100) : 0;
          if (c === 0) return null;
          return (
            <div key={n} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-5 text-center text-muted-foreground">{n}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${n >= 8 ? "bg-emerald-500" : n >= 5 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs w-5 text-right text-muted-foreground">{c}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "note") {
    const notes = qr.map(r => r.valeur_note).filter(v => v != null);
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : "—";
    const counts = [1, 2, 3, 4, 5].map(n => notes.filter(v => v === n).length);
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-2">Moyenne : <strong className="text-foreground">{avg}/5</strong> · {notes.length} réponse{notes.length !== 1 ? "s" : ""}</p>
        {[1, 2, 3, 4, 5].map(n => {
          const pct = notes.length ? Math.round((counts[n - 1] / notes.length) * 100) : 0;
          return (
            <div key={n} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-5 text-center text-muted-foreground">{n}★</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs w-5 text-right text-muted-foreground">{counts[n - 1]}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const allowOther = question.type !== "ouinon" && question.config?.allow_other;
  const options = question.type === "ouinon" ? ["Oui", "Non"] : (question.options || []);
  const counts = options.map((_, i) => qr.filter(r => r.valeur_options?.includes(i)).length);
  const otherResponses = allowOther ? qr.filter(r => r.valeur_options?.includes(OTHER_INDEX)) : [];
  if (allowOther) counts.push(otherResponses.length);
  const displayOptions = allowOther ? [...options, "Autre"] : options;
  const qTotal = qr.length;
  const maxCount = Math.max(...counts, 0);
  const topIdx = counts.indexOf(maxCount);
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground mb-1">
        {qTotal} réponse{qTotal !== 1 ? "s" : ""}
        {total > 0 && qTotal < total && <span> · {total - qTotal} sans réponse</span>}
      </p>
      {displayOptions.map((opt, i) => {
        const pct = qTotal > 0 ? Math.round((counts[i] / qTotal) * 100) : 0;
        const isTop = maxCount > 0 && i === topIdx;
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className={`truncate flex-1 mr-2 ${isTop ? "font-semibold text-foreground" : "text-foreground"}`}>
                {isTop && <span className="text-amber-400 mr-1">★</span>}{opt}
              </span>
              <span className="font-bold text-foreground">{pct}% ({counts[i]})</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${COLORS[i % COLORS.length]}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {otherResponses.filter(r => r.valeur_texte).length > 0 && (
        <div className="mt-1.5 space-y-1">
          {otherResponses.filter(r => r.valeur_texte).map((r, i) => (
            <div key={i} className="text-xs bg-muted/60 rounded-lg px-2.5 py-1.5 italic">Autre : {r.valeur_texte}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Éditeur d'une réponse individuelle (par type de question) ──────────────
function AnswerEditor({ q, val, onChange }) {
  const v = val || {};

  if (q.type === "texte" || q.type === "effectifs") {
    return <input className={`${inp} text-sm`} value={v.valeur_texte || ""}
      onChange={e => onChange({ ...v, valeur_texte: e.target.value || null })} placeholder="—" />;
  }
  if (q.type === "date") {
    return <input type="date" className={`${inp} text-sm`} value={v.valeur_texte || ""}
      onChange={e => onChange({ ...v, valeur_texte: e.target.value || null })} />;
  }
  if (q.type === "note" || q.type === "echelle") {
    const max = q.type === "note" ? 5 : 10;
    return (
      <select className={`${inp} text-sm`} value={v.valeur_note ?? ""}
        onChange={e => onChange({ valeur_note: e.target.value === "" ? null : Number(e.target.value) })}>
        <option value="">— Sans réponse —</option>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>{n} / {max}</option>
        ))}
      </select>
    );
  }

  // Types à choix
  const options = q.type === "ouinon" ? ["Oui", "Non"] : (q.options || []);
  const allowOther = q.type !== "ouinon" && q.config?.allow_other;
  const otherSelected = v.valeur_options?.includes(OTHER_INDEX);

  if (q.type === "multiple") {
    function toggle(i) {
      const curr = v.valeur_options || [];
      const next = curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i];
      onChange({ ...v, valeur_options: next.length ? next : null });
    }
    return (
      <div className="space-y-1">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={!!v.valeur_options?.includes(i)} onChange={() => toggle(i)}
              className="w-3.5 h-3.5 rounded accent-primary" />
            <span className="text-sm text-foreground">{opt}</span>
          </label>
        ))}
        {allowOther && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={!!otherSelected} onChange={() => toggle(OTHER_INDEX)}
              className="w-3.5 h-3.5 rounded accent-primary" />
            <span className="text-sm text-foreground">Autre (précisez)</span>
          </label>
        )}
        {otherSelected && (
          <input className={`${inp} text-sm mt-1`} value={v.valeur_texte || ""}
            onChange={e => onChange({ ...v, valeur_texte: e.target.value || null })} placeholder="Précisez…" />
        )}
      </div>
    );
  }

  // single / dropdown / ouinon
  return (
    <div className="space-y-1">
      <select className={`${inp} text-sm`} value={v.valeur_options?.[0] ?? ""}
        onChange={e => {
          const raw = e.target.value;
          onChange(raw === "" ? {} : { ...v, valeur_options: [Number(raw)] });
        }}>
        <option value="">— Sans réponse —</option>
        {options.map((opt, i) => <option key={i} value={i}>{opt}</option>)}
        {allowOther && <option value={OTHER_INDEX}>Autre (précisez)</option>}
      </select>
      {otherSelected && (
        <input className={`${inp} text-sm`} value={v.valeur_texte || ""}
          onChange={e => onChange({ ...v, valeur_texte: e.target.value || null })} placeholder="Précisez…" />
      )}
    </div>
  );
}

// ── Modal d'édition d'une soumission ───────────────────────────────────────
function EditSoumissionModal({ sondage, soumission, numero, displayName, onClose, onSaved }) {
  const [answers, setAnswers] = useState(() => {
    const init = {};
    (soumission.reponses || []).forEach(r => {
      init[r.question_id] = {
        valeur_texte: r.valeur_texte,
        valeur_options: r.valeur_options,
        valeur_note: r.valeur_note,
      };
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const error = await updateSoumissionReponses(soumission.id, answers);
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Réponses mises à jour.");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <p className="font-semibold text-foreground text-sm">Modifier l'inscription{numero ? ` n°${numero}` : ""}</p>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {displayName || soumission.repondant_nom || "Anonyme"}
              {soumission.repondant_email ? ` · ${soumission.repondant_email}` : ""}
              {" · "}{new Date(soumission.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {(sondage.questions || []).map((q, i) => (
            <div key={q.id}>
              <p className="text-xs font-semibold text-foreground mb-1.5">{i + 1}. {q.libelle}</p>
              <AnswerEditor q={q} val={answers[q.id]}
                onChange={val => setAnswers(p => ({ ...p, [q.id]: val }))} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Liste des soumissions individuelles ────────────────────────────────────
function SoumissionsList({ sondage, confirm, onChanged }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);

  async function load() { setRows(await getSoumissionsDetail(sondage.id)); }

  // Nom affiché : identité d'invitation si présente, sinon la réponse à la
  // première question texte de type « nom » du formulaire (lien public)
  const nameQuestion =
    (sondage.questions || []).find(q => q.type === "texte" && /nom/i.test(q.libelle)) ||
    (sondage.questions || []).find(q => q.type === "texte");
  function displayName(sub) {
    return sub.repondant_nom
      || sub.reponses.find(r => r.question_id === nameQuestion?.id)?.valeur_texte
      || "Anonyme";
  }
  function toggle() {
    if (!open && rows === null) load();
    setOpen(!open);
  }

  // Fiche analytique individuelle — générée uniquement au clic, jamais stockée
  function openFiche(sub, num) {
    const html = generateFicheInscription(sondage, sub, {
      numero: num,
      displayName: displayName(sub),
      allReponses: (rows || []).flatMap(r => r.reponses),
      totalSoumissions: (rows || []).length,
    });
    openDoc(html, `inscription-n${num}-${(displayName(sub) || "anonyme").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`);
  }

  async function handleDelete(sub) {
    const who = sub.repondant_nom || sub.repondant_email
      || (displayName(sub) !== "Anonyme" ? displayName(sub) : "cette inscription anonyme");
    if (!await confirm(`Supprimer l'inscription de ${who} ?`, "Ses réponses seront supprimées définitivement. Si elle provenait d'une invitation, la personne pourra répondre à nouveau.")) return;
    const error = await deleteSoumission(sub.id);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Inscription supprimée.");
    load(); onChanged();
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {editing && (
        <EditSoumissionModal sondage={sondage} soumission={editing}
          numero={rows ? rows.length - rows.findIndex(r => r.id === editing.id) : null}
          displayName={displayName(editing)}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); onChanged(); }} />
      )}
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors">
        <span className="uppercase tracking-wide">Réponses individuelles</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-border/60 divide-y divide-border/60">
          {rows === null ? (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Chargement…</div>
          ) : rows.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground italic">Aucune réponse.</p>
          ) : rows.map((sub, idx) => {
            // N° d'inscription chronologique : la liste est triée du plus
            // récent au plus ancien → n° 1 = première inscription reçue
            const num = rows.length - idx;
            return (
              <div key={sub.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {num}
                </span>
                <button onClick={() => setEditing(sub)} title="Cliquer pour modifier les réponses"
                  className="min-w-0 flex-1 text-left cursor-pointer">
                  <p className="text-sm font-medium text-foreground truncate hover:text-primary hover:underline transition-colors">
                    {displayName(sub)}
                    {sub.repondant_email && <span className="font-normal text-muted-foreground no-underline"> · {sub.repondant_email}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inscription n°{num}
                    {" · "}{new Date(sub.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    {" · "}{sub.reponses.length} réponse{sub.reponses.length !== 1 ? "s" : ""}
                  </p>
                </button>
                <button onClick={() => openFiche(sub, num)} title="Fiche analytique individuelle (imprimable)"
                  className="w-7 h-7 rounded-lg hover:bg-violet-500/15 flex items-center justify-center text-muted-foreground hover:text-violet-400 transition-colors">
                  <BarChart2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditing(sub)} title="Modifier les réponses"
                  className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(sub)} title="Supprimer / annuler l'inscription"
                  className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Thème picker ───────────────────────────────────────────────────────────
function ThemePicker({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5" /> Thème visuel
      </p>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(SONDAGE_THEMES).map(([key, theme]) => (
          <button key={key} type="button" title={theme.label}
            onClick={() => onChange({ preset: key })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
              value?.preset === key || (!value?.preset && key === "mbp")
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}>
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: theme.primary }} />
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Logique conditionnelle par question ────────────────────────────────────
function LogicBuilder({ q, onChange, sectionItems }) {
  const [open, setOpen] = useState(false);
  const hasLogic = (q.logic?.rules || []).length > 0;
  const isChoiceType = ["single", "multiple", "ouinon", "dropdown"].includes(q.type);
  if (!isChoiceType || sectionItems.length === 0) return null;

  const options = q.type === "ouinon" ? ["Oui", "Non"] : (q.options || []).filter(o => o.trim());
  if (options.length === 0) return null;

  function setRule(optIdx, targetId) {
    const rules = (q.logic?.rules || []).filter(r => r.option_index !== optIdx);
    if (targetId) rules.push({ option_index: optIdx, goto_section_id: targetId });
    onChange({ ...q, logic: rules.length ? { rules } : {} });
  }

  return (
    <div className="mt-2 border-t border-dashed border-border pt-2">
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasLogic ? "text-violet-400" : "text-muted-foreground hover:text-violet-400"}`}>
        <GitBranch className="w-3 h-3" />
        Logique conditionnelle
        {hasLogic && <span className="px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded-full">{q.logic.rules.length} règle{q.logic.rules.length !== 1 ? "s" : ""}</span>}
        <span className="ml-auto">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 pl-2">
          <p className="text-xs text-muted-foreground">Rediriger le répondant selon sa réponse :</p>
          {options.map((opt, i) => {
            const rule = (q.logic?.rules || []).find(r => r.option_index === i);
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLOR_HEX[i % COLOR_HEX.length] }} />
                <span className="text-xs text-foreground flex-1 truncate min-w-0">{opt}</span>
                <select value={rule?.goto_section_id || ""}
                  onChange={e => setRule(i, e.target.value || null)}
                  className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-violet-300">
                  <option value="">→ Section suivante</option>
                  {sectionItems.map(sec => (
                    <option key={sec._id} value={sec._id}>{sec.titre || "Section sans titre"}</option>
                  ))}
                  <option value="__end__">→ Terminer le sondage</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sous-question conditionnelle ────────────────────────────────────────────
// Permet de n'afficher cette question que si une option précise a été choisie
// à une question à choix précédente (ex : « Si Oui → précisez »).
function ConditionBuilder({ q, onChange, prevChoiceQuestions }) {
  const [open, setOpen] = useState(false);
  if (prevChoiceQuestions.length === 0) return null;

  const cond = q.config?.condition || null;
  const parent = prevChoiceQuestions.find(p => p._id === cond?.question_id);
  const parentOptions = parent
    ? (parent.type === "ouinon" ? ["Oui", "Non"] : (parent.options || []).filter(o => o.trim()))
    : [];

  function setParent(parentId) {
    if (!parentId) {
      const { condition, ...rest } = q.config || {};
      onChange({ ...q, config: rest });
      return;
    }
    onChange({ ...q, config: { ...q.config, condition: { question_id: parentId, option_index: 0 } } });
  }
  function setOption(idx) {
    onChange({ ...q, config: { ...q.config, condition: { ...cond, option_index: idx } } });
  }

  return (
    <div className="mt-2 border-t border-dashed border-border pt-2">
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${cond ? "text-sky-400" : "text-muted-foreground hover:text-sky-400"}`}>
        <GitBranch className="w-3 h-3 rotate-90" />
        Sous-question
        {cond && parent && (
          <span className="px-1.5 py-0.5 bg-sky-500/15 text-sky-400 rounded-full truncate max-w-[220px]">
            si « {parent.libelle} » = {parentOptions[cond.option_index] ?? "?"}
          </span>
        )}
        <span className="ml-auto">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 pl-2">
          <p className="text-xs text-muted-foreground">N'afficher cette question que si :</p>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={cond?.question_id || ""}
              onChange={e => setParent(e.target.value || null)}
              className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-sky-300 max-w-[240px]">
              <option value="">— Toujours affichée —</option>
              {prevChoiceQuestions.map(p => (
                <option key={p._id} value={p._id}>{p.libelle}</option>
              ))}
            </select>
            {cond && parent && (
              <>
                <span className="text-xs text-muted-foreground">a pour réponse</span>
                <select value={cond.option_index}
                  onChange={e => setOption(Number(e.target.value))}
                  className="text-xs border border-border rounded-lg px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-sky-300 max-w-[200px]">
                  {parentOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Constructeur de question ───────────────────────────────────────────────
function QuestionBuilder({ q, idx, total, onChange, onRemove, onMove, sectionItems, prevChoiceQuestions }) {
  const [showImageInputs, setShowImageInputs] = useState({});
  const needsOptions = q.type === "single" || q.type === "multiple" || q.type === "dropdown";

  function setOptVal(i, val) {
    const opts = [...(q.options || [])]; opts[i] = val;
    onChange({ ...q, options: opts });
  }
  function setOptImage(i, url) {
    onChange({ ...q, options_images: { ...(q.options_images || {}), [i]: url } });
  }
  function addOpt() { onChange({ ...q, options: [...(q.options || []), ""] }); }
  function removeOpt(i) {
    const opts = (q.options || []).filter((_, j) => j !== i);
    const imgs = { ...(q.options_images || {}) };
    delete imgs[i];
    // Re-key images after removal
    const reKeyed = {};
    opts.forEach((_, newIdx) => {
      const oldIdx = newIdx >= i ? newIdx + 1 : newIdx;
      if (imgs[oldIdx]) reKeyed[newIdx] = imgs[oldIdx];
    });
    onChange({ ...q, options: opts, options_images: reKeyed });
  }
  function moveOpt(i, dir) {
    const opts = [...(q.options || [])]; const j = i + dir;
    if (j < 0 || j >= opts.length) return;
    [opts[i], opts[j]] = [opts[j], opts[i]];
    const imgs = { ...(q.options_images || {}) };
    const tmp = imgs[i]; imgs[i] = imgs[j]; imgs[j] = tmp;
    if (!imgs[i]) delete imgs[i]; if (!imgs[j]) delete imgs[j];
    onChange({ ...q, options: opts, options_images: imgs });
  }
  function changeType(newType) {
    const needsOpts = newType === "single" || newType === "multiple" || newType === "dropdown";
    // On préserve la condition de sous-question : elle ne dépend pas du type
    const keptConfig = q.config?.condition ? { condition: q.config.condition } : {};
    onChange({ ...q, type: newType, options: needsOpts ? (q.options?.length >= 2 ? q.options : ["", ""]) : [], config: keptConfig, logic: {} });
  }

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0 pt-1">
          <button type="button" onClick={() => onMove(idx, -1)} disabled={idx === 0}
            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => onMove(idx, 1)} disabled={idx === total - 1}
            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <span className="text-xs font-bold text-muted-foreground pt-1.5 w-5 text-center">{idx + 1}</span>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex gap-1 flex-wrap">
            {Q_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => changeType(t.value)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                  q.type === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-card"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <input className={inp} value={q.libelle}
            onChange={e => onChange({ ...q, libelle: e.target.value })}
            placeholder="Libellé de la question…" />

          <input className={`${inp} text-xs`} value={q.config?.aide || ""}
            onChange={e => onChange({ ...q, config: { ...q.config, aide: e.target.value || undefined } })}
            placeholder="Texte d'aide affiché sous la question (optionnel)…" />

          {needsOptions && (
            <div className="space-y-1.5 pl-1">
              {(q.options || []).map((opt, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0">
                      <button type="button" onClick={() => moveOpt(i, -1)} disabled={i === 0}
                        className="w-4 h-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
                        <ChevronUp className="w-2.5 h-2.5" />
                      </button>
                      <button type="button" onClick={() => moveOpt(i, 1)} disabled={i === (q.options?.length || 0) - 1}
                        className="w-4 h-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLOR_HEX[i % COLOR_HEX.length] }} />
                    <input className={`${inp} flex-1 text-sm`} value={opt}
                      onChange={e => setOptVal(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOpt(); } }}
                    />
                    <button type="button" title="Image"
                      onClick={() => setShowImageInputs(p => ({ ...p, [i]: !p[i] }))}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${q.options_images?.[i] ? "text-emerald-400 bg-emerald-500/15" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}>
                      <Image className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => removeOpt(i)}
                      disabled={(q.options?.length || 0) <= 2}
                      className="w-6 h-6 rounded hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-20">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {showImageInputs[i] && (
                    <div className="pl-8 flex items-center gap-2">
                      <input
                        className={`${inp} flex-1 text-xs`}
                        value={q.options_images?.[i] || ""}
                        onChange={e => setOptImage(i, e.target.value)}
                        placeholder="URL de l'image (https://…)"
                      />
                      {q.options_images?.[i] && (
                        <img src={q.options_images[i]} alt={`Illustration option ${i + 1}`} className="w-8 h-8 object-cover rounded border border-border" onError={e => e.currentTarget.style.display = "none"} />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-4 flex-wrap">
                <button type="button" onClick={addOpt}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une option
                </button>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={!!q.config?.allow_other}
                    onChange={e => onChange({ ...q, config: { ...q.config, allow_other: e.target.checked || undefined } })}
                    className="w-3.5 h-3.5 rounded accent-primary" />
                  <span className="text-xs text-muted-foreground">Option « Autre (précisez) »</span>
                </label>
              </div>
            </div>
          )}

          {q.type === "texte" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex-shrink-0">Format :</span>
              <div className="flex gap-1 flex-wrap">
                {VALIDATIONS.map(v => (
                  <button key={v.value} type="button"
                    onClick={() => onChange({ ...q, config: { ...q.config, validation: v.value || undefined } })}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      (q.config?.validation || "") === v.value
                        ? "bg-indigo-500/15 text-indigo-400 border-indigo-300"
                        : "border-border text-muted-foreground hover:border-indigo-300 bg-card"
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.type === "ouinon" && (
            <div className="flex gap-2">
              <span className="text-xs px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded-full font-medium">Oui</span>
              <span className="text-xs px-3 py-1 bg-red-500/15 text-red-400 rounded-full font-medium">Non</span>
            </div>
          )}
          {q.type === "texte" && !q.config?.validation && (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground italic">Zone de texte libre…</div>
          )}
          {q.type === "texte" && q.config?.validation === "email" && (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground italic">ex@email.com</div>
          )}
          {q.type === "texte" && q.config?.validation === "nombre" && (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground italic">0 — 9999</div>
          )}
          {q.type === "texte" && q.config?.validation === "telephone" && (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground italic">+228 XX XX XX XX</div>
          )}
          {q.type === "date" && (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground italic">📅 Sélection de date</div>
          )}
          {q.type === "note" && (
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map(n => <span key={n} className="text-amber-300 text-lg">★</span>)}
              <span className="text-xs text-muted-foreground ml-1">de 1 à 5</span>
            </div>
          )}
          {q.type === "echelle" && (
            <div className="flex gap-1 items-center flex-wrap">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">{i + 1}</span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">de 1 à 10</span>
            </div>
          )}

          <ConditionBuilder q={q} onChange={onChange} prevChoiceQuestions={prevChoiceQuestions} />
          <LogicBuilder q={q} onChange={onChange} sectionItems={sectionItems} />
        </div>

        <button type="button" onClick={onRemove} disabled={total <= 1}
          className="w-7 h-7 mt-0.5 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-20 flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="pl-12">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={q.obligatoire}
            onChange={e => onChange({ ...q, obligatoire: e.target.checked })}
            className="w-3.5 h-3.5 rounded accent-primary" />
          <span className="text-xs text-muted-foreground">Obligatoire</span>
        </label>
      </div>
    </div>
  );
}

// ── Constructeur de section ────────────────────────────────────────────────
function SectionBuilder({ sec, onChangeSec, onRemoveSec }) {
  return (
    <div className="flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 rounded-xl px-4 py-3">
      <Columns className="w-4 h-4 text-violet-500 flex-shrink-0" />
      <input
        className="flex-1 text-sm font-semibold text-violet-800 bg-transparent border-none outline-none placeholder:text-violet-400"
        value={sec.titre}
        onChange={e => onChangeSec({ ...sec, titre: e.target.value })}
        placeholder="Titre de la section…"
      />
      <input
        className="flex-1 text-xs text-violet-400 bg-transparent border-none outline-none placeholder:text-violet-400"
        value={sec.description || ""}
        onChange={e => onChangeSec({ ...sec, description: e.target.value })}
        placeholder="Description optionnelle…"
      />
      <button type="button" onClick={onRemoveSec}
        className="w-6 h-6 rounded hover:bg-violet-100 flex items-center justify-center text-violet-400 hover:text-violet-400">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Modal d'invitation ─────────────────────────────────────────────────────
function InviteModal({ sondage, onClose, origin, pendingInvitations = [] }) {
  const [members, setMembers] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [extraEmails, setExtraEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newNom, setNewNom] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState(pendingInvitations.length > 0 ? "relance" : "membres");

  useEffect(() => {
    supabase.from("members").select("id, nom, email, photo").order("nom").then(({ data }) => {
      setMembers(data || []); setLoadingMembers(false);
    });
  }, []);

  const filtered = (members || []).filter(m =>
    !search || `${m.nom} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  function toggleMember(id) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function addExtraEmail() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Email invalide."); return; }
    if (extraEmails.some(e => e.email === email)) { toast.error("Déjà dans la liste."); return; }
    setExtraEmails(p => [...p, { email, nom: newNom.trim() || null }]);
    setNewEmail(""); setNewNom("");
  }

  const totalCount = tab === "relance" ? pendingInvitations.length : selectedIds.size + extraEmails.length;

  async function handleSend() {
    if (!totalCount) { toast.error("Aucun destinataire."); return; }
    setSending(true);

    if (tab === "relance") {
      const payload = {
        type: "sondage_invitation",
        sondageTitre: `[Rappel] ${sondage.titre}`,
        sondageDescription: sondage.description || null,
        invitations: pendingInvitations.map(inv => ({
          id: inv.id, email: inv.email, nom: inv.nom,
          lien: `${origin}/sondage/${sondage.id}?token=${inv.token}`,
        })),
      };
      try {
        const res = await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const result = await res.json();
        toast.success(`${result.sent} rappel${result.sent !== 1 ? "s" : ""} envoyé${result.sent !== 1 ? "s" : ""} !`);
      } catch (e) { toast.error("Erreur : " + e.message); }
      setSending(false); onClose(); return;
    }

    const recipients = [
      ...Array.from(selectedIds).map(id => {
        const m = members.find(m => m.id === id);
        return { email: m.email, nom: m.nom };
      }).filter(r => r.email),
      ...extraEmails,
    ];

    const { data: invitations, error } = await createInvitations(sondage.id, recipients);
    if (error) { toast.error("Erreur : " + error.message); setSending(false); return; }

    const payload = {
      type: "sondage_invitation",
      sondageTitre: sondage.titre,
      sondageDescription: sondage.description || null,
      invitations: invitations.map(inv => ({
        id: inv.id, email: inv.email, nom: inv.nom,
        lien: `${origin}/sondage/${sondage.id}?token=${inv.token}`,
      })),
    };

    try {
      const res = await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (result.sentIds?.length) await markInvitationsSent(result.sentIds);
      if (result.errors?.length) toast.warning(`${result.sent} envoyée${result.sent !== 1 ? "s" : ""}, ${result.errors.length} échec(s).`);
      else toast.success(`${result.sent} invitation${result.sent !== 1 ? "s" : ""} envoyée${result.sent !== 1 ? "s" : ""} !`);
    } catch (e) { toast.error("Erreur : " + e.message); }

    setSending(false); onClose();
  }

  const tabs = [
    { key: "membres",  label: "Membres MBP" },
    { key: "externes", label: "Emails libres" },
    ...(pendingInvitations.length ? [{ key: "relance", label: `Relancer (${pendingInvitations.length})` }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <p className="font-semibold text-foreground text-sm">Envoyer des invitations</p>
            <p className="text-xs text-muted-foreground truncate max-w-xs">« {sondage.titre} »</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex border-b border-border flex-shrink-0">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "relance" && (
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Un rappel sera envoyé aux <strong>{pendingInvitations.length}</strong> invité{pendingInvitations.length !== 1 ? "s" : ""} qui n'ont pas encore répondu.
              </p>
              <div className="space-y-1.5">
                {pendingInvitations.map(inv => (
                  <div key={inv.id} className="flex items-center gap-2 bg-amber-500/15 border border-amber-100 rounded-xl px-3 py-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      {inv.nom && <p className="text-sm font-medium text-foreground truncate">{inv.nom}</p>}
                      <p className="text-xs text-muted-foreground truncate">{inv.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "membres" && (
            <div className="p-4 space-y-3">
              <input className={inp} placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
              {loadingMembers ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filtered.length} membre{filtered.length !== 1 ? "s" : ""}</span>
                    <button onClick={() => {
                      const allSel = filtered.filter(m => m.email).every(m => selectedIds.has(m.id));
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        filtered.filter(m => m.email).forEach(m => allSel ? next.delete(m.id) : next.add(m.id));
                        return next;
                      });
                    }} className="text-primary hover:underline">
                      {filtered.filter(m => m.email).every(m => selectedIds.has(m.id)) ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {filtered.map(m => {
                      const selected = selectedIds.has(m.id);
                      return (
                        <button key={m.id} onClick={() => m.email && toggleMember(m.id)} disabled={!m.email}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${selected ? "bg-primary/8 border border-primary/20" : "hover:bg-muted/60 border border-transparent"} ${!m.email ? "opacity-40 cursor-not-allowed" : ""}`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {m.photo
                            ? <img src={m.photo} alt={m.nom || "Photo du membre"} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{m.nom}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email || "Pas d'email"}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "externes" && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Email *"><input className={inp} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="ex@email.com" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addExtraEmail(); } }} /></Field>
                  <Field label="Nom (optionnel)"><input className={inp} value={newNom} onChange={e => setNewNom(e.target.value)} placeholder="Prénom Nom" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addExtraEmail(); } }} /></Field>
                </div>
                <button onClick={addExtraEmail} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium">
                  <UserPlus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              {extraEmails.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">Aucun email externe ajouté.</p>
                : (
                  <div className="space-y-1.5">
                    {extraEmails.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
                        <div className="flex-1 min-w-0">
                          {e.nom && <p className="text-sm font-medium text-foreground truncate">{e.nom}</p>}
                          <p className="text-xs text-muted-foreground truncate">{e.email}</p>
                        </div>
                        <button onClick={() => setExtraEmails(p => p.filter((_, j) => j !== i))}
                          className="w-6 h-6 rounded hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/30 flex-shrink-0">
          <span className="text-sm text-muted-foreground">{totalCount} destinataire{totalCount !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSend} disabled={sending || totalCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : tab === "relance" ? <RefreshCw className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {tab === "relance" ? "Envoyer les rappels" : `Envoyer${totalCount > 0 ? ` (${totalCount})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Factories ─────────────────────────────────────────────────────────────
const emptyQ = () => ({
  _id: Date.now() + Math.random(), _type: "question",
  type: "single", libelle: "", options: ["", ""],
  obligatoire: true, config: {}, logic: {}, options_images: {},
});
const emptySection = () => ({
  _id: Date.now() + Math.random(), _type: "section",
  titre: "Nouvelle section", description: "",
});
const emptyForm = {
  titre: "", description: "", actif: true, expires_at: "", theme: { preset: "mbp" },
  anonyme: false, mention_rgpd: "",
  max_soumissions: "", thanks_message: "", show_results: true,
};

// ── Composant principal ────────────────────────────────────────────────────
export default function SondagesSection() {
  const { sondages, loading, createSondage, updateSondage, updateSondageFull, deleteSondage, duplicateSondage } = useSondages({ adminMode: true });
  const { confirm, ConfirmEl } = useConfirm();
  const [form, setForm] = useState(null);
  const [items, setItems] = useState([emptyQ()]); // flat list: questions + section breaks
  const [expanded, setExpanded] = useState({});
  const [results, setResults] = useState({});
  const [saving, setSaving] = useState(false);
  const [inviteModal, setInviteModal] = useState(null);

  const origin = window.location.origin;

  const sectionItems = useMemo(() => items.filter(i => i._type === "section"), [items]);
  const questionItems = useMemo(() => items.filter(i => i._type === "question"), [items]);

  function openForm() { setForm({ ...emptyForm }); setItems([emptyQ()]); }

  // Pré-remplit le formulaire avec un sondage existant pour le modifier.
  // Les _id des items reprennent les uuid réels : la logique conditionnelle
  // (goto_section_id) reste ainsi correctement reliée aux sections.
  function openEdit(s) {
    const toItemQ = q => ({
      _id: q.id, _type: "question", id: q.id,
      type: q.type, libelle: q.libelle,
      options: q.options || [], options_images: q.options_images || {},
      obligatoire: q.obligatoire ?? true, config: q.config || {}, logic: q.logic || {},
    });
    const qs = s.questions || [];
    const nextItems = qs.filter(q => !q.section_id).map(toItemQ);
    (s.sections || []).forEach(sec => {
      nextItems.push({ _id: sec.id, _type: "section", id: sec.id, titre: sec.titre, description: sec.description || "" });
      qs.filter(q => q.section_id === sec.id).forEach(q => nextItems.push(toItemQ(q)));
    });
    if (!nextItems.some(i => i._type === "question")) nextItems.push(emptyQ());

    setForm({
      id: s.id,
      titre: s.titre,
      description: s.description || "",
      actif: s.actif,
      expires_at: s.expires_at ? s.expires_at.slice(0, 10) : "",
      theme: s.theme || { preset: "mbp" },
      anonyme: s.anonyme || false,
      mention_rgpd: s.mention_rgpd || "",
      max_soumissions: s.settings?.max_soumissions || "",
      thanks_message: s.settings?.thanks_message || "",
      show_results: s.settings?.show_results !== false,
    });
    setItems(nextItems);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateItem(id, updated) {
    setItems(prev => prev.map(it => it._id === id ? updated : it));
  }
  function removeItem(id) {
    setItems(prev => {
      const next = prev.filter(it => it._id !== id);
      return next.filter(it => it._type === "question").length >= 1 ? next : prev;
    });
  }
  function moveItem(id, dir) {
    setItems(prev => {
      const idx = prev.findIndex(it => it._id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return arr;
    });
  }
  function addQ() { setItems(prev => [...prev, emptyQ()]); }
  function addSectionBreak() { setItems(prev => [...prev, emptySection()]); }

  async function handleSubmit() {
    if (!form.titre?.trim()) { toast.error("Le titre est obligatoire."); return; }
    const questions = questionItems.filter(q => q.libelle.trim());
    if (!questions.length) { toast.error("Au moins une question requise."); return; }
    for (const q of questions) {
      if (["single", "multiple", "dropdown"].includes(q.type)) {
        if ((q.options || []).filter(o => o.trim()).length < 2) {
          toast.error(`"${q.libelle}" : au moins 2 options requises.`); return;
        }
      }
    }

    // Assign section temp IDs from position
    let currentSectionTempId = null;
    const questionsWithSection = [];
    items.forEach(item => {
      if (item._type === "section") { currentSectionTempId = item._id; }
      else if (item._type === "question" && item.libelle.trim()) {
        questionsWithSection.push({ ...item, _sectionTempId: currentSectionTempId });
      }
    });

    const sections = sectionItems.map(sec => ({
      _tempId: sec._id, id: sec.id || null, titre: sec.titre || "Section", description: sec.description || "",
    }));

    const payload = {
      titre: form.titre.trim(),
      description: form.description?.trim() || null,
      actif: form.actif,
      expires_at: form.expires_at || null,
      theme: form.theme || {},
      anonyme: form.anonyme || false,
      mention_rgpd: form.mention_rgpd?.trim() || null,
      settings: {
        max_soumissions: Number(form.max_soumissions) > 0 ? Number(form.max_soumissions) : null,
        thanks_message: form.thanks_message?.trim() || null,
        show_results: form.show_results !== false,
      },
      sections,
      questions: questionsWithSection,
    };

    setSaving(true);
    const error = form.id
      ? await updateSondageFull(form.id, payload)
      : await createSondage(payload);
    setSaving(false);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success(form.id ? "Sondage modifié !" : "Sondage créé !"); setForm(null);
  }

  async function loadResults(sondageId) {
    const [data, invStats] = await Promise.all([getSondageResults(sondageId), getInvitationStats(sondageId)]);
    setResults(p => ({ ...p, [sondageId]: { ...data, invitations: invStats } }));
    setExpanded(p => ({ ...p, [sondageId]: true }));
  }

  function toggleResults(id) {
    if (expanded[id]) setExpanded(p => ({ ...p, [id]: false })); else loadResults(id);
  }

  function copyLink(id) {
    navigator.clipboard.writeText(`${origin}/sondage/${id}`)
      .then(() => toast.success("Lien copié !")).catch(() => toast.error("Copie impossible."));
  }

  async function toggleActif(s) {
    await updateSondage(s.id, { actif: !s.actif });
    toast.success(s.actif ? "Désactivé." : "Activé.");
  }

  async function handleDelete(s) {
    if (!await confirm(`Supprimer « ${s.titre} » ?`, "Toutes les réponses associées seront supprimées définitivement.")) return;
    await deleteSondage(s.id); toast.success("Sondage supprimé.");
  }

  async function handleDuplicate(s) {
    const err = await duplicateSondage(s);
    if (err) toast.error("Erreur : " + err.message);
    else toast.success(`Copie de « ${s.titre} » créée.`);
  }

  // Génère et ouvre le rapport d'analyse imprimable (overlay unifié openDoc)
  async function openAnalyse(s) {
    const toastId = toast.loading("Préparation du rapport d'analyse…");
    try {
      const { data: soumissions } = await supabase
        .from("sondage_soumissions")
        .select("id, created_at")
        .eq("sondage_id", s.id)
        .order("created_at");
      const ids = (soumissions || []).map(sub => sub.id);
      const { data: reponses } = ids.length
        ? await supabase.from("sondage_reponses").select("*").in("soumission_id", ids)
        : { data: [] };
      const invitations = await getInvitationStats(s.id);

      const html = generateSondageAnalyse(s, {
        soumissions: soumissions || [],
        reponses: reponses || [],
        invitations,
      });
      const filename = `analyse-sondage-${s.titre.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.html`;
      openDoc(html, filename);
      toast.dismiss(toastId);
    } catch (e) {
      toast.error("Erreur : " + e.message, { id: toastId });
    }
  }

  async function handleAnonymize(s) {
    if (!await confirm(`Anonymiser « ${s.titre} » ?`, "Les noms et emails associés aux réponses seront supprimés définitivement. Les réponses elles-mêmes sont conservées.")) return;
    const error = await anonymiserSoumissions(s.id);
    if (error) toast.error("Erreur : " + error.message);
    else {
      toast.success("Données nominatives supprimées — réponses conservées.");
      if (results[s.id]) loadResults(s.id);
    }
  }

  return (
    <div className="space-y-5">
      {ConfirmEl}
      {inviteModal && (
        <InviteModal
          sondage={inviteModal.sondage}
          origin={origin}
          pendingInvitations={inviteModal.pending || []}
          onClose={() => setInviteModal(null)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground leading-tight">Sondages & formulaires</h2>
          <div className="mt-1 h-px w-12" style={{ background: "linear-gradient(to right, #e3c46a, transparent)" }} />
          <p className="text-xs text-muted-foreground mt-0.5">8 types · sections · logique · sous-questions · quota · thèmes · CSV · invitations · analyse</p>
        </div>
        <button onClick={openForm}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nouveau sondage
        </button>
      </div>

      {form && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-semibold text-foreground text-sm">{form.id ? "Modifier le sondage" : "Nouveau sondage / formulaire"}</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Titre *"><input className={inp} value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Satisfaction AG 2025…" /></Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Description (optionnelle)"><textarea className={inp} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Instructions…" /></Field>
              </div>
              <Field label="Date de clôture (optionnelle)"><input type="date" className={inp} value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} /></Field>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.actif} onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-foreground">Publier immédiatement</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <ThemePicker value={form.theme} onChange={theme => setForm(p => ({ ...p, theme }))} />
              </div>

              {/* Paramètres avancés */}
              <div className="md:col-span-2 bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paramètres avancés</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Nombre maximum de réponses (optionnel)">
                    <input type="number" min="1" className={inp} value={form.max_soumissions}
                      onChange={e => setForm(p => ({ ...p, max_soumissions: e.target.value }))}
                      placeholder="Illimité si vide — clôture automatique au quota" />
                  </Field>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form.show_results !== false}
                        onChange={e => setForm(p => ({ ...p, show_results: e.target.checked }))}
                        className="w-4 h-4 rounded accent-primary" />
                      <span className="text-sm text-foreground">Montrer les résultats aux répondants après leur vote</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Message de remerciement personnalisé (optionnel)">
                      <textarea className={inp} rows={2} value={form.thanks_message}
                        onChange={e => setForm(p => ({ ...p, thanks_message: e.target.value }))}
                        placeholder="Ex : Merci pour votre participation, les résultats seront présentés à l'AG…" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* RGPD */}
              <div className="md:col-span-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Paramètres RGPD
                </p>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={form.anonyme || false}
                    onChange={e => setForm(p => ({ ...p, anonyme: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded accent-primary flex-shrink-0" />
                  <div>
                    <span className="text-sm text-foreground font-medium">Sondage anonyme</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Les noms et emails des répondants ne seront pas stockés, même pour les invitations nominatives.</p>
                  </div>
                </label>
                <Field label="Mention RGPD personnalisée (optionnelle)">
                  <textarea className={inp} rows={2} value={form.mention_rgpd || ""}
                    onChange={e => setForm(p => ({ ...p, mention_rgpd: e.target.value }))}
                    placeholder="Laissez vide pour afficher la mention standard MBP sur la page publique…" />
                </Field>
              </div>
            </div>

            <div>
              {form.id && (
                <div className="mb-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 text-xs text-amber-500">
                  ⚠️ Les questions conservées gardent leurs réponses déjà reçues. Supprimer une question
                  supprime définitivement ses réponses ; modifier l'ordre des options d'une question à choix
                  peut fausser l'interprétation des réponses existantes.
                </div>
              )}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Questions & sections ({questionItems.length} question{questionItems.length !== 1 ? "s" : ""}{sectionItems.length > 0 ? `, ${sectionItems.length} section${sectionItems.length !== 1 ? "s" : ""}` : ""})
              </p>
              <div className="space-y-2">
                {items.map((item, globalIdx) => {
                  if (item._type === "section") {
                    return (
                      <div key={item._id} className="flex items-start gap-1">
                        <div className="flex flex-col gap-0 pt-3">
                          <button type="button" onClick={() => moveItem(item._id, -1)} disabled={globalIdx === 0}
                            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button type="button" onClick={() => moveItem(item._id, 1)} disabled={globalIdx === items.length - 1}
                            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20">
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <SectionBuilder
                            sec={item}
                            onChangeSec={updated => updateItem(item._id, updated)}
                            onRemoveSec={() => removeItem(item._id)}
                          />
                        </div>
                      </div>
                    );
                  }
                  // Question item
                  const qIdx = items.slice(0, globalIdx + 1).filter(i => i._type === "question").length - 1;
                  // Questions à choix précédentes — parents possibles d'une sous-question
                  const prevChoiceQuestions = items.slice(0, globalIdx).filter(i =>
                    i._type === "question" &&
                    ["single", "multiple", "dropdown", "ouinon"].includes(i.type) &&
                    i.libelle.trim()
                  );
                  return (
                    <QuestionBuilder key={item._id}
                      q={item} idx={qIdx} total={questionItems.length}
                      onChange={updated => updateItem(item._id, updated)}
                      onRemove={() => removeItem(item._id)}
                      onMove={(_, dir) => moveItem(item._id, dir)}
                      sectionItems={sectionItems}
                      prevChoiceQuestions={prevChoiceQuestions}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button type="button" onClick={addQ} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium">
                  <Plus className="w-4 h-4" /> Ajouter une question
                </button>
                <button type="button" onClick={addSectionBreak} className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-400 font-medium">
                  <Columns className="w-4 h-4" /> Ajouter une section
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted">Annuler</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {form.id ? "Enregistrer les modifications" : "Créer le sondage"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
      ) : sondages.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl text-muted-foreground">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucun sondage pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sondages.map(s => {
            const theme = SONDAGE_THEMES[s.theme?.preset] || SONDAGE_THEMES.mbp;
            const isExpired = s.expires_at && new Date(s.expires_at) < new Date();
            const res = results[s.id];
            const pendingInv = (res?.invitations || []).filter(i => !i.a_repondu);
            return (
              <div key={s.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.actif && !isExpired ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/60 text-muted-foreground"}`}>
                          {isExpired ? "Clôturé" : s.actif ? "En cours" : "Désactivé"}
                        </span>
                        <span className="text-xs text-muted-foreground">{s.questions?.length || 0} question{(s.questions?.length || 0) !== 1 ? "s" : ""}</span>
                        {s.sections?.length > 0 && <span className="text-xs text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded-full">{s.sections.length} section{s.sections.length !== 1 ? "s" : ""}</span>}
                        {s.expires_at && <span className="text-xs text-muted-foreground">· Expire le {new Date(s.expires_at).toLocaleDateString("fr-FR")}</span>}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.anonyme ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {s.anonyme ? "Anonyme" : "Nominatif"}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.primary }} title={theme.label} />
                      </div>
                      <h3 className="font-semibold text-foreground leading-tight">{s.titre}</h3>
                      {s.description && <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                      <button onClick={() => setInviteModal({ sondage: s, pending: pendingInv })} title="Envoyer invitations"
                        className="w-8 h-8 rounded-lg hover:bg-blue-500/15 flex items-center justify-center text-muted-foreground hover:text-blue-400 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(s)} title="Modifier le sondage"
                        className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openAnalyse(s)} title="Rapport d'analyse (imprimable)"
                        className="w-8 h-8 rounded-lg hover:bg-violet-500/15 flex items-center justify-center text-muted-foreground hover:text-violet-400 transition-colors">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => exportCSV(s)} title="Exporter CSV"
                        className="w-8 h-8 rounded-lg hover:bg-emerald-500/15 flex items-center justify-center text-muted-foreground hover:text-emerald-400 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => copyLink(s.id)} title="Copier le lien"
                        className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleResults(s.id)} title="Résultats"
                        className="w-8 h-8 rounded-lg hover:bg-indigo-500/15 flex items-center justify-center text-muted-foreground hover:text-indigo-400 transition-colors">
                        {expanded[s.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDuplicate(s)} title="Dupliquer"
                        className="w-8 h-8 rounded-lg hover:bg-sky-50 flex items-center justify-center text-muted-foreground hover:text-sky-600 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActif(s)} title={s.actif ? "Désactiver" : "Activer"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs font-bold ${s.actif ? "hover:bg-amber-500/15 text-amber-500" : "hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-400"}`}>
                        {s.actif ? "⏸" : "▶"}
                      </button>
                      <button onClick={() => handleDelete(s)} title="Supprimer"
                        className="w-8 h-8 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {expanded[s.id] && (
                    <div className="mt-4 pt-4 border-t border-border/60 space-y-4">
                      {!res ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Chargement…</div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 flex-wrap">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {res.total} réponse{res.total !== 1 ? "s" : ""}
                            </p>
                            {res.total > 0 && (
                              <button onClick={() => openAnalyse(s)}
                                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
                                <Printer className="w-3 h-3" /> Rapport d'analyse
                              </button>
                            )}
                            {!s.anonyme && res.total > 0 && (
                              <button onClick={() => handleAnonymize(s)}
                                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors">
                                <ShieldCheck className="w-3 h-3" /> Anonymiser les données
                              </button>
                            )}
                            {res.invitations?.length > 0 && (
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">
                                  {res.invitations.filter(i => i.a_repondu).length}/{res.invitations.length} invités ont répondu
                                </p>
                                {pendingInv.length > 0 && (
                                  <button onClick={() => setInviteModal({ sondage: s, pending: pendingInv })}
                                    className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-100 transition-colors flex items-center gap-1">
                                    <RefreshCw className="w-2.5 h-2.5" /> Relancer ({pendingInv.length})
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {res.invitations?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {res.invitations.map(inv => (
                                <span key={inv.id} className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${inv.a_repondu ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                                  {inv.a_repondu ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                  {inv.nom || inv.email}
                                </span>
                              ))}
                            </div>
                          )}

                          {res.total > 0 && (
                            <SoumissionsList sondage={s} confirm={confirm} onChanged={() => loadResults(s.id)} />
                          )}

                          {(s.questions || []).map((q, i) => (
                            <div key={q.id} className="bg-muted/30 rounded-xl p-3">
                              <p className="text-xs font-semibold text-foreground mb-2">{i + 1}. {q.libelle}</p>
                              <QuestionResults question={q} reponses={res.reponses} total={res.total} />
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground font-mono break-all select-all">{origin}/sondage/{s.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
