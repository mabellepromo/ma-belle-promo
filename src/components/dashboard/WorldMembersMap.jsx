import { Component, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Globe } from "lucide-react";

// Recalcule la taille de la carte une fois la mise en page stabilisée.
// Sans ça, Leaflet s'initialise parfois sur un conteneur de taille 0 (surtout
// sur mobile / dans une zone qui défile) et n'affiche que du vide.
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 250);
    window.addEventListener("resize", fix);
    return () => { clearTimeout(t); window.removeEventListener("resize", fix); };
  }, [map]);
  return null;
}

/*
 * Carte mondiale interactive des membres (remplace les barres « Répartition géographique »).
 * - Tuiles CartoDB Voyager : gratuites, sans clé API. Fond clair avec frontières et noms
 *   de pays nets → on distingue clairement chaque pays.
 * - Un cercle ambre (#f0a030) par pays, contour foncé pour bien ressortir sur le fond clair,
 *   rayon ∝ √(effectif) pour éviter qu'un gros pays n'écrase visuellement les autres.
 * - Fallback automatique vers les barres si Leaflet échoue à charger (ErrorBoundary interne).
 */

// Centroïdes approximatifs des pays présents en base. Les pays absents de cette table
// restent comptés dans la légende mais ne sont pas tracés sur la carte.
const COUNTRY_COORDS = {
  "togo":      [8.6195, 0.8248],
  "benin":     [9.3077, 2.3158],
  "senegal":   [14.4974, -14.4524],
  "usa":       [39.8283, -98.5795],
  "etats-unis":[39.8283, -98.5795],
  "canada":    [56.1304, -106.3468],
  "france":    [46.2276, 2.2137],
  "allemagne": [51.1657, 10.4515],
  "suisse":    [46.8182, 8.2275],
  "rca":       [6.6111, 20.9394],
  "centrafrique": [6.6111, 20.9394],
  "cote d'ivoire": [7.5400, -5.5471],
  "ghana":     [7.9465, -1.0232],
  "nigeria":   [9.0820, 8.6753],
  "belgique":  [50.5039, 4.4699],
  "gabon":     [-0.8037, 11.6094],
  "maroc":     [31.7917, -7.0926],
  // Royaume-Uni : la base stocke « United Kingdom », mais on couvre aussi les
  // variantes françaises saisies à la main (normalizePays transforme les tirets en espaces).
  "united kingdom":  [54.0000, -2.0000],
  "royaume uni":     [54.0000, -2.0000],
  "angleterre":      [54.0000, -2.0000],
  "uk":              [54.0000, -2.0000],
  "grande bretagne": [54.0000, -2.0000],
};

// Normalise un nom de pays saisi à la main (accents, casse, espaces/tirets parasites)
function normalizePays(pays) {
  return (pays || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z' ]/g, " ")   // retire chiffres, tirets parasites (« Sénégal - »)
    .replace(/\s+/g, " ")
    .trim();
}

// Couleurs barres de secours (réplique du bloc d'origine, fond cyan)
function GeoBars({ data }) {
  return (
    <div className="space-y-2.5">
      {data.map(({ pays, count, pct }) => (
        <div key={pays}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-foreground truncate">{pays}</span>
            <span className="text-muted-foreground ml-2 flex-shrink-0">{count} ({pct}%)</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ErrorBoundary : si react-leaflet/leaflet plante, on retombe sur les barres
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function WorldMembersMap({ data = [] }) {
  // Associe chaque pays à ses coordonnées (ceux sans correspondance ne sont pas tracés)
  const markers = useMemo(() => {
    return data
      .map(d => {
        const coords = COUNTRY_COORDS[normalizePays(d.pays)];
        return coords ? { ...d, coords } : null;
      })
      .filter(Boolean);
  }, [data]);

  const maxCount = useMemo(
    () => Math.max(1, ...data.map(d => d.count)),
    [data]
  );

  // Rayon proportionnel à la racine carrée de l'effectif (8 → 28 px)
  const radiusFor = (count) => 8 + 20 * Math.sqrt(count / maxCount);

  const bars = <GeoBars data={data} />;

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Données insuffisantes</p>;
  }

  return (
    <MapErrorBoundary fallback={bars}>
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: 320 }}>
        <MapContainer
          center={[15, 5]}
          zoom={1}
          minZoom={1}
          maxZoom={6}
          scrollWheelZoom={false}
          worldCopyJump
          style={{ height: "100%", width: "100%", background: "#e8e4dc" }}
          attributionControl={false}
        >
          <InvalidateSizeOnMount />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          {markers.map(m => (
            <CircleMarker
              key={m.pays}
              center={m.coords}
              radius={radiusFor(m.count)}
              pathOptions={{
                color: "#92400e",
                weight: 2,
                fillColor: "#f0a030",
                fillOpacity: 0.85,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <span className="font-semibold">{m.pays}</span> — {m.count} membre{m.count > 1 ? "s" : ""} ({m.pct}%)
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Légende texte (accessibilité WCAG + secours visuel) */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {data.map(d => (
          <div key={d.pays} className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3 h-3 text-[#f0a030] flex-shrink-0" />
            <span className="font-medium text-foreground">{d.pays}</span>
            <span className="text-muted-foreground">{d.count} ({d.pct}%)</span>
          </div>
        ))}
      </div>
    </MapErrorBoundary>
  );
}
