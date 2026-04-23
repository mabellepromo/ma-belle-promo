import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { Mail, Send, RefreshCw, UserCheck, UserX, KeyRound } from "lucide-react";

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`;

async function sendInvitation(member, accessToken) {
  if (!accessToken) throw new Error("Session expirée — rechargez la page");

  let res;
  try {
    res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ email: member.email, nom: member.nom, member_id: member.id }),
    });
  } catch (networkErr) {
    throw new Error(`Réseau : ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`);
  }

  /** @type {any} */
  let json = {};
  try { json = await res.json(); } catch {}

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${json.error || json.message || "Erreur inconnue"}`);
  }
  return json;
}

export default function AccesSection() {
  const [members,  setMembers]  = useState(/** @type {any[]} */([]));
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(/** @type {Set<string>} */(new Set()));
  const [sending,  setSending]  = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("id, nom, email, invited_at")
      .eq("status", "validated")
      .order("nom");
    setMembers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const uninvited = members.filter(m => !m.invited_at);
  const invited   = members.filter(m =>  m.invited_at);

  function toggleOne(id) {
    if (sending) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (sending) return;
    setSelected(
      selected.size === uninvited.length
        ? new Set()
        : new Set(uninvited.map(m => m.id))
    );
  }

  async function handleSend() {
    const toSend = uninvited.filter(m => selected.has(m.id));
    if (!toSend.length) return;

    setSending(true);
    setProgress({ done: 0, total: toSend.length });

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    let ok = 0;
    const errors = [];

    for (const member of toSend) {
      try {
        await sendInvitation(member, token);
        ok++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push({ nom: member.nom, err: msg });
      }
      setProgress(p => ({ ...p, done: p.done + 1 }));
      // Pause anti rate-limiting Supabase
      await new Promise(r => setTimeout(r, 500));
    }

    setSending(false);
    setSelected(new Set());
    await load();

    if (errors.length === 0) {
      toast.success(`${ok} invitation(s) envoyée(s) avec succès !`);
    } else {
      const detail = errors.map(e => `${e.nom} : ${e.err}`).join(" | ");
      toast.error(`Erreur : ${detail}`, { duration: 15000 });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Accès membres
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Envoyez une invitation par email aux membres qui n'ont pas encore de compte de connexion.
            Ils recevront un lien pour définir leur propre mot de passe.
          </p>
        </div>
        <button onClick={load} title="Actualiser"
          className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <UserX className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{uninvited.length}</div>
            <div className="text-xs text-amber-600 font-medium">sans invitation</div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{invited.length}</div>
            <div className="text-xs text-green-600 font-medium">invité(s)</div>
          </div>
        </div>
      </div>

      {/* Liste — non invités */}
      {uninvited.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Barre d'actions */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border-b border-amber-200">
            <button onClick={toggleAll} disabled={sending}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors disabled:opacity-50">
              {selected.size === uninvited.length ? "Tout désélectionner" : `Tout sélectionner (${uninvited.length})`}
            </button>

            {selected.size > 0 && (
              <button onClick={handleSend} disabled={sending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {sending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {progress.done} / {progress.total}
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    Inviter la sélection ({selected.size})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Lignes membres */}
          <div className="divide-y divide-border">
            {uninvited.map(m => {
              const isSelected = selected.has(m.id);
              return (
                <div key={m.id} onClick={() => toggleOne(m.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors
                    ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}
                    ${sending ? "pointer-events-none opacity-50" : ""}`}>

                  {/* Checkbox */}
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors
                    ${isSelected ? "bg-primary border-primary" : "border-input"}`}>
                    {isSelected && (
                      <svg viewBox="0 0 10 8" className="w-full h-full p-0.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{m.nom}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  </div>

                  <Mail className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tous invités */}
      {uninvited.length === 0 && (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
          <UserCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-green-800 font-semibold">Tous les membres ont été invités !</p>
          <p className="text-green-600 text-sm mt-1">
            Chaque membre a reçu un email pour activer son accès.
          </p>
        </div>
      )}

      {/* Liste — déjà invités */}
      {invited.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-b border-green-200">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              {invited.length} membre(s) invité(s)
            </span>
          </div>
          <div className="divide-y divide-border">
            {invited.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{m.nom}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(m.invited_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
