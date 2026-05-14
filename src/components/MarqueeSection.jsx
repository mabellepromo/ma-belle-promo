/* Ruban défilant — CSS pur, deux rangées en sens opposés */

import { Link } from "react-router-dom";

const BG = "var(--brand-dark-mid)";
const LIGHT = "hsl(150,30%,7%)";

const MARQUEE_CSS = `
  @keyframes marquee-left {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes marquee-right {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }
  .mq-left  { animation: marquee-left  28s linear infinite; }
  .mq-right { animation: marquee-right 36s linear infinite; }
  .mq-left:hover,
  .mq-right:hover { animation-play-state: paused; }
  .mq-pill {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 3px 13px;
    font-family: Lato, sans-serif;
    text-decoration: none;
    transition: color 0.2s;
    color: rgba(167,243,208,0.75);
  }
  .mq-pill:hover {
    color: #a7f3d0;
  }
`;

/* Tous les items sont des liens — internes { to } ou externes { href } */
const ROW1 = [
  { label: "Notre Credo",        to: "/association/credo" },
  { label: "Notre Ambition",     to: "/association/ambition" },
  { label: "Notre Équipe",       to: "/association/equipe" },
  { label: "Nos Partenaires",    to: "/association/sponsors" },
  { label: "Événements",         to: "/activites/evenements" },
  { label: "Nos Projets",        to: "/activites/projets" },
  { label: "Nos Programmes",     to: "/activites/programmes" },
  { label: 'Programme "Passerelles" ↗', styledLabel: <>Programme <span style={{ color: "#f97316" }}>"Passerelles"</span> ↗</>, href: "https://passerelles.vercel.app" },
];

const ROW2 = [
  { label: "Adhésion",           to: "/implications/adhesion" },
  { label: "Cotisation",         to: "/implications/cotisation" },
  { label: "Nous Soutenir",      to: "/implications/soutenir" },
  { label: "Faire un Don",       to: "/don" },
  { label: "Actualités",         to: "/informations/actualites" },
  { label: "Médiathèque",        to: "/informations/mediatheque" },
  { label: "Documents",          to: "/informations/documents" },
  { label: "Communiqués",        to: "/informations/communiques" },
  { label: "Annuaire",           to: "/annuaire" },
  { label: "Contacts",           to: "/informations/contacts" },
];

function Item({ item, gem, gemColor }) {
  const isExternal = Boolean(item.href);
  const content = item.styledLabel ?? item.label;

  return (
    <span style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 6px" }}>
      {isExternal ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="mq-pill">
          {content}
        </a>
      ) : (
        <Link to={item.to} className="mq-pill">
          {content}
        </Link>
      )}
      <span style={{ color: gemColor, fontSize: 6, opacity: 0.55, marginLeft: 6 }}>{gem}</span>
    </span>
  );
}

function Row({ items, cls, gem, gemColor }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", display: "flex" }}>
      <div className={cls} style={{ display: "flex", alignItems: "center", width: "max-content", willChange: "transform" }}>
        {doubled.map((item, i) => (
          <Item key={i} item={item} gem={gem} gemColor={gemColor} />
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection() {
  return (
    <div style={{ background: BG, position: "relative", overflow: "hidden", padding: "10px 0" }}>
      <style>{MARQUEE_CSS}</style>

      {/* Fade haut — fondu depuis le bas sombre du Hero */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 28, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to bottom, ${BG}, transparent)`,
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

      {/* Rangée 1 — gauche */}
      <Row cls="mq-left"  items={ROW1} gem="◆" gemColor="rgba(251,191,36,0.40)" />

      {/* Filet séparateur */}
      <div style={{ height: 1, margin: "7px 0", background: "rgba(251,191,36,0.10)" }} />

      {/* Rangée 2 — droite */}
      <Row cls="mq-right" items={ROW2} gem="◆" gemColor="rgba(251,191,36,0.40)" />

      {/* Fade bas */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 28, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to top, ${LIGHT}, transparent)`,
      }} />
    </div>
  );
}
