import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Heart, Target } from "lucide-react";

const MotionLink = motion(Link);

const GLOW_CSS = `
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(21,128,61,0); }
    50%      { box-shadow: 0 0 0 14px rgba(21,128,61,0.30); }
  }
  .btn-glow { animation: glow-pulse 2.4s ease-in-out infinite; }
`;

const MISSIONS = [
  {
    icon: Users,
    title: "Créer un réseau vivant et utile",
    desc: "Favoriser le partage d'expérience, renforcer les liens professionnels et personnels, et offrir à chaque membre un cadre d'échanges constructifs.",
  },
  {
    icon: GraduationCap,
    title: "Soutenir les étudiants et la Faculté de Droit",
    desc: "Mentorat, accompagnement, aides diverses, formations, opportunités professionnelles… Nous mettons notre expérience au service de la nouvelle génération.",
  },
  {
    icon: Heart,
    title: "Agir pour les populations vulnérables",
    desc: "À travers des actions caritatives et des initiatives citoyennes, nous contribuons à améliorer le quotidien des plus fragiles.",
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
              <strong className="text-foreground">Faculté de Droit de l'Université de Lomé</strong>,
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

        {/* ── Bloc 2 : Notre mission ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="eyebrow text-accent">Notre mission</span>
            <h3 className="mt-3 font-heading text-2xl md:text-4xl font-bold text-foreground">
              Ce qui nous anime au quotidien
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {MISSIONS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative bg-card border border-border rounded-2xl p-7 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Accent de coin */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full rounded-tr-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-heading font-bold text-foreground text-lg leading-snug mb-3">
                  {title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bloc 3 : Notre vision ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-8 py-12 md:px-16 md:py-14 text-center"
        >
          {/* Cercles décoratifs */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/8 -z-10" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-accent/8 -z-10" />

          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Target className="w-7 h-7 text-primary" />
          </div>

          <span className="eyebrow text-accent">Notre vision</span>
          <p className="mt-4 font-heading text-xl md:text-3xl font-bold text-foreground max-w-3xl mx-auto leading-relaxed">
            Faire de Ma Belle Promo un{" "}
            <span className="text-primary">réseau solidaire, influent et utile</span>,
            capable d'accompagner ses membres, de soutenir les étudiants et de jouer un rôle
            positif dans la société.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
