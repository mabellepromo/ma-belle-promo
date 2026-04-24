import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import { Target, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";

const objectifs = [
  "Promouvoir le partage d'expérience et le réseautage entre les membres",
  "Soutenir les étudiants et la Faculté de Droit (programmes de mentorat, octroi d'aides, bourses, stages, formations, emplois, etc.)",
  "Faciliter le retour et l'intégration des membres de la diaspora",
  "Établir des relations privilégiées entre les membres",
  "Agir dans la communauté soit pour renforcer des initiatives ou réaliser des activités, soit pour aider les populations vulnérables",
];

export default function Ambition() {
  return (
    <div>
      <SEO title="Notre Ambition" description="Les buts et objectifs de Ma Belle Promo, association des anciens diplômés de la FDD de l'Université de Lomé (1994-2000)." path="/association/ambition" />
      <PageHero title="Notre Ambition" subtitle="L'Association — But et objectifs" />

      <section className="py-20 max-w-6xl mx-auto px-6">

        {/* But */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">Notre raison d'être</span>
            <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-foreground mb-5">Notre But</h2>
            <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
              Le but de MBP est en partie décrit dans ses statuts. Il s'agit de contribuer à
              <strong className="text-foreground"> l'épanouissement de ses membres</strong> mais aussi et surtout
              d'<strong className="text-foreground">éclairer, d'accompagner les étudiants</strong> tout en impactant
              la société à travers les activités que nous mettons en place.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 text-justify">
              Notre autre ambition est de <strong className="text-foreground">montrer l'étendue et l'importance
              du droit dans notre société</strong>. Pour cela, des objectifs sont assignés à l'association.
            </p>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Elle se veut aussi un réseau exclusif permettant à ses membres de développer leurs contacts
              personnels et professionnels, et d'avoir pour ambition de maintenir notre savoir vivant
              et de conserver un lien avec la Faculté.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center justify-center mt-16"
          >
            {/* Anneaux décoratifs animés */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[340px] h-[340px] rounded-full border-2 border-primary/30"
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.08, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute w-[390px] h-[390px] rounded-full border border-accent/40"
            />

            {/* Lueur verte derrière l'image */}
            <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

            {/* Points décoratifs */}
            <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-8 w-3 h-3 bg-accent rounded-full shadow-lg" />
            <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-8 left-6 w-2 h-2 bg-primary rounded-full shadow-lg" />
            <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/3 left-2 w-2 h-2 bg-accent/60 rounded-full" />

            {/* Image avec ombre colorée */}
            <motion.img
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.3 }}
              src="/collage-membres.webp"
              alt="Membres Ma Belle Promo"
              className="relative z-10 w-full max-w-md h-96 object-contain drop-shadow-2xl"
              style={{ filter: "drop-shadow(0 8px 32px rgba(6,78,59,0.35)) drop-shadow(0 0 20px rgba(217,119,6,0.2))" }}
            />

          </motion.div>
        </div>

        {/* Objectifs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl p-10"
        >
          <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Nos Objectifs</h3>
          <p className="text-muted-foreground mb-8">
            Nos statuts y font une large part dans l'article 5 :
          </p>
          <div className="space-y-4">
            {objectifs.map((obj, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{obj}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vision chiffre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center"
        >
          <p className="font-heading text-xl font-bold text-foreground mb-2">Notre vision à moyen terme</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nous visons à ce que <strong className="text-primary">trois étudiants sur cinq</strong> de la Faculté
            de Droit de Lomé nous identifient clairement et soient impactés positivement par l'une de nos actions.
            Par conséquent toutes nos activités se tourneront prioritairement vers la consolidation de ces ambitions
            afin de les mettre exclusivement au service des étudiants actuels et de les aider autant qu'on le pourra.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
