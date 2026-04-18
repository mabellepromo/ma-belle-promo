import { useState, useEffect } from "react";
import { sbGet, sbSet } from "./supabase";

const PREFIX = "mbp_store_";
const EVENT  = "mbp-store";

/**
 * Fusionne les données stockées avec les données statiques.
 * - Champs vides dans le stockage → remplis par les données statiques
 * - Modifications de l'admin → conservées
 * - Nouveaux items statiques → ajoutés automatiquement
 */
function mergeWithStatic(stored, fallback) {
  if (!Array.isArray(stored) || !Array.isArray(fallback)) return stored;
  const result = fallback.map(staticItem => {
    const storedItem = stored.find(s => String(s.id) === String(staticItem.id));
    if (!storedItem) return staticItem;
    const merged = { ...storedItem };
    for (const [k, v] of Object.entries(staticItem)) {
      const cur = merged[k];
      const isEmpty = cur === "" || cur === null || cur === undefined ||
        (Array.isArray(cur) && cur.length === 0 && Array.isArray(v) && v.length > 0);
      if (isEmpty) merged[k] = v;
    }
    return merged;
  });
  const staticIds = new Set(fallback.map(s => String(s.id)));
  stored.filter(s => !staticIds.has(String(s.id))).forEach(s => result.push(s));
  return result;
}

function cacheGet(key) {
  try { const d = localStorage.getItem(PREFIX + key); return d ? JSON.parse(d) : null; }
  catch { return null; }
}

function cacheSet(key, data) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch {}
}

export const localStore = {
  get(key) { return cacheGet(key); },

  set(key, data) {
    // 1. Écriture locale immédiate (cache + événement)
    cacheSet(key, data);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    // 2. Sync Supabase en arrière-plan (visible par tous)
    sbSet(PREFIX + key, data);
  },

  getOrDefault(key, fallback) {
    const stored = cacheGet(key);
    if (stored !== null) {
      const merged = mergeWithStatic(stored, fallback);
      // localStorage uniquement — jamais Supabase (évite d'écraser les saves useCrud)
      if (JSON.stringify(merged) !== JSON.stringify(stored)) cacheSet(key, merged);
      return merged;
    }
    cacheSet(key, fallback);
    return fallback;
  },
};

export function useContent(key, staticData) {
  // Initialisation synchrone depuis le cache localStorage — évite le flash des données statiques
  const [data, setData] = useState(() => {
    const cached = cacheGet(key);
    return cached ? mergeWithStatic(cached, staticData) : staticData;
  });

  useEffect(() => {
    sbGet(PREFIX + key).then(remote => {
      if (remote !== null) {
        const merged = mergeWithStatic(remote, staticData);
        setData(merged);
        cacheSet(key, merged);
      } else {
        setData(staticData);
      }
    });
  }, [key]);

  return data;
}

export function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
