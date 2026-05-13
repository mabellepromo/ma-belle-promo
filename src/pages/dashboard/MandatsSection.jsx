import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useMemberStore } from "@/lib/memberStore";
import { Plus, Trash2, Edit2, CheckCircle, Clock, Loader2, X, Shield, RefreshCw, AlertTriangle } from "lucide-react";
import { inp, Field } from "./shared";

const POSTES_BUREAU = [
  "Présidente", "Vice-Président(e)", "Secrétaire Général(e)", "Secrétaire Général(e) Adjoint(e)",
  "Trésorier(ière)", "Trésorier(ière) Adjoint(e)", "Commissaire aux Comptes", "Conseiller(ière)",
  "Chargé(e) de Communication", "Chargé(e) des Relations Extérieures",
];

export default function MandatsSection() {
  const { allMembers } = useMemberStore({ realtime: false });
  const [mandats, setMandats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [syncPreview, setSyncPreview] = useState(null); // aperçu avant sync

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("mandats")
      .select("*, members(nom, image)")
      .order("actif", { ascending: false })
      .order("poste");
    setMandats(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.poste || !form.member_id || !form.date_debut) {
      toast.error("Poste, membre et date de début obligatoires."); return;
    }
    setSaving(true);
    const payload = {
      poste: form.poste, member_id: form.member_id,
      date_debut: form.date_debut, date_fin: form.date_fin || null,
      actif: form.actif !== false,
    };
    if (form._id) {
      await supabase.from("mandats").update(payload).eq("id", form._id);
      toast.success("Mandat mis à jour.");
    } else {
      await supabase.from("mandats").insert(payload);
      toast.success("Mandat ajouté.");
    }
    setSaving(false); setForm(null); load();
  }

  async function terminate(id) {
    if (!confirm("Marquer ce mandat comme terminé ?")) return;
    await supabase.from("mandats").update({ actif: false, date_fin: new Date().toISOString().slice(0, 10) }).eq("id", id);
    toast.success("Mandat terminé."); load();
  }

  async function remove(id) {
    if (!confirm("Supprimer définitivement ce mandat ?")) return;
    await supabase.from("mandats").delete().eq("id", id);
    toast.success("Mandat supprimé."); load();
  }

  // Prépare l'aperçu de ce qui sera synchronisé vers Équipe
  function prepareSyncPreview() {
    const actifs = mandats.filter(m => m.actif);
    const preview = actifs.map(m => {
      const member = allMembers?.find(mb => mb.id === m.member_id);
      return {
        mandat_id: m.id,
        member_id: m.member_id,
        nom: member?.nom || m.member_id,
        role: m.poste,
        photo: member?.image || member?.photo || null,
        profession: member?.profession || null,
        email: member?.email || null,
      };
    });
    setSyncPreview(preview);
  }

  // Synchronise les mandats actifs vers la table equipe
  async function syncToEquipe() {
    if (!syncPreview?.length) return;
    setSyncing(true);
    try {
      // 1. Récupérer les equipe existantes liées à des membres (member_id non null)
      const { data: existingLinked } = await supabase
        .from("equipe")
        .select("id, member_id")
        .not("member_id", "is", null);

      // 2. Supprimer les equipe liées qui ne sont plus dans les mandats actifs
      const activeIds = new Set(syncPreview.map(p => p.member_id));
      const toDelete = (existingLinked || []).filter(e => !activeIds.has(e.member_id));
      if (toDelete.length) {
        await supabase.from("equipe").delete().in("id", toDelete.map(e => e.id));
      }

      // 3. Upsert chaque mandat actif dans equipe
      for (const p of syncPreview) {
        const existing = (existingLinked || []).find(e => e.member_id === p.member_id);
        const payload = {
          nom: p.nom,
          role: p.role,
          photo: p.photo || null,
          profession: p.profession || null,
          email: p.email || null,
          member_id: p.member_id,
          updated_at: new Date().toISOString(),
        };
        if (existing) {
          await supabase.from("equipe").update(payload).eq("id", existing.id);
        } else {
          // Génère un id unique
          await supabase.from("equipe").insert({ ...payload, id: `mandat_${p.member_id}` });
        }
      }

      toast.success(`${syncPreview.length} membre${syncPreview.length > 1 ? "s" : ""} synchronisé${syncPreview.length > 1 ? "s" : ""} vers l'Équipe.`);
      setSyncPreview(null);
    } catch (e) {
      toast.error("Erreur sync : " + e.message);
    } finally {
      setSyncing(false);
    }
  }

  const actifs = mandats.filter(m => m.actif);
  const archives = mandats.filter(m => !m.actif);

  const getMemberName = (id) => allMembers?.find(m => m.id === id)?.nom || id;

  const emptyForm = { poste: POSTES_BUREAU[0], member_id: "", date_debut: new Date().getFullYear() + "-01-01", date_fin: "", actif: true };

  if (loading) return (
    <div className="flex items-center gap-2 py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Chargement…</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Mandats & Bureau</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Postes actuels et historique des mandats</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prepareSyncPreview}
            className="flex items-center gap-1.5 px-3 py-2 border border-border text-sm font-medium rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-4 h-4" /> Sync → Équipe
          </button>
          <button onClick={() => setForm({ ...emptyForm })}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Ajouter un mandat
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {form && (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{form._id ? "Modifier le mandat" : "Nouveau mandat"}</p>
            <button onClick={() => setForm(null)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Poste *">
              <select className={inp} value={form.poste} onChange={e => setForm(p => ({ ...p, poste: e.target.value }))}>
                {POSTES_BUREAU.map(p => <option key={p}>{p}</option>)}
                <option value="Autre">Autre (saisir manuellement)</option>
              </select>
            </Field>
            <Field label="Membre *">
              <select className={inp} value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                {(allMembers || []).sort((a, b) => a.nom.localeCompare(b.nom)).map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </Field>
            <Field label="Date de début *">
              <input className={inp} type="date" value={form.date_debut} onChange={e => setForm(p => ({ ...p, date_debut: e.target.value }))} />
            </Field>
            <Field label="Date de fin (vide = en cours)">
              <input className={inp} type="date" value={form.date_fin || ""} onChange={e => setForm(p => ({ ...p, date_fin: e.target.value }))} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setForm(null)} className="px-4 py-2 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted">Annuler</button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Aperçu sync → Équipe */}
      {syncPreview && (
        <div className="bg-amber-500/15 border border-amber-500/25 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="font-semibold text-sm text-amber-400">
                Aperçu — {syncPreview.length} membre{syncPreview.length > 1 ? "s" : ""} seront synchronisés vers la table Équipe
              </p>
            </div>
            <button onClick={() => setSyncPreview(null)} className="w-7 h-7 rounded-lg hover:bg-amber-100 flex items-center justify-center text-amber-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {syncPreview.map(p => (
              <div key={p.member_id} className="flex items-center gap-2 bg-card border border-amber-500/25 rounded-xl px-3 py-2">
                {p.photo ? (
                  <img src={p.photo} alt={p.nom} className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber-400">{(p.nom || "?")[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{p.nom}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-400">Les membres Équipe liés à un mandat mais plus actifs seront supprimés. Les membres sans mandat dans Équipe ne sont pas touchés.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setSyncPreview(null)} className="px-4 py-2 text-sm border border-amber-300 rounded-xl text-amber-400 hover:bg-amber-100">Annuler</button>
            <button onClick={syncToEquipe} disabled={syncing}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Confirmer la synchronisation
            </button>
          </div>
        </div>
      )}

      {/* Bureau actuel */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/10 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm text-foreground">Bureau actuel ({actifs.length} poste{actifs.length > 1 ? "s" : ""})</p>
        </div>
        {actifs.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground text-center py-10">Aucun mandat actif enregistré.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {actifs.map(m => (
              <div key={m.id} className="px-5 py-4 flex items-center gap-3">
                {m.members?.image ? (
                  <img src={m.members.image} alt={m.members?.nom} className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{(m.members?.nom || "?")[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{m.members?.nom || getMemberName(m.member_id)}</p>
                  <p className="text-xs text-muted-foreground">{m.poste}</p>
                  <p className="text-xs text-muted-foreground">
                    Depuis {new Date(m.date_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                    <CheckCircle className="w-3 h-3" /> En poste
                  </span>
                  <button onClick={() => setForm({ ...m, _id: m.id, date_fin: m.date_fin || "" })}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground ml-1">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => terminate(m.id)}
                    className="w-7 h-7 rounded-lg hover:bg-amber-500/15 flex items-center justify-center text-muted-foreground hover:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(m.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      {archives.length > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => setShowHistorique(p => !p)}
            className="w-full px-5 py-4 border-b border-border bg-muted/10 flex items-center justify-between text-left">
            <span className="font-semibold text-sm text-foreground">Anciens mandats ({archives.length})</span>
            <span className="text-xs text-muted-foreground">{showHistorique ? "Masquer ▲" : "Afficher ▼"}</span>
          </button>
          {showHistorique && (
            <div className="divide-y divide-border/60">
              {archives.map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3 opacity-60">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{m.members?.nom || getMemberName(m.member_id)}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.poste} · {new Date(m.date_debut).toLocaleDateString("fr-FR", { year: "numeric" })}
                      {m.date_fin && ` → ${new Date(m.date_fin).toLocaleDateString("fr-FR", { year: "numeric" })}`}
                    </p>
                  </div>
                  <button onClick={() => remove(m.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
