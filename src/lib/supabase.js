import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TABLE = "mbp_store";

/** Lire une valeur depuis Supabase */
export async function sbGet(key) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data?.value ?? null;
  } catch {
    return null;
  }
}

/** Écrire une valeur dans Supabase — lance une erreur en cas d'échec */
export async function sbSet(key, value) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

/** Uploader un fichier dans Supabase Storage (bucket mbp-media) */
async function uploadToStorage(file, folder) {
  const ext = file.name.split(".").pop().toLowerCase();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("mbp-media")
    .upload(filename, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("mbp-media").getPublicUrl(filename);
  return publicUrl;
}

/** Uploader une image dans Supabase Storage */
export async function uploadImage(file) {
  return uploadToStorage(file, "images");
}

/** Uploader un fichier vidéo dans Supabase Storage */
export async function uploadVideo(file) {
  return uploadToStorage(file, "videos");
}

/** S'abonner aux changements d'une clé en temps réel */
export function sbSubscribe(key, callback) {
  const channel = supabase
    .channel(`mbp-${key}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE, filter: `key=eq.${key}` },
      (payload) => { if (payload.new?.value !== undefined) callback(payload.new.value); }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
