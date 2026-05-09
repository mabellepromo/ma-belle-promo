import { Helmet } from "react-helmet-async";

const SITE_NAME = "Ma Belle Promo";
const SITE_URL  = "https://www.mabellepromo.org";
const DEFAULT_IMAGE = "https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png";
const DEFAULT_DESC  = "Association des anciens diplômés de la Faculté de Droit de l'Université de Lomé (promotion 1994-2000). Amitié, solidarité et entraide au Togo et dans la diaspora.";

export default function SEO({ title, description, image = null, path = "", article = false }) {
  const fullTitle  = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc       = description || DEFAULT_DESC;
  const img        = image || DEFAULT_IMAGE;
  const canonical  = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:type"        content={article ? "article" : "website"} />
      <meta property="og:locale"      content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />
    </Helmet>
  );
}
