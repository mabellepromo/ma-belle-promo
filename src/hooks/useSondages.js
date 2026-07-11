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

// ── Thèmes visuels ─────────────────────────────────────────────────────────

export const SONDAGE_THEMES = {
  mbp:    { label: "MBP (défaut)", primary: "#0a3d28", accent: "#b8861a", bg: "from-slate-50 to-emerald-50/30" },
  ocean:  { label: "Océan",        primary: "#0369a1", accent: "#0ea5e9", bg: "from-sky-50 to-blue-50/30" },
  violet: { label: "Violet",       primary: "#7c3aed", accent: "#a78bfa", bg: "from-violet-50 to-purple-50/30" },
  rose:   { label: "Rose",         primary: "#be185d", accent: "#f43f5e", bg: "from-rose-50 to-pink-50/30" },
  slate:  { label: "Ardoise",      primary: "#334155", accent: "#64748b", bg: "from-gray-50 to-slate-100/30" },
  soleil: { label: "Soleil",       primary: "#b45309", accent: "#f59e0b", bg: "from-amber-50 to-yellow-50/30" },
};

export function getTheme(sondage) {
  const key = sondage?.theme?.preset || "mbp";
  return SONDAGE_THEMES[key] || SONDAGE_THEMES.mbp;
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
      .select("*, sondage_sections(*), sondage_questions(*)")
      .order("created_at", { ascending: false });
    if (!adminMode) q = q.eq("actif", true);
    q.then(({ data }) => {
      setSondages((data || []).map(s => ({
        ...s,
        sections: (s.sondage_sections || []).sort((a, b) => a.ordre - b.ordre),
        questions: (s.sondage_questions || []).sort((a, b) => a.ordre - b.ordre),
      })));
      setLoading(false);
    });
  }, [adminMode, rev]);

  function refresh() { setRev(v => v + 1); }

  async function createSondage({ questions = [], sections = [], ...sondageData }) {
    const { data: s, error } = await supabase.from("sondages").insert(sondageData).select().single();
    if (error) return error;

    // Insérer les sections d'abord pour récupérer leurs IDs
    const sectionIdMap = {}; // tempId → real uuid
    if (sections.length) {
      const sectionRows = sections.map((sec, i) => ({
        sondage_id: s.id,
        titre: sec.titre || "Section",
        description: sec.description || "",
        ordre: i,
      }));
      const { data: insertedSections, error: secErr } = await supabase
        .from("sondage_sections").insert(sectionRows).select();
      if (secErr) return secErr;
      insertedSections.forEach((sec, i) => {
        sectionIdMap[sections[i]._tempId] = sec.id;
      });
    }

    if (questions.length) {
      const rows = questions.map((q, i) => {
        const rawLogic = q.logic || {};
        const mappedLogic = rawLogic.rules?.length
          ? { rules: rawLogic.rules.map(r => ({
              option_index: r.option_index,
              goto_section_id: r.goto_section_id === "__end__"
                ? "__end__"
                : (sectionIdMap[r.goto_section_id] || r.goto_section_id),
            })) }
          : {};
        return {
          sondage_id: s.id,
          ordre: i, type: q.type,
          libelle: q.libelle.trim(),
          options: (q.options || []).filter(o => o.trim()),
          options_images: q.options_images || {},
          obligatoire: q.obligatoire ?? true,
          config: q.config || {},
          logic: mappedLogic,
          section_id: q._sectionTempId ? (sectionIdMap[q._sectionTempId] || null) : null,
        };
      });
      const { data: insertedQs, error: qErr } = await supabase
        .from("sondage_questions").insert(rows).select();
      if (qErr) return qErr;

      // Deuxième passe : re-lier les sous-questions conditionnelles.
      // Dans le builder, config.condition.question_id référence l'_id temporaire
      // de la question parente ; on le remplace par l'uuid réel.
      const qIdMap = {};
      (insertedQs || []).forEach((row, i) => { qIdMap[questions[i]._id] = row.id; });
      for (let i = 0; i < (insertedQs || []).length; i++) {
        const cond = insertedQs[i].config?.condition;
        if (cond?.question_id && qIdMap[cond.question_id]) {
          const { error: condErr } = await supabase.from("sondage_questions")
            .update({ config: { ...insertedQs[i].config, condition: { ...cond, question_id: qIdMap[cond.question_id] } } })
            .eq("id", insertedQs[i].id);
          if (condErr) return condErr;
        }
      }
    }
    refresh();
    return null;
  }

  // Mise à jour complète : sondage + sections + questions.
  // Les questions existantes sont mises à jour par leur id (leurs réponses
  // sont conservées) ; seules les questions retirées du formulaire sont
  // supprimées (avec leurs réponses, par cascade).
  async function updateSondageFull(id, { questions = [], sections = [], ...sondageData }) {
    const { error } = await supabase.from("sondages").update(sondageData).eq("id", id);
    if (error) return error;

    // Sections : maj des existantes, insertion des nouvelles
    const sectionIdMap = {}; // _tempId → uuid réel
    const keptSectionIds = [];
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const row = { titre: sec.titre || "Section", description: sec.description || "", ordre: i };
      if (sec.id) {
        const { error: secErr } = await supabase.from("sondage_sections").update(row).eq("id", sec.id);
        if (secErr) return secErr;
        sectionIdMap[sec._tempId] = sec.id;
        keptSectionIds.push(sec.id);
      } else {
        const { data: inserted, error: secErr } = await supabase
          .from("sondage_sections").insert({ ...row, sondage_id: id }).select().single();
        if (secErr) return secErr;
        sectionIdMap[sec._tempId] = inserted.id;
        keptSectionIds.push(inserted.id);
      }
    }
    // Suppression des sections retirées
    let delSec = supabase.from("sondage_sections").delete().eq("sondage_id", id);
    if (keptSectionIds.length) delSec = delSec.not("id", "in", `(${keptSectionIds.join(",")})`);
    const { error: delSecErr } = await delSec;
    if (delSecErr) return delSecErr;

    // Questions : maj des existantes, insertion des nouvelles
    const keptQuestionIds = [];
    const questionIdMap = {}; // _id du builder (temp ou réel) → uuid réel
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const rawLogic = q.logic || {};
      const mappedLogic = rawLogic.rules?.length
        ? { rules: rawLogic.rules.map(r => ({
            option_index: r.option_index,
            goto_section_id: r.goto_section_id === "__end__"
              ? "__end__"
              : (sectionIdMap[r.goto_section_id] || r.goto_section_id),
          })) }
        : {};
      const row = {
        ordre: i, type: q.type,
        libelle: q.libelle.trim(),
        options: (q.options || []).filter(o => o.trim()),
        options_images: q.options_images || {},
        obligatoire: q.obligatoire ?? true,
        config: q.config || {},
        logic: mappedLogic,
        section_id: q._sectionTempId ? (sectionIdMap[q._sectionTempId] || null) : null,
      };
      if (q.id) {
        const { error: qErr } = await supabase.from("sondage_questions").update(row).eq("id", q.id);
        if (qErr) return qErr;
        keptQuestionIds.push(q.id);
        questionIdMap[q._id ?? q.id] = q.id;
      } else {
        const { data: inserted, error: qErr } = await supabase
          .from("sondage_questions").insert({ ...row, sondage_id: id }).select().single();
        if (qErr) return qErr;
        keptQuestionIds.push(inserted.id);
        questionIdMap[q._id] = inserted.id;
      }
    }

    // Deuxième passe : re-lier les conditions des sous-questions dont le
    // parent vient d'être créé (id temporaire du builder → uuid réel)
    for (let i = 0; i < questions.length; i++) {
      const cond = questions[i].config?.condition;
      const mapped = cond?.question_id ? questionIdMap[cond.question_id] : null;
      if (mapped && mapped !== cond.question_id) {
        const { error: condErr } = await supabase.from("sondage_questions")
          .update({ config: { ...(questions[i].config || {}), condition: { ...cond, question_id: mapped } } })
          .eq("id", keptQuestionIds[i]);
        if (condErr) return condErr;
      }
    }
    // Suppression des questions retirées (leurs réponses partent en cascade)
    let delQ = supabase.from("sondage_questions").delete().eq("sondage_id", id);
    if (keptQuestionIds.length) delQ = delQ.not("id", "in", `(${keptQuestionIds.join(",")})`);
    const { error: delQErr } = await delQ;
    if (delQErr) return delQErr;

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

  async function duplicateSondage(sondage) {
    const { data: newS, error } = await supabase
      .from("sondages")
      .insert({
        titre: `Copie de ${sondage.titre}`,
        description: sondage.description || null,
        actif: false,
        theme: sondage.theme || {},
        settings: sondage.settings || {},
        anonyme: sondage.anonyme || false,
        mention_rgpd: sondage.mention_rgpd || null,
      })
      .select().single();
    if (error) return error;

    const sectionIdMap = {};
    if (sondage.sections?.length) {
      const { data: newSections } = await supabase
        .from("sondage_sections")
        .insert(sondage.sections.map((sec, i) => ({
          sondage_id: newS.id, titre: sec.titre, description: sec.description || "", ordre: i,
        })))
        .select();
      (newSections || []).forEach((sec, i) => {
        sectionIdMap[sondage.sections[i].id] = sec.id;
      });
    }

    if (sondage.questions?.length) {
      await supabase.from("sondage_questions").insert(
        sondage.questions.map((q, i) => ({
          sondage_id: newS.id,
          ordre: i, type: q.type, libelle: q.libelle,
          options: q.options || [], options_images: q.options_images || {},
          obligatoire: q.obligatoire ?? true,
          config: q.config || {}, logic: q.logic || {},
          section_id: q.section_id ? (sectionIdMap[q.section_id] || null) : null,
        }))
      );
    }
    refresh();
    return null;
  }

  return { sondages, loading, createSondage, updateSondage, updateSondageFull, deleteSondage, duplicateSondage };
}

// ── Page publique ──────────────────────────────────────────────────────────

export async function getSondageWithQuestions(id) {
  const { data } = await supabase
    .from("sondages")
    .select("*, sondage_sections(*), sondage_questions(*)")
    .eq("id", id)
    .single();
  if (!data) return null;
  return {
    ...data,
    sections: (data.sondage_sections || []).sort((a, b) => a.ordre - b.ordre),
    questions: (data.sondage_questions || []).sort((a, b) => a.ordre - b.ordre),
  };
}

// Nombre de réponses déjà reçues (pour le quota max_soumissions)
export async function getSoumissionsCount(sondageId) {
  const { count } = await supabase
    .from("sondage_soumissions")
    .select("id", { count: "exact", head: true })
    .eq("sondage_id", sondageId);
  return count || 0;
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
      fingerprint: invitationId ? null : fingerprint,
      invitation_id: invitationId || null,
      repondant_nom: nom || null,
      repondant_email: email || null,
    })
    .select().single();
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

// ── Gestion des soumissions individuelles (dashboard) ─────────────────────

/** Liste détaillée des soumissions d'un sondage avec leurs réponses */
export async function getSoumissionsDetail(sondageId) {
  const { data: soumissions } = await supabase
    .from("sondage_soumissions")
    .select("*")
    .eq("sondage_id", sondageId)
    .order("created_at", { ascending: false });
  const ids = (soumissions || []).map(s => s.id);
  const { data: reponses } = ids.length
    ? await supabase.from("sondage_reponses").select("*").in("soumission_id", ids)
    : { data: [] };
  return (soumissions || []).map(s => ({
    ...s,
    reponses: (reponses || []).filter(r => r.soumission_id === s.id),
  }));
}

/** Supprime une soumission (et ses réponses, par cascade). Si elle était
 *  liée à une invitation, l'invité pourra répondre à nouveau. */
export async function deleteSoumission(soumissionId) {
  const { error } = await supabase
    .from("sondage_soumissions").delete().eq("id", soumissionId);
  return error;
}

/** Remplace les réponses d'une soumission par celles éditées au dashboard */
export async function updateSoumissionReponses(soumissionId, answers) {
  const { error: delErr } = await supabase
    .from("sondage_reponses").delete().eq("soumission_id", soumissionId);
  if (delErr) return delErr;

  const rows = Object.entries(answers)
    .filter(([, v]) => v.valeur_texte != null || v.valeur_options?.length || v.valeur_note != null)
    .map(([question_id, v]) => ({
      soumission_id: soumissionId,
      question_id,
      valeur_texte: v.valeur_texte ?? null,
      valeur_options: v.valeur_options?.length ? v.valeur_options : null,
      valeur_note: v.valeur_note ?? null,
    }));
  if (rows.length) {
    const { error } = await supabase.from("sondage_reponses").insert(rows);
    if (error) return error;
  }
  return null;
}

// ── Invitations ────────────────────────────────────────────────────────────

export async function createInvitations(sondageId, recipients) {
  const rows = recipients.map(r => ({
    sondage_id: sondageId,
    email: r.email.trim().toLowerCase(),
    nom: r.nom?.trim() || null,
  }));
  const { data, error } = await supabase
    .from("sondage_invitations")
    .insert(rows).select();
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

// ── RGPD ───────────────────────────────────────────────────────────────────

/** Supprime les données nominatives (nom + email) de toutes les soumissions d'un sondage */
export async function anonymiserSoumissions(sondageId) {
  const { error } = await supabase
    .from("sondage_soumissions")
    .update({ repondant_nom: null, repondant_email: null })
    .eq("sondage_id", sondageId);
  return error;
}
