import { useEffect, useCallback } from "react";

const MOIS_FR = {
  "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5,
  "juillet": 6, "août": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11,
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getNotified() {
  try { return new Set(JSON.parse(localStorage.getItem(`mbp_notified_${todayKey()}`) || "[]")); } catch { return new Set(); }
}

function saveNotified(set) {
  localStorage.setItem(`mbp_notified_${todayKey()}`, JSON.stringify([...set]));
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const result = await Notification.requestPermission();
  return result;
}

export function useNotifications(allMembers, pendingMembers) {
  const notify = useCallback((title, body, tag) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "/Logo%20Redesign1.png", tag });
  }, []);

  // Anniversaires dans les 7 prochains jours
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const notified = getNotified();
    let changed = false;

    (allMembers ?? []).forEach(m => {
      const tag = `anniv_${m.id}`;
      if (notified.has(tag) || !m.anniversaire) return;
      const parts = m.anniversaire.trim().split(" ");
      const jour = parseInt(parts[0]);
      const mois = MOIS_FR[parts.slice(1).join(" ").toLowerCase()];
      if (isNaN(jour) || mois === undefined) return;
      let date = new Date(today.getFullYear(), mois, jour);
      if (date < today) date = new Date(today.getFullYear() + 1, mois, jour);
      const jours = Math.ceil((date - today) / 86400000);
      if (jours <= 7) {
        const body = jours === 0 ? "C'est aujourd'hui !" : jours === 1 ? "C'est demain !" : `Dans ${jours} jours`;
        notify(`🎂 Anniversaire de ${m.nom}`, body, tag);
        notified.add(tag);
        changed = true;
      }
    });

    if (changed) saveNotified(notified);
  }, [allMembers, notify]);

  // Nouvelle demande d'adhésion
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const key = "mbp_pending_count";
    const lastCount = parseInt(localStorage.getItem(key) || "0");
    if (pendingMembers.length > lastCount && lastCount > 0) {
      const latest = pendingMembers[0];
      notify(
        "👤 Nouvelle demande d'adhésion",
        `${latest.nom} souhaite rejoindre Ma Belle Promo`,
        "new-member"
      );
    }
    localStorage.setItem(key, String(pendingMembers.length));
  }, [pendingMembers, notify]);
}
