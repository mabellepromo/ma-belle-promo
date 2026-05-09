import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Target, Scale, ArrowRight } from "lucide-react";

const MotionLink = motion(Link);

const GLOW_CSS = `
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(21,128,61,0); }
    50%      { box-shadow: 0 0 0 14px rgba(21,128,61,0.30); }
  }
  .btn-glow { animation: glow-pulse 2.4s ease-in-out infinite; }
`;

const TILES = [
  {
    icon: BookOpen,
    color: "primary",
    title: "Notre Credo",
    href: "/association/credo",
    desc: "Les 6 valeurs fondatrices qui définissent l'identité et l'âme de Ma Belle Promo.",
    tags: ["Amitié", "Solidarité", "Entraide", "Excellence"],
    cta: "Découvrir nos valeurs",
    tagStyle: "bg-primary/10 text-primary border-primary/20",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    hoverBorder: "hover:border-primary/40",
    hoverTitle: "group-hover:text-primary",
    ctaColor: "text-primary",
    accentBg: "bg-primary/5 group-hover:bg-primary/10",
  },
  {
    icon: Target,
    color: "accent",
    title: "Notre Ambition",
    href: "/association/ambition",
    desc: "Notre but, nos objectifs et notre vision à moyen terme pour l'association et ses membres.",
    tags: ["Réseau", "Mentorat", "Communauté", "Impact"],
    cta: "Découvrir notre ambition",
    tagStyle: "bg-accent/10 text-accent border-accent/20",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    hoverBorder: "hover:border-accent/40",
    hoverTitle: "group-hover:text-accent",
    ctaColor: "text-accent",
    accentBg: "bg-accent/5 group-hover:bg-accent/10",
  },
  {
    icon: Scale,
    color: "blue",
    title: "Notre Statut",
    href: "/mentions-legales",
    desc: "Association à but non lucratif dotée de la personnalité morale, constituée conformément à la législation togolaise, à fins exclusivement désintéressées.",
    tags: ["ABNL", "Personnalité morale", "FDD · UL", "Depuis 2019"],
    cta: "Consulter nos mentions légales",
    tagStyle: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-300",
    hoverTitle: "group-hover:text-blue-700",
    ctaColor: "text-blue-600",
    accentBg: "bg-blue-50/50 group-hover:bg-blue-50",
  },
];

export default function MissionSection() {
  const shouldReduce = useReducedMotion();
  const springTransition = { type: "spring", stiffness: 400, damping: 20 };

  return (
    <section id="mission" className="py-16 md:py-24 bg-background">
      <style>{GLOW_CSS}</style>

      <div className="max-w-7xl mx-auto px-6 space-y-20">

        {/* ── Bloc 1 : Qui sommes-nous ── */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Colonne texte */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow text-accent">Qui sommes-nous</span>
            <h2 className="mt-3 font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Nous sommes{" "}
              <span className="text-primary">Ma Belle Promo</span>
            </h2>
            <p className="mt-2 text-accent italic font-medium text-lg">
              Une communauté, une histoire, un engagement.
            </p>

            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Ma Belle Promo réunit les anciens étudiants de la{" "}
              <span className="text-foreground">Faculté de Droit de l'Université de Lomé</span>,
              promotion <strong className="text-foreground">1994–2000</strong>. Née du désir de préserver
              les liens tissés sur les bancs de l'université, notre association est devenue un espace
              dynamique où l'amitié, la solidarité et l'entraide prennent une dimension collective.
            </p>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              Depuis le <strong className="text-foreground">1er décembre 2018</strong>, nous avons choisi
              de transformer notre cohésion en force d'action. Officiellement reconnue le{" "}
              <strong className="text-foreground">03 octobre 2019</strong>, Ma Belle Promo s'engage
              aujourd'hui au service de ses membres et de sa communauté.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <MotionLink
                to="/association/credo"
                whileHover={shouldReduce ? undefined : { scale: 1.04 }}
                whileTap={shouldReduce ? undefined : { scale: 0.96 }}
                transition={springTransition}
                className={`px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-full${shouldReduce ? "" : " btn-glow"}`}
              >
                Notre Credo
              </MotionLink>
              <MotionLink
                to="/implications/soutenir"
                whileHover={shouldReduce ? undefined : { scale: 1.04 }}
                whileTap={shouldReduce ? undefined : { scale: 0.96 }}
                transition={springTransition}
                className="px-6 py-3 border border-border text-sm font-semibold rounded-full hover:bg-muted transition-colors text-foreground"
              >
                Nous soutenir
              </MotionLink>
            </div>
          </motion.div>

          {/* Colonne image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                loading="lazy"
                src="/images/evenements/reunion-mbp.webp"
                alt="Soirée de Gala Ma Belle Promo"
                className="w-full h-80 md:h-96 object-cover object-top"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-xl"
            >
              <p className="text-xs text-muted-foreground font-medium">Association reconnue</p>
              <p className="text-sm font-bold text-foreground">depuis le 03 oct. 2019</p>
              <p className="text-xs text-primary mt-0.5">N°0920/MATDCL-SG-DLPAP-DOCA</p>
            </motion.div>

            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/20 -z-10" />
          </motion.div>
        </div>

        {/* ── Bloc 2 : Credo & Ambition — 2 tuiles de navigation ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <span className="eyebrow text-accent">L'Association</span>
            <h3 className="mt-3 font-heading text-2xl md:text-4xl font-bold text-foreground">
              En savoir plus sur Ma Belle Promo
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TILES.map(({ icon: Icon, title, href, desc, tags, cta, tagStyle, iconBg, iconColor, hoverBorder, hoverTitle, ctaColor, accentBg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={shouldReduce ? undefined : { y: -4 }}
              >
                <Link
                  to={href}
                  className={`group relative flex flex-col h-full bg-card border border-border rounded-2xl p-8 overflow-hidden ${hoverBorder} hover:shadow-xl transition-all duration-300`}
                >
                  {/* Cercle décoratif en arrière-plan */}
                  <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full transition-colors duration-300 ${accentBg}`} />

                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5 relative z-10`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  <h4 className={`font-heading text-xl font-bold text-foreground mb-2 transition-colors ${hoverTitle} relative z-10`}>
                    {title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 relative z-10">
                    {desc}
                  </p>

                  {/* Tags aperçu */}
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {tags.map(tag => (
                      <span key={tag} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${tagStyle}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className={`mt-auto flex items-center gap-1.5 text-sm font-semibold relative z-10 ${ctaColor}`}>
                    {cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
