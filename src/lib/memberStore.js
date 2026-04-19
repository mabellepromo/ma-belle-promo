import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "./supabase";
import { sbGet } from "./supabase";
import { members as staticMembers } from "../data/members.js";

function rowToMember(row) {
  return { ...row, photoPosition: row.photo_position ?? row.photoPosition };
}

function memberToRow(m) {
  return {
    id:           String(m.id),
    nom:          m.nom,
    profession:   m.profession   || null,
    ville:        m.ville        || null,
    pays:         m.pays         || null,
    email:        m.email        || null,
    telephone:    m.telephone    || null,
    anniversaire: m.anniversaire || null,
    role:         m.role         || null,
    bureau:       m.bureau       || false,
    photo:        m.photo        || null,
    photo_position: m.photoPosition || m.photo_position || null,
    status:       m.status       || "validated",
    submitted_at: m.submittedAt  || m.submitted_at || new Date().toISOString(),
  };
}

export function useMemberStore() {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("nom");

    if (error || !data?.length) {
      setMembers(staticMembers.map(m => ({ ...m, status: "validated" })));
      setIsSeeded(false);
    } else {
      setMembers(data.map(rowToMember));
      setIsSeeded(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("members-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [load]);

  const allMembers     = useMemo(() => members.filter(m => m.status === "validated"), [members]);
  const pendingMembers = useMemo(() => members.filter(m => m.status === "pending"),   [members]);

  async function updateMember(member, data) {
    setSaving(true);
    if (isSeeded) {
      const { error } = await supabase
        .from("members")
        .update({ ...memberToRow({ ...member, ...data }), updated_at: new Date().toISOString() })
        .eq("id", String(member.id));
      if (error) { toast.error("Erreur mise à jour : " + error.message); setSaving(false); return; }
      await load();
    }
    setSaving(false);
  }

  async function validateMember(member) {
    setSaving(true);
    if (isSeeded) {
      const { error } = await supabase
        .from("members")
        .update({ status: "validated", updated_at: new Date().toISOString() })
        .eq("id", String(member.id));
      if (error) { toast.error("Erreur validation : " + error.message); setSaving(false); return; }
      toast.success(`${member.nom} validé !`);
      await load();
    }
    setSaving(false);
  }

  async function rejectMember(id) {
    setSaving(true);
    if (isSeeded) {
      const { error } = await supabase.from("members").delete().eq("id", String(id));
      if (error) { toast.error("Erreur rejet : " + error.message); setSaving(false); return; }
      toast.success("Demande rejetée.");
      await load();
    }
    setSaving(false);
  }

  async function deleteMember(id) {
    setSaving(true);
    if (isSeeded) {
      const { error } = await supabase.from("members").delete().eq("id", String(id));
      if (error) { toast.error("Erreur suppression : " + error.message); setSaving(false); return; }
      toast.success("Membre supprimé.");
      await load();
    }
    setSaving(false);
  }

  async function addPending(member) {
    const row = {
      ...memberToRow(member),
      id: String(member.id || Date.now()),
      bureau: false,
      status: "pending",
      photo: member.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=064e3b&color=6ee7b7&size=200`,
    };
    if (isSeeded) {
      setSaving(true);
      const { error } = await supabase.from("members").insert(row);
      if (error) toast.error("Erreur inscription : " + error.message);
      else await load();
      setSaving(false);
    }
    return rowToMember(row);
  }

  async function addValidated(member) {
    const row = {
      ...memberToRow(member),
      id: String(member.id || Date.now()),
      status: "validated",
      photo: member.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=064e3b&color=6ee7b7&size=200`,
    };
    if (isSeeded) {
      setSaving(true);
      const { error } = await supabase.from("members").insert(row);
      if (error) { toast.error("Erreur ajout membre : " + error.message); setSaving(false); return rowToMember(row); }
      await load();
      setSaving(false);
    }
    return rowToMember(row);
  }

  async function seedFromStatic() {
    setSaving(true);
    const { error } = await supabase
      .from("members")
      .upsert(
        staticMembers.map(m => memberToRow({ ...m, status: "validated" })),
        { onConflict: "id" }
      );
    if (error) toast.error("Erreur migration : " + error.message);
    else { toast.success(`${staticMembers.length} membres migrés avec succès !`); await load(); }
    setSaving(false);
  }

  async function migrateFromOldStore() {
    setSaving(true);
    const oldValidated = await sbGet("mbp_validated_members") || [];
    const oldPending   = await sbGet("mbp_pending_members")   || [];
    const all = [
      ...oldValidated.map(m => memberToRow({ ...m, status: "validated" })),
      ...oldPending.map(m => memberToRow({ ...m, status: "pending" })),
    ];
    if (!all.length) {
      toast.info("Aucun membre trouvé dans l'ancien système.");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("members")
      .upsert(all, { onConflict: "id" });
    if (error) toast.error("Erreur récupération anciens membres : " + error.message);
    else { toast.success(`${all.length} anciens membres récupérés !`); await load(); }
    setSaving(false);
  }

  return {
    allMembers,
    pendingMembers,
    validatedMembers: allMembers,
    overrides: {},
    updateMember,
    validateMember,
    rejectMember,
    deleteMember,
    addPending,
    addValidated,
    loading,
    saving,
    isSeeded,
    seedFromStatic,
    migrateFromOldStore,
    reload: load,
  };
}
