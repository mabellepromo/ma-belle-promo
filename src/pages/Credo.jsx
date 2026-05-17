import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

const valeurs = [
  {
    numero: "01",
    titre: "Amitié",
    texte: "Ma Belle Promo est avant tout une famille. Les liens d'amitié tissés sur les bancs de la Faculté de Droit de Lomé sont indéfectibles. Nous les cultivons au fil des années, à travers nos rencontres, nos événements et notre engagement partagé pour porter plus loin les valeurs de notre promotion.",
    accent: "bg-rose-400",
  },
  {
    numero: "02",
    titre: "Solidarité",
    texte: "Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo. Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution, mais, du fait de nos expériences et de nos talents, à constituer avant tout une source d'inspiration et de ressources pour les générations qui nous suivent.",
    accent: "bg-amber-400",
  },
  {
    numero: "03",
    titre: "Entraide",
    texte: "Nous contribuons activement à l'épanouissement de nos membres et à l'accompagnement des étudiants actuels de la Faculté de Droit. Partage de compétences, mentorat, soutien moral et matériel : l'entraide est le moteur qui fait avancer chacun d'entre nous et renforce la cohésion de notre groupe.",
    accent: "bg-emerald-500",
  },
  {
    numero: "04",
    titre: "Engagement communautaire",
    texte: "Ma Belle Promo s'ouvre sur sa communauté pour mener des actions concertées : aide aux personnes vulnérables, soutien aux étudiants, initiatives citoyennes. Nos membres s'engagent activement pour un impact positif et durable dans la société togolaise, au-delà du seul cercle de l'association.",
    accent: "bg-blue-400",
  },
  {
    numero: "05",
    titre: "Excellence",
    texte: "Diplômés de la Faculté de Droit de l'Université de Lomé, nous portons haut le flambeau de l'excellence académique et professionnelle. Notre réseau réunit avocats, magistrats, notaires, entrepreneurs et cadres reconnus dans leurs domaines, dont la réussite est une fierté collective.",
    accent: "bg-violet-400",
  },
  {
    numero: "06",
    titre: "Ouverture sur le monde",
    texte: "Ma Belle Promo se veut un réseau ouvert sur le monde, facilitant le retour et l'intégration des membres de la diaspora, et permettant à chacun de développer ses contacts personnels et professionnels bien au-delà des frontières du Togo.",
    accent: "bg-teal-400",
  },
];

export default function Credo() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Notre Credo" description="Les valeurs fondatrices de Ma Belle Promo : amitié, solidarité et entraide au service des anciens diplômés de la FDD de l'Université de Lomé." />

      {/* ── Hero 80vh ── */}
      <div className="relative flex flex-col items-center justify-center h-[58vh] bg-foreground overflow-hidden px-6">

        {/* Logo en filigrane */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src="/Logo Redesign1.webp"
            alt=""
            className="w-[420px] max-w-[70%] opacity-[0.06] object-contain"
          />
        </div>

        {/* Ligne décorative top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6">
            Ma Belle Promo — FDD · Université de Lomé
          </p>

          <h1 className="font-heading text-3xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-10">
            Notre Credo
          </h1>

          <div className="w-12 h-px bg-primary mx-auto mb-10" />

          <blockquote>
            <p className="font-heading text-lg md:text-xl italic text-white/75 leading-relaxed">
              « Échange, partage et réciprocité sont les valeurs qui animent Ma Belle Promo.
              Nous avons vocation à être non seulement des ambassadrices et ambassadeurs de l'institution
              mais, du fait de nos expériences et nos talents, à constituer avant tout une source
              d'inspiration et de ressources pour les générations qui nous suivent. »
            </p>
            <footer className="mt-6 text-sm font-semibold text-primary/80">— Ma Belle Promo (MBP)</footer>
          </blockquote>
        </motion.div>

        {/* Ligne décorative bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />
      </div>

      {/* ── Grille des valeurs ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="eyebrow text-primary text-center mb-12"
        >
          Six valeurs fondamentales
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valeurs.map((v, i) => (
            <motion.div
              key={v.titre}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative flex flex-col bg-card border border-border rounded-2xl p-4 sm:p-7 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              {/* Numéro géant en filigrane */}
              <div className="absolute -bottom-4 -right-2 font-heading text-[7rem] font-black leading-none select-none pointer-events-none text-foreground/[0.04]">
                {v.numero}
              </div>

              {/* Trait accent top */}
              <div className={`w-8 h-0.5 mb-5 group-hover:w-14 transition-all duration-300 ${v.accent}`} />

              <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {v.titre}
              </h3>
              <p className="text-muted-foreground relative z-10 text-justify flex-1">
                {v.texte}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Récépissé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/40 border border-border rounded-2xl"
        >
          <p className="text-muted-foreground text-center sm:text-left">
            Association officiellement reconnue par les autorités togolaises depuis le{" "}
            <strong className="text-foreground">03 octobre 2019</strong>
            <span className="block text-xs text-primary font-semibold mt-0.5">
              Récépissé N°0920/MATDCL-SG-DLPAP-DOCA
            </span>
          </p>
          <Link
            to="/implications/adhesion"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Nous rejoindre <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
