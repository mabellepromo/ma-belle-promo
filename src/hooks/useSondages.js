import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useSondages({ adminMode = false } = {}) {
  const [sondages, setSondages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("sondages").select("*").order("created_at", { ascending: false });
    if (!adminMode) q = q.eq("actif", true);
    const { data } = await q;
    setSondages(data ?? []);
    setLoading(false);
  }, [adminMode]);

  useEffect(() => { load(); }, [load]);

  async function createSondage(data) {
    const { error } = await supabase.from("sondages").insert({
      titre: data.titre,
      description: data.description || null,
      options: data.options,
      actif: data.actif ?? true,
      multiple_choix: data.multiple_choix ?? false,
      expires_at: data.expires_at || null,
    });
    if (!error) await load();
    return error;
  }

  async function updateSondage(id, data) {
    const { error } = await supabase.from("sondages").update(data).eq("id", id);
    if (!error) await load();
    return error;
  }

  async function deleteSondage(id) {
    const { error } = await supabase.from("sondages").delete().eq("id", id);
    if (!error) await load();
    return error;
  }

  return { sondages, loading, createSondage, updateSondage, deleteSondage, reload: load };
}

export async function getVotes(sondageId) {
  const { data } = await supabase
    .from("votes")
    .select("options_choisies")
    .eq("sondage_id", sondageId);
  return data ?? [];
}

export async function submitVote(sondageId, optionsChoisies, fingerprint) {
  const { error } = await supabase.from("votes").insert({
    sondage_id: sondageId,
    options_choisies: optionsChoisies,
    fingerprint,
  });
  return error;
}

export function getFingerprint() {
  const key = "mbp_voter_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, fp);
  }
  return fp;
}
