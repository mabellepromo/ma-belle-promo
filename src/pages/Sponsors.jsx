import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { HandHeart, Building2, Globe, Sparkles } from "lucide-react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

const niveaux = [
  { label: "Partenaire Platine", color: "bg-slate-100 border-slate-300", badge: "💎", desc: "Soutien annuel ≥ 500 000 FCFA" },
  { label: "Partenaire Or",      color: "bg-amber-50 border-amber-200",   badge: "🥇", desc: "Soutien annuel ≥ 200 000 FCFA" },
  { label: "Partenaire Argent",  color: "bg-gray-50 border-gray-200",     badge: "🥈", desc: "Soutien annuel ≥ 100 000 FCFA" },
  { label: "Partenaire Bronze",  color: "bg-orange-50 border-orange-200", badge: "🥉", desc: "Soutien annuel ≥ 50 000 FCFA"  },
];

const avantages = [
  { icon: Globe,      titre: "Visibilité", desc: "Logo sur tous nos supports de communication, site web et réseaux sociaux." },
  { icon: Building2,  titre: "Réseau",     desc: "Accès au réseau exclusif des diplômés juristes de la FDD." },
  { icon: HandHeart,  titre: "Impact",     desc: "Association directe à des actions concrètes au bénéfice des étudiants." },
];

export default function Sponsors() {
  return (
    <div>
      <SEO
        title="Nos Partenaires"
        description="Les partenaires et mécènes de Ma Belle Promo. Rejoignez une aventure humaine authentique au service de l'avenir de l'Afrique."
        path="/association/sponsors"
      />
      <PageHero title="Nos Partenaires" subtitle="L'Association — Partenaires & Mécènes" />

      {/* ── Section éditoriale ── */}
      <section
        style={{
          background: "hsl(40, 25%, 96%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ornement fond */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(ellipse 70% 50% at 80% 50%, rgba(180,140,80,0.07) 0%, transparent 70%)",
        }} />

        <div className="max-w-4xl mx-auto px-6 py-20 relative">

          {/* Ligne ornementale */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ height: 1, marginBottom: 48, transformOrigin: "left",
              background: "linear-gradient(to right, hsl(153,50%,28%) 0%, hsl(38,70%,55%) 50%, transparent 100%)" }}
          />

          {/* Paragraphe 1 */}
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground text-sm leading-relaxed mb-10 text-justify"
          >
            L'association Ma Belle Promo (MBP) n'est pas une association comme les autres. Née en 2018 de la rencontre
            de juristes, cadres et entrepreneurs formés à la Faculté de Droit de
            l'Université de Lomé — promotion 1994–2000 —, elle a très vite choisi de ne pas se replier
            sur elle-même. Certes, nous cultivons l'excellence qui fut notre socle commun : séminaires
            de haut niveau, conférences thématiques,{" "}
            <Link to="/activites/programmes" style={{ color: "hsl(153,50%,28%)", textDecoration: "none", borderBottom: "1px solid hsl(153,50%,28%,0.4)" }}>webinaires</Link>
            {" "}qui font dialoguer expertise juridique
            et réalités africaines contemporaines. Mais nous avons aussi fait le choix d'aller vers la
            communauté, loin des carcans académiques, là où le besoin est réel :{" "}
            <Link to="/activites/projets" style={{ color: "hsl(153,50%,28%)", textDecoration: "none", borderBottom: "1px solid hsl(153,50%,28%,0.4)" }}>projets caritatifs</Link>,
            actions sociales, accompagnement des jeunes à travers notre programme de mentorat{" "}
            <a
              href="https://passerelles.vercel.app"
              target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              Programme <span style={{ color: "hsl(25,90%,40%)", borderBottom: "1px solid hsl(25,90%,40%,0.4)" }}>"Passerelles"</span>
            </a>.
          </motion.p>

          {/* Citation mise en valeur */}
          <motion.blockquote
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            style={{
              borderLeft: "3px solid hsl(38,70%,45%)",
              paddingLeft: 28,
              margin: "40px 0",
            }}
          >
            <p
              className="font-heading italic"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.75rem)", color: "hsl(38,70%,35%)", fontWeight: 600, lineHeight: 1.5 }}
            >
              "Toute ambition qui grandit appelle naturellement
              des alliances à sa hauteur."
            </p>
          </motion.blockquote>

          {/* Paragraphe 2 */}
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="text-muted-foreground text-sm leading-relaxed mb-14"
          >
            Ce qui rend notre démarche singulière, c'est qu'elle a été essentiellement portée jusqu'ici
            par la seule volonté de nos membres — sur leurs ressources propres, sans autre appui que
            leur engagement. Une belle preuve de conviction. Les organisations et entreprises qui
            choisissent de s'associer à Ma Belle Promo ne répondent pas à une sollicitation ordinaire ;
            elles saisissent une opportunité rare : celle d'ancrer leur nom dans une aventure humaine
            authentique, crédible, portée par des femmes et des hommes dont le droit de regard sur
            l'avenir de l'Afrique ne fait aucun doute.
          </motion.p>

          {/* Phrase d'appel finale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            style={{
              background: "rgba(153,50,28,0.04)",
              border: "1px solid hsl(38,50%,75%)",
              borderRadius: 16,
              padding: "24px 32px",
            }}
          >
            <p
              className="font-heading"
              style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)", color: "hsl(150,30%,12%)", fontWeight: 700, lineHeight: 1.55, textAlign: "center" }}
            >
              Être partenaire de Ma Belle Promo, c'est simplement choisir
              de faire partie de cette histoire — et de lui permettre d'aller encore plus loin.
            </p>
          </motion.div>

          {/* Ligne ornementale bas */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 1, ease: "easeOut" }}
            style={{ height: 1, marginTop: 48, transformOrigin: "right",
              background: "linear-gradient(to left, hsl(153,50%,28%) 0%, hsl(38,70%,55%) 50%, transparent 100%)" }}
          />
        </div>
      </section>

      {/* ── Reste de la page ── */}
      <section className="py-20 bg-white dark:bg-card">
      <div className="max-w-5xl mx-auto px-6">

        {/* Emplacements partenaires */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[1,2,3,4,5,6,7,8].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: n * 0.05 }}
              className="h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground/40 text-sm font-medium hover:border-primary/30 hover:text-primary/40 transition-colors"
            >
              Partenaire
            </motion.div>
          ))}
        </div>

        {/* Niveaux de partenariat */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          >
            Niveaux de Partenariat
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {niveaux.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`border-2 rounded-2xl p-4 sm:p-6 text-center ${n.color}`}
              >
                <div className="text-4xl mb-3">{n.badge}</div>
                <h3 className="font-heading font-bold text-foreground mb-1">{n.label}</h3>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Avantages */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-heading text-2xl font-bold text-foreground text-center mb-8"
          >
            Pourquoi nous soutenir ?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {avantages.map((a, i) => (
              <motion.div
                key={a.titre}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5 sm:p-7 text-center hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <a.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{a.titre}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIB */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="mb-10 rounded-2xl overflow-hidden border border-primary/20"
          style={{ background: "linear-gradient(135deg, hsl(150,18%,97%) 0%, hsl(40,20%,97%) 100%)" }}
        >
          {/* En-tête */}
          <div className="px-6 py-4 flex items-center gap-3 border-b border-primary/15"
            style={{ background: "hsl(153,50%,28%)" }}>
            <Building2 className="w-4 h-4 text-white/80 flex-shrink-0" />
            <span className="font-heading font-bold text-sm text-white tracking-wide">Coordonnées bancaires — Virement</span>
          </div>

          {/* Champs principaux */}
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-primary/10">
            {[
              { label: "Titulaire du compte", value: "ASSOCIATION MA BELLE PROMO MBP", mono: false },
              { label: "Établissement bancaire", value: "ECOBANK Togo", mono: false },
              { label: "Code Swift / BIC", value: "ECOCTGTGXXX", mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-1.5">{label}</p>
                <p className={`text-sm font-semibold text-foreground ${mono ? "font-mono tracking-wider" : ""}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* IBAN — mis en avant */}
          <div className="px-5 py-5 border-t border-primary/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-2">Numéro IBAN</p>
            <p className="font-mono font-bold text-foreground tracking-[0.2em] text-base sm:text-lg">
              TG53&nbsp;TG05&nbsp;5017&nbsp;1014&nbsp;1766&nbsp;3880&nbsp;0153
            </p>
          </div>

          {/* Référence */}
          <div className="px-5 py-3 border-t border-primary/10 flex items-start gap-2"
            style={{ background: "hsl(153,50%,28%,0.05)" }}>
            <span className="text-primary mt-0.5 text-xs">→</span>
            <p className="text-xs text-muted-foreground">
              Référence à indiquer :{" "}
              <span className="font-semibold text-foreground font-mono">PARTENARIAT MBP — [Votre nom] — [Année]</span>
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-center p-6 sm:p-10 bg-primary text-primary-foreground rounded-2xl"
        >
          <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-80" />
          <h3 className="font-heading text-2xl md:text-3xl font-bold mb-3">Devenez partenaire</h3>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Une conversation suffit à faire naître les plus belles collaborations.
            Parlons-en.
          </p>
          <Link
            to="/informations/contacts"
            className="inline-block px-8 py-3.5 bg-white text-foreground rounded-full text-sm font-bold hover:bg-white/90 active:scale-95 transition-all tracking-wide"
          >
            Nous contacter
          </Link>
        </motion.div>
      </div>
      </section>
    </div>
  );
}
