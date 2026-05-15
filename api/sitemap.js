// Vercel serverless — sitemap dynamique fusionnant pages statiques + articles + projets Supabase

const BASE = "https://www.mabellepromo.org";

const STATIC = [
  { path: "/",                                  freq: "weekly",  priority: "1.0" },
  { path: "/association/credo",                  freq: "monthly", priority: "0.8" },
  { path: "/association/ambition",               freq: "monthly", priority: "0.8" },
  { path: "/association/equipe",                 freq: "monthly", priority: "0.8" },
  { path: "/association/sponsors",               freq: "monthly", priority: "0.6" },
  { path: "/activites/evenements",               freq: "weekly",  priority: "0.9" },
  { path: "/activites/projets",                  freq: "weekly",  priority: "0.9" },
  { path: "/activites/programmes",               freq: "monthly", priority: "0.7" },
  { path: "/implications/adhesion",              freq: "monthly", priority: "0.9" },
  { path: "/implications/cotisation",            freq: "monthly", priority: "0.7" },
  { path: "/implications/soutenir",              freq: "monthly", priority: "0.9" },
  { path: "/informations/actualites",            freq: "daily",   priority: "0.9" },
  { path: "/informations/contacts",              freq: "monthly", priority: "0.7" },
  { path: "/informations/communiques",           freq: "weekly",  priority: "0.7" },
  { path: "/don",                                freq: "monthly", priority: "0.8" },
  { path: "/galeries",                           freq: "weekly",  priority: "0.6" },
];

function url(path, lastmod, freq, priority) {
  const parts = [`<loc>${BASE}${path}</loc>`];
  if (lastmod) parts.push(`<lastmod>${lastmod.slice(0, 10)}</lastmod>`);
  parts.push(`<changefreq>${freq}</changefreq>`);
  parts.push(`<priority>${priority}</priority>`);
  return `<url>${parts.join("")}</url>`;
}

export default async function handler(req, res) {
  const supabaseUrl  = process.env.VITE_SUPABASE_URL;
  const supabaseKey  = process.env.VITE_SUPABASE_ANON_KEY;

  const headers = { "Content-Type": "application/xml; charset=utf-8" };

  let articles = [];
  let projets  = [];

  if (supabaseUrl && supabaseKey) {
    const base = `${supabaseUrl}/rest/v1`;
    const opts = { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } };

    const [artRes, projRes] = await Promise.allSettled([
      fetch(`${base}/articles?select=id,date_iso,date&order=date_iso.desc`, opts),
      fetch(`${base}/projets?select=id,updated_at&order=updated_at.desc`, opts),
    ]);

    if (artRes.status === "fulfilled" && artRes.value.ok) {
      articles = await artRes.value.json();
    }
    if (projRes.status === "fulfilled" && projRes.value.ok) {
      projets = await projRes.value.json();
    }
  }

  const staticUrls  = STATIC.map(s => url(s.path, null, s.freq, s.priority));
  const articleUrls = articles.map(a => url(
    `/actualites/${a.id}`,
    a.date_iso || null,
    "monthly",
    "0.7"
  ));
  const projetUrls  = projets.map(p => url(
    `/activites/projets/${p.id}`,
    p.updated_at || null,
    "monthly",
    "0.7"
  ));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...articleUrls,
    ...projetUrls,
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
