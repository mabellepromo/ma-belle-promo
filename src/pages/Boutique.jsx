import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Download, Package, Zap, Shield,
  Tag, ChevronRight, Sparkles, Heart, BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import SEO from "../components/SEO";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const fmt = (n) => n.toLocaleString("fr-FR") + " FCFA";

/* ── Catalogue produits ─────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "f1", cat: "Formations", emoji: "⚖️",
    imgBg: "linear-gradient(135deg,#064e3b 0%,#065f46 55%,#0f766e 100%)",
    badge: "Bestseller", badgeColor: "#fbbf24",
    name: "Droit des Affaires en Afrique Francophone",
    desc: "12 modules vidéo HD · PDF & ressources · Certificat MBP",
    price: 35000, original: 45000, digital: true,
    rating: 4.8, reviews: 47, level: "Intermédiaire",
    tags: ["8h de contenu", "Certificat inclus"],
    featured: true,
  },
  {
    id: "f2", cat: "Formations", emoji: "📊",
    imgBg: "linear-gradient(135deg,#1e3a5f 0%,#1e40af 55%,#1d4ed8 100%)",
    badge: "Nouveau", badgeColor: "#34d399",
    name: "Fiscalité Internationale : Enjeux Africains",
    desc: "Webinaire enregistré · Quiz final · Accès à vie",
    price: 15000, original: null, digital: true,
    rating: 4.6, reviews: 23, level: "Avancé",
    tags: ["3h de contenu", "Quiz final"],
  },
  {
    id: "f3", cat: "Formations", emoji: "🏆",
    imgBg: "linear-gradient(135deg,#3b0764 0%,#6d28d9 55%,#7c3aed 100%)",
    badge: "Pack -37%", badgeColor: "#f97316",
    name: "Pack Juriste Pro 2026",
    desc: "Accès à toutes nos formations · 12 mois · Mises à jour",
    price: 75000, original: 120000, digital: true,
    rating: 4.9, reviews: 12, level: "Tous niveaux",
    tags: ["25h de contenu", "Accès 12 mois"],
  },
  {
    id: "p1", cat: "Boutique MBP", emoji: "👕",
    imgBg: "linear-gradient(135deg,#1a2e1a 0%,#166534 55%,#15803d 100%)",
    badge: null, badgeColor: null,
    name: "T-shirt Ma Belle Promo — Édition 2026",
    desc: "100% coton bio · Logo brodé · Coupe premium unisexe",
    price: 8500, original: null, digital: false, stock: 14,
    rating: 4.7, reviews: 31,
    tags: ["Livraison Togo & diaspora"],
  },
  {
    id: "p2", cat: "Boutique MBP", emoji: "☕",
    imgBg: "linear-gradient(135deg,#422006 0%,#92400e 55%,#b45309 100%)",
    badge: "Promo -20%", badgeColor: "#f97316",
    name: "Mug FDD Lomé — Logo Doré",
    desc: "Porcelaine · Lave-vaisselle OK · Boîte cadeau incluse",
    price: 6000, original: 7500, digital: false, stock: 7,
    rating: 4.5, reviews: 18,
    tags: ["Stock limité"],
  },
  {
    id: "p3", cat: "Boutique MBP", emoji: "📓",
    imgBg: "linear-gradient(135deg,#0f2337 0%,#1e3a5f 55%,#1e4976 100%)",
    badge: null, badgeColor: null,
    name: "Carnet de Notes MBP",
    desc: "Couverture rigide · 200 pages · Règle marque-page",
    price: 4500, original: null, digital: false, stock: 22,
    rating: 4.3, reviews: 9,
    tags: ["Livraison disponible"],
  },
  {
    id: "a1", cat: "Art & Design IA", emoji: "🖼️",
    imgBg: "linear-gradient(135deg,#1a0533 0%,#4c1d95 55%,#7c3aed 100%)",
    badge: "Exclusif — 3 ex.", badgeColor: "#f43f5e",
    name: "Portrait Juridique — Collection FDD",
    desc: "Impression A3 HD · Signé numériquement · Livraison encadrée",
    price: 25000, original: null, digital: false, stock: 3,
    rating: 5.0, reviews: 6,
    tags: ["Édition limitée", "Signé"],
  },
  {
    id: "a2", cat: "Art & Design IA", emoji: "🎨",
    imgBg: "linear-gradient(135deg,#0f172a 0%,#312e81 55%,#4338ca 100%)",
    badge: "Téléchargement", badgeColor: "#06b6d4",
    name: "Affiche Nuit du Droit 2025",
    desc: "Fichier HD 4K · Usage personnel · Livraison immédiate",
    price: 5000, original: null, digital: true,
    rating: 4.8, reviews: 14,
    tags: ["Téléchargement immédiat"],
  },
  {
    id: "a3", cat: "Art & Design IA", emoji: "✨",
    imgBg: "linear-gradient(135deg,#0c1a2e 0%,#1e3a5f 55%,#1e4976 100%)",
    badge: "Série IA", badgeColor: "#22d3ee",
    name: "Collection Portraits — 5 illustrations",
    desc: "5 œuvres IA uniques · FDD Lomé · Fichiers HD + impression",
    price: 18000, original: null, digital: false, stock: 8,
    rating: 4.9, reviews: 4,
    tags: ["5 illustrations", "HD"],
  },
  {
    id: "b1", cat: "Publications", emoji: "📚",
    imgBg: "linear-gradient(135deg,#0c1a2e 0%,#1e3a5f 55%,#1d4ed8 100%)",
    badge: "Nouveau", badgeColor: "#34d399",
    name: "Guide du Juriste Togolais 2026",
    desc: "280 pages · PDF + EPUB · Mis à jour 2026 · Accès à vie",
    price: 18000, original: null, digital: true,
    rating: 4.9, reviews: 28,
    tags: ["PDF + EPUB", "Mis à jour 2026"],
  },
  {
    id: "b2", cat: "Publications", emoji: "📖",
    imgBg: "linear-gradient(135deg,#1c1917 0%,#44403c 55%,#57534e 100%)",
    badge: null, badgeColor: null,
    name: "Recueil Jurisprudence Togo 2025",
    desc: "300+ décisions · Index thématique · Format PDF",
    price: 12000, original: null, digital: true,
    rating: 4.7, reviews: 19,
    tags: ["Format PDF", "300+ décisions"],
  },
];

const CATS = ["Tout", "Formations", "Boutique MBP", "Art & Design IA", "Publications"];

/* ── Stars ──────────────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="w-3 h-3"
          fill={i <= Math.round(rating) ? "#e6b84a" : "none"}
          style={{ color: i <= Math.round(rating) ? "#e6b84a" : "#ddd8ce" }}
        />
      ))}
    </div>
  );
}

/* ── ProductCard ─────────────────────────────────────────────────── */
function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded]         = useState(false);
  const [wished, setWished]       = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    toast.success(`"${product.name.slice(0, 32)}…" ajouté au panier`, { duration: 2200 });
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -5 }}
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.3s, transform 0.3s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(184,134,26,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.07)"; }}
    >
      {/* Visual */}
      <div className="relative h-44 flex items-center justify-center overflow-hidden select-none"
        style={{ background: product.imgBg }}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{product.emoji}</span>

        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black"
            style={{
              background: product.badgeColor,
              color: ["#fbbf24", "#f97316", "#22d3ee"].includes(product.badgeColor) ? "#000" : "#fff",
            }}>
            {product.badge}
          </span>
        )}

        {product.digital && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: "#e6b84a", border: "1px solid rgba(184,134,26,0.35)" }}>
            <Download className="w-2.5 h-2.5" /> Immédiat
          </div>
        )}

        {product.stock != null && product.stock <= 5 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold backdrop-blur-sm"
              style={{ background: "rgba(239,68,68,0.80)", color: "#fff" }}>
              Plus que {product.stock} disponibles !
            </span>
          </div>
        )}

        <button
          onClick={() => setWished(w => !w)}
          className="absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          title="Ajouter aux favoris"
        >
          <Heart className="w-3.5 h-3.5" fill={wished ? "#f43f5e" : "none"} style={{ color: wished ? "#f43f5e" : "rgba(255,255,255,0.50)" }} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "rgba(10,61,40,0.08)", color: "#0a3d28" }}>
            {product.cat}
          </span>
          {product.level && (
            <span className="text-[9px]" style={{ color: "#9a9588" }}>{product.level}</span>
          )}
        </div>

        <h3 className="font-heading font-bold text-sm leading-snug mb-1.5 line-clamp-2" style={{ color: "#1a1a16" }}>{product.name}</h3>
        <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: "#6b6b62" }}>{product.desc}</p>

        {product.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ background: "#f0ede8", color: "#7a7870" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-[10px]" style={{ color: "#9a9588" }}>
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-heading font-bold text-base" style={{ color: "#1a1a16" }}>{fmt(product.price)}</span>
            {product.original && (
              <span className="ml-1.5 text-[11px] line-through" style={{ color: "#b0ada6" }}>
                {fmt(product.original)}
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-250 flex-shrink-0"
            style={{
              background: added ? "linear-gradient(135deg,#b8861a,#e6b84a)" : "rgba(184,134,26,0.12)",
              color: added ? "#fff" : "#e6b84a",
              border: added ? "none" : "1px solid rgba(184,134,26,0.28)",
            }}
          >
            {added ? "✓ Ajouté" : <><ShoppingCart className="w-3.5 h-3.5" /> Ajouter</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Featured banner (bestseller) ─────────────────────────────────── */
function FeaturedProduct({ product }) {
  const { addItem, setIsCartOpen } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative rounded-2xl overflow-hidden mb-10 flex flex-col md:flex-row gap-0"
      style={{
        background: product.imgBg,
        border: "1px solid rgba(184,134,26,0.30)",
        boxShadow: "0 16px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(184,134,26,0.08) inset",
      }}
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 70% at 10% 50%, rgba(184,134,26,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-7 md:p-10 w-full">
        <span className="text-8xl select-none flex-shrink-0">{product.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-black"
              style={{ background: "#fbbf24", color: "#000" }}>
              ⭐ Bestseller
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(184,134,26,0.18)", color: "#e6b84a", border: "1px solid rgba(184,134,26,0.30)" }}>
              {product.cat}
            </span>
            <BadgeCheck className="w-4 h-4" style={{ color: "#e6b84a" }} />
          </div>
          <h2 className="font-heading text-white font-black text-xl md:text-2xl leading-tight mb-2"
            style={{ letterSpacing: "-0.02em" }}>
            {product.name}
          </h2>
          <p className="text-white/55 text-sm mb-4">{product.desc}</p>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="font-heading font-black text-white text-2xl">{fmt(product.price)}</span>
              {product.original && (
                <span className="ml-2 text-sm line-through" style={{ color: "rgba(255,255,255,0.30)" }}>{fmt(product.original)}</span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm"
              style={{
                background: added ? "rgba(184,134,26,0.22)" : "linear-gradient(135deg,#b8861a,#e6b84a)",
                color: added ? "#e6b84a" : "#fff",
              }}>
              {added ? "✓ Ajouté au panier" : <><ShoppingCart className="w-4 h-4" /> Ajouter au panier</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Boutique page ─────────────────────────────────────────────────── */
export default function Boutique() {
  const { count, setIsCartOpen } = useCart();
  const [activeCat, setActiveCat] = useState("Tout");

  const featured  = PRODUCTS.find(p => p.featured);
  const filtered  = (activeCat === "Tout" ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat))
    .filter(p => !p.featured || activeCat !== "Tout");

  return (
    <div className="min-h-screen" style={{ background: "#f5f2ed" }}>
      <SEO
        title="Boutique MBP"
        description="Formations juridiques, produits dérivés MBP, art IA exclusif et publications — la boutique officielle de Ma Belle Promo."
        path="/boutique"
      />
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative pt-24 pb-14 overflow-hidden"
        style={{ background: "linear-gradient(150deg, #0a3d28 0%, #0d2318 60%, #0a1a12 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(230,184,74,0.10) 0%, transparent 70%)" }} />
        <div className="h-px" style={{ background: "linear-gradient(to right, transparent, #0f5c3a 25%, #b8861a 75%, transparent)" }} />

        <div className="max-w-4xl mx-auto px-6 text-center mt-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5"
              style={{ color: "#e6b84a", background: "rgba(184,134,26,0.12)", border: "1px solid rgba(184,134,26,0.30)" }}>
              <Sparkles className="w-3 h-3" /> Boutique officielle — Ma Belle Promo
            </span>
            <h1 className="font-heading font-black text-white leading-tight mb-4"
              style={{ fontSize: "clamp(2rem,5vw,3.2rem)", letterSpacing: "-0.03em" }}>
              Formez-vous.{" "}
              <span style={{ background: "linear-gradient(90deg,#1a7a4e,#b8861a,#e6b84a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Portez nos couleurs.
              </span>
            </h1>
            <p className="text-white/45 text-base max-w-xl mx-auto">
              Formations d'excellence, goodies, art IA et publications — tout ce que MBP crée, pour vous et vos proches.
            </p>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10"
          >
            {[
              { icon: Shield,   label: "Paiement sécurisé",  sub: "6 méthodes disponibles" },
              { icon: Download, label: "Accès immédiat",      sub: "Produits numériques" },
              { icon: Package,  label: "Livraison mondiale",  sub: "Togo & diaspora" },
              { icon: Zap,      label: "Support MBP",         sub: "Réponse sous 24h" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(184,134,26,0.12)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: "#e6b84a" }} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Transition hero → fond clair */}
      <div style={{ height: 40, background: "linear-gradient(to bottom, #0a1a12, #f5f2ed)" }} />

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Featured */}
        {activeCat === "Tout" && featured && <FeaturedProduct product={featured} />}

        {/* Filters + cart button */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {CATS.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCat(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: activeCat === cat ? "#0a3d28" : "#ffffff",
                  color: activeCat === cat ? "#fff" : "#4a4a42",
                  border: activeCat === cat ? "none" : "1px solid rgba(0,0,0,0.10)",
                  boxShadow: activeCat === cat ? "0 2px 10px rgba(10,61,40,0.25)" : "none",
                }}
              >
                {cat}
                {cat !== "Tout" && (
                  <span className="ml-1 opacity-55">
                    {PRODUCTS.filter(p => p.cat === cat).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
            style={{ background: "#0a3d28", color: "#fff", boxShadow: "0 2px 10px rgba(10,61,40,0.25)" }}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Mon panier
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: "#b8861a", color: "#fff", boxShadow: "none" }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Promo newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(184,134,26,0.22)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(251,191,36,0.05) 0%, transparent 70%)" }} />
          <Tag className="w-7 h-7 mx-auto mb-3" style={{ color: "rgba(230,184,74,0.65)" }} />
          <h3 className="font-heading text-xl font-bold mb-2" style={{ color: "#1a1a16" }}>
            -10% sur votre première commande
          </h3>
          <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: "#6b6b62" }}>
            Inscrivez-vous à la newsletter MBP et recevez votre code promo exclusif en retour.
          </p>
          <Link
            to="/#actualites"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#b8861a,#e6b84a)", color: "#fff" }}
          >
            S'inscrire et économiser <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>

      <FooterSection />
    </div>
  );
}
