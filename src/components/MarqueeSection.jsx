/* Ruban défilant — CSS pur, deux rangées en sens opposés */

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
   Items cliquables : { label, to } avec une route React Router */
const ROW1 = [
  { label: "Le programme de mentorat Passerelles a pris son envol", to: "https://passerelles.vercel.app" },
  "Ma Belle Promo",
  "Amitié",
  "Solidarité",
  { label: "Le programme de mentorat Passerelles a pris son envol", to: "https://passerelles.vercel.app" },
  "Faculté de Droit",
  "Lomé · Togo",
  "Promotion 1994–2000",
];

const ROW2 = [
  { label: "45 candidats", to: "https://passerelles.vercel.app" },
  "FDD · Université de Lomé",
  { label: "11 binômes", to: "https://passerelles.vercel.app" },
  "Ensemble pour l'Avenir",
  "Anciens Diplômés",
  { label: "45 candidats", to: "https://passerelles.vercel.app" },
  "48 Membres",
  { label: "11 binômes", to: "https://passerelles.vercel.app" },
  "Récépissé N°0920",
];

function Item({ item, gemColor, gem }) {
  const textStyle = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    padding: "0 14px",
    fontFamily: "Lato, sans-serif",
  };

  const label = typeof item === "string" ? item : item.label;
  const isLink = typeof item === "object" && item.to;

  return (
    <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {isLink ? (
        <a
          href={item.to}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...textStyle,
            color: "#34d399",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
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

      {/* Fade haut — fondu depuis le beige du Hero vers le fond sombre */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 28, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to bottom, ${LIGHT}, transparent)`,
      }} />

      {/* Fade gauche + droit — effet "infini" */}
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

      {/* Fade bas — fondu vers le beige de MissionSection */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 28, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to top, ${LIGHT}, transparent)`,
      }} />
    </div>
  );
}
