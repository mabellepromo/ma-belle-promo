import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function getFingerprint() {
  let fp = localStorage.getItem("mbp_voter_fp");
  if (!fp) {
    fp = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mbp_voter_fp", fp);
  }
  return fp;
}

// ── CRUD sondages ──────────────────────────────────────────────────────────

export function useSondages({ adminMode = false } = {}) {
  const [sondages, setSondages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("sondages")
      .select("*, sondage_questions(*)")
      .order("created_at", { ascending: false });
    if (!adminMode) q = q.eq("actif", true);
    q.then(({ data }) => {
      setSondages((data || []).map(s => ({
        ...s,
        questions: (s.sondage_questions || []).sort((a, b) => a.ordre - b.ordre),
      })));
      setLoading(false);
    });
  }, [adminMode, rev]);

  function refresh() { setRev(v => v + 1); }

  async function createSondage({ questions = [], ...sondageData }) {
    const { data: s, error } = await supabase.from("sondages").insert(sondageData).select().single();
    if (error) return error;
    if (questions.length) {
      const rows = questions.map((q, i) => ({
        sondage_id: s.id,
        ordre: i,
        type: q.type,
        libelle: q.libelle.trim(),
        options: (q.options || []).filter(o => o.trim()),
        obligatoire: q.obligatoire ?? true,
        config: q.config || {},
      }));
      const { error: qErr } = await supabase.from("sondage_questions").insert(rows);
      if (qErr) return qErr;
    }
    refresh();
    return null;
  }

  async function updateSondage(id, data) {
    await supabase.from("sondages").update(data).eq("id", id);
    refresh();
  }

  async function deleteSondage(id) {
    await supabase.from("sondages").delete().eq("id", id);
    refresh();
  }

  return { sondages, loading, createSondage, updateSondage, deleteSondage };
}

// ── Page publique ──────────────────────────────────────────────────────────

export async function getSondageWithQuestions(id) {
  const { data } = await supabase
    .from("sondages")
    .select("*, sondage_questions(*)")
    .eq("id", id)
    .single();
  if (!data) return null;
  return {
    ...data,
    questions: (data.sondage_questions || []).sort((a, b) => a.ordre - b.ordre),
  };
}

export async function hasVoted(sondageId, fingerprint) {
  const { data } = await supabase
    .from("sondage_soumissions")
    .select("id")
    .eq("sondage_id", sondageId)
    .eq("fingerprint", fingerprint)
    .maybeSingle();
  return !!data;
}

export async function submitSondage(sondageId, answers, fingerprint, invitationId = null, nom = null, email = null) {
  const { data: soumission, error } = await supabase
    .from("sondage_soumissions")
    .insert({
      sondage_id: sondageId,
      // Pas de fingerprint quand on répond via token (l'invitation garantit l'unicité)
      fingerprint: invitationId ? null : fingerprint,
      invitation_id: invitationId || null,
      repondant_nom: nom || null,
      repondant_email: email || null,
    })
    .select()
    .single();
  if (error) return error;

  const rows = Object.entries(answers)
    .filter(([, v]) => v.valeur_texte != null || v.valeur_options != null || v.valeur_note != null)
    .map(([question_id, v]) => ({
      soumission_id: soumission.id,
      question_id,
      valeur_texte: v.valeur_texte ?? null,
      valeur_options: v.valeur_options ?? null,
      valeur_note: v.valeur_note ?? null,
    }));

  if (rows.length) {
    const { error: rErr } = await supabase.from("sondage_reponses").insert(rows);
    if (rErr) return rErr;
  }
  return null;
}

export async function getSondageResults(sondageId) {
  const { data: soumissions } = await supabase
    .from("sondage_soumissions")
    .select("id")
    .eq("sondage_id", sondageId);

  const total = soumissions?.length || 0;
  if (!total) return { total: 0, reponses: [] };

  const ids = soumissions.map(s => s.id);
  const { data: reponses } = await supabase
    .from("sondage_reponses")
    .select("*")
    .in("soumission_id", ids);

  return { total, reponses: reponses || [] };
}

// ── Invitations ────────────────────────────────────────────────────────────

export async function createInvitations(sondageId, recipients) {
  // recipients: [{email, nom}]
  const rows = recipients.map(r => ({
    sondage_id: sondageId,
    email: r.email.trim().toLowerCase(),
    nom: r.nom?.trim() || null,
  }));
  const { data, error } = await supabase
    .from("sondage_invitations")
    .insert(rows)
    .select();
  return { data, error };
}

export async function markInvitationsSent(ids) {
  if (!ids?.length) return;
  await supabase
    .from("sondage_invitations")
    .update({ envoye_at: new Date().toISOString() })
    .in("id", ids);
}

export async function getInvitationStats(sondageId) {
  const { data } = await supabase
    .from("sondage_invitations")
    .select("*, sondage_soumissions(id)")
    .eq("sondage_id", sondageId)
    .order("created_at", { ascending: true });
  return (data || []).map(inv => ({
    ...inv,
    a_repondu: (inv.sondage_soumissions || []).length > 0,
  }));
}

export async function getInvitationByToken(token) {
  const { data } = await supabase
    .from("sondage_invitations")
    .select("*, sondage_soumissions(id)")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    a_repondu: (data.sondage_soumissions || []).length > 0,
  };
}
