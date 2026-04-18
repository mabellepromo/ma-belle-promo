/**
 * memberStore.js — Source unique de vérité pour les membres MBP
 * Persistance synchrone en localStorage (cache) + Supabase (source de vérité partagée).
 */
import { useState, useEffect, useMemo } from "react";
import { members as staticMembers } from "../data/members.js";
import { sbGet, sbSet, sbSubscribe } from "./supabase";

export const STORAGE_PENDING   = "mbp_pending_members";
export const STORAGE_VALIDATED = "mbp_validated_members";
export const STORAGE_OVERRIDES = "mbp_member_overrides";
export const STORAGE_DELETED   = "mbp_deleted_members"; // IDs des membres statiques supprimés

const EVENT = "mbp-members";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function persist(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    sbSet(key, data); // Sync Supabase en arrière-plan
  } catch (e) {
    console.error("memberStore write error:", e);
  }
}

export function useMemberStore() {
  const [validated, setValidated] = useState(() => load(STORAGE_VALIDATED, []));
  const [pending,   setPending]   = useState(() => load(STORAGE_PENDING,   []));
  const [overrides, setOverrides] = useState(() => load(STORAGE_OVERRIDES, {}));
  const [deleted,   setDeleted]   = useState(() => load(STORAGE_DELETED,   [])); // IDs statiques supprimés

  // Au montage : charger depuis Supabase pour avoir les données de tous les navigateurs
  useEffect(() => {
    Promise.all([
      sbGet(STORAGE_VALIDATED),
      sbGet(STORAGE_PENDING),
      sbGet(STORAGE_OVERRIDES),
      sbGet(STORAGE_DELETED),
    ]).then(([remoteV, remoteP, remoteO, remoteD]) => {
      if (remoteV) { localStorage.setItem(STORAGE_VALIDATED, JSON.stringify(remoteV)); setValidated(remoteV); }
      if (remoteP) { localStorage.setItem(STORAGE_PENDING,   JSON.stringify(remoteP)); setPending(remoteP); }
      if (remoteO) { localStorage.setItem(STORAGE_OVERRIDES, JSON.stringify(remoteO)); setOverrides(remoteO); }
      if (remoteD) { localStorage.setItem(STORAGE_DELETED,   JSON.stringify(remoteD)); setDeleted(remoteD); }
    });

    const unsubV = sbSubscribe(STORAGE_VALIDATED, v => { localStorage.setItem(STORAGE_VALIDATED, JSON.stringify(v)); setValidated(v); });
    const unsubP = sbSubscribe(STORAGE_PENDING,   p => { localStorage.setItem(STORAGE_PENDING,   JSON.stringify(p)); setPending(p); });
    const unsubO = sbSubscribe(STORAGE_OVERRIDES, o => { localStorage.setItem(STORAGE_OVERRIDES, JSON.stringify(o)); setOverrides(o); });
    const unsubD = sbSubscribe(STORAGE_DELETED,   d => { localStorage.setItem(STORAGE_DELETED,   JSON.stringify(d)); setDeleted(d); });

    const handler = (e) => {
      if (e.detail === STORAGE_VALIDATED) setValidated(load(STORAGE_VALIDATED, []));
      if (e.detail === STORAGE_PENDING)   setPending(load(STORAGE_PENDING, []));
      if (e.detail === STORAGE_OVERRIDES) setOverrides(load(STORAGE_OVERRIDES, {}));
      if (e.detail === STORAGE_DELETED)   setDeleted(load(STORAGE_DELETED, []));
    };
    window.addEventListener(EVENT, handler);

    return () => {
      unsubV(); unsubP(); unsubO(); unsubD();
      window.removeEventListener(EVENT, handler);
    };
  }, []);

  // Liste complète : statiques (non supprimés) + validés, avec overrides
  const allMembers = useMemo(() => {
    const deletedSet = new Set(deleted.map(id => String(id)));
    return [...staticMembers.filter(m => !deletedSet.has(String(m.id))), ...validated].map(m => ({
      ...m,
      ...(overrides[m.id] || overrides[m.email] || {}),
    }));
  }, [validated, overrides, deleted]);

  function updateMember(member, data) {
    const newOverrides = { ...overrides, [member.id]: { ...(overrides[member.id] || {}), ...data } };
    setOverrides(newOverrides);
    persist(STORAGE_OVERRIDES, newOverrides);
    if (member.status === "validated") {
      const newValidated = validated.map(m => m.id === member.id ? { ...m, ...data } : m);
      setValidated(newValidated);
      persist(STORAGE_VALIDATED, newValidated);
    }
  }

  function validateMember(member) {
    const newMember    = { ...member, status: "validated" };
    const newValidated = [...validated, newMember];
    const newPending   = pending.filter(m => m.id !== member.id);
    setValidated(newValidated); persist(STORAGE_VALIDATED, newValidated);
    setPending(newPending);     persist(STORAGE_PENDING,   newPending);
  }

  function rejectMember(id) {
    const newPending = pending.filter(m => m.id !== id);
    setPending(newPending);
    persist(STORAGE_PENDING, newPending);
  }

  function deleteMember(id) {
    const isStatic = staticMembers.some(m => String(m.id) === String(id));
    if (isStatic) {
      // Membre statique : ajouter son ID à la liste des supprimés
      const newDeleted = [...deleted, id];
      setDeleted(newDeleted);
      persist(STORAGE_DELETED, newDeleted);
    } else {
      // Membre validé : retirer de la liste
      const newValidated = validated.filter(m => String(m.id) !== String(id));
      setValidated(newValidated);
      persist(STORAGE_VALIDATED, newValidated);
    }
    // Nettoyer les overrides dans tous les cas
    const newOverrides = { ...overrides };
    delete newOverrides[id];
    setOverrides(newOverrides);
    persist(STORAGE_OVERRIDES, newOverrides);
  }

  function addPending(member) {
    const newMember = {
      ...member,
      id: member.id || Date.now(),
      bureau: false,
      status: "pending",
      submittedAt: new Date().toISOString(),
      photo: member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=064e3b&color=6ee7b7&size=200`,
    };
    const newPending = [...pending, newMember];
    setPending(newPending);
    persist(STORAGE_PENDING, newPending);
    return newMember;
  }

  function addValidated(member) {
    const newMember = {
      ...member,
      id: member.id || Date.now(),
      bureau: member.bureau || false,
      status: "validated",
      submittedAt: member.submittedAt || new Date().toISOString(),
      photo: member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=064e3b&color=6ee7b7&size=200`,
    };
    const newValidated = [...validated, newMember];
    setValidated(newValidated);
    persist(STORAGE_VALIDATED, newValidated);
    return newMember;
  }

  return {
    allMembers, pendingMembers: pending, validatedMembers: validated, overrides,
    updateMember, validateMember, rejectMember, deleteMember, addPending, addValidated,
  };
}
