/* Ruban défilant — CSS pur, deux rangées en sens opposés */

import { Link } from "react-router-dom";

const BG = "var(--brand-dark-mid)";
const LIGHT = "hsl(150,10%,97%)";

const MARQUEE_CSS = `
  @keyframes marquee-left {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes marquee-right {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }
  .mq-left  { animation: marquee-left  32s linear infinite; }
  .mq-right { animation: marquee-right 44s linear infinite; }
  .mq-left:hover,
  .mq-right:hover { animation-play-state: paused; }
`;

/* Items simples : juste un label texte
   Items cliquables internes  : { label, to }  — React Router Link
   Items cliquables externes  : { label, href } — <a target="_blank"> */
const ROW1 = [
  { label: "Adhésion", to: "/implications/adhesion" },
  "Ma Belle Promo",
  { label: "Événements", to: "/activites/evenements" },
  "Amitié · Solidarité",
  { label: "Actualités", to: "/informations/actualites" },
  "Promotion 1994–2000",
  { label: "Nos Projets", to: "/activites/projets" },
  "FDD · Lomé · Togo",
];

const ROW2 = [
  { label: "Programme Passerelles", href: "https://passerelles.vercel.app" },
  "48 Membres",
  { label: "Faire un don", to: "/implications/soutenir" },
  "Excellence Juridique",
  { label: "Annuaire des membres", to: "/annuaire" },
  "Récépissé N°0920",
  { label: "Nous contacter", to: "/informations/contacts" },
  "Université de Lomé",
];

const textStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  padding: "0 14px",
  fontFamily: "Lato, sans-serif",
  textDecoration: "none",
  transition: "color 0.2s",
};

function Item({ item, gemColor, gem }) {
  const label = typeof item === "string" ? item : item.label;

  const isInternal = typeof item === "object" && item.to;
  const isExternal = typeof item === "object" && item.href;

  const linkStyle = { ...textStyle, color: "#34d399" };

  return (
    <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {isInternal ? (
        <Link
          to={item.to}
          style={linkStyle}
          onMouseEnter={e => e.currentTarget.style.color = "#6ee7b7"}
          onMouseLeave={e => e.currentTarget.style.color = "#34d399"}
        >
          {label}
        </Link>
      ) : isExternal ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseEnter={e => e.currentTarget.style.color = "#6ee7b7"}
          onMouseLeave={e => e.currentTarget.style.color = "#34d399"}
        >
          {label}
        </a>
      ) : (
        <span style={{ ...textStyle, color: "rgba(255,255,255,0.62)" }}>
          {label}
        </span>
      )}
      <span style={{ color: gemColor, fontSize: 7, opacity: 0.80 }}>{gem}</span>
    </span>
  );
}

function Row({ items, cls, gem, gemColor }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", display: "flex" }}>
      <div className={cls} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
        {doubled.map((item, i) => (
          <Item key={i} item={item} gem={gem} gemColor={gemColor} />
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection() {
  return (
    <div style={{ background: BG, position: "relative", overflow: "hidden", padding: "12px 0" }}>
      <style>{MARQUEE_CSS}</style>

      {/* Fade haut */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 28, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to bottom, ${LIGHT}, transparent)`,
      }} />

      {/* Fade gauche + droit */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 96, zIndex: 3, pointerEvents: "none",
        background: `linear-gradient(to right, ${BG}, transparent)`,
      }} />
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 96, zIndex: 3, pointerEvents: "none",
        background: `linear-gradient(to left, ${BG}, transparent)`,
      }} />

      {/* Rangée 1 — gauche, losanges or */}
      <Row cls="mq-left"  items={ROW1} gem="◆" gemColor="#fbbf24" />

      {/* Filet séparateur */}
      <div style={{ height: 1, margin: "8px 0", background: "rgba(52,211,153,0.10)" }} />

      {/* Rangée 2 — droite, losanges verts */}
      <Row cls="mq-right" items={ROW2} gem="◆" gemColor="#34d399" />

      {/* Fade bas */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 28, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to top, ${LIGHT}, transparent)`,
      }} />
    </div>
  );
}
