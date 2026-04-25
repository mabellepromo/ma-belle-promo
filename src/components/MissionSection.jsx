import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MissionSection() {
  return (
    <section id="mission" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-0">
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
              <span className="font-medium italic text-accent">
                {" "}… voici notre histoire !
              </span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Ma Belle Promo est un regroupement d'anciens étudiants de la Faculté de Droit de l'Université de Lomé
              <strong className="text-foreground"> (1994–2000)</strong>, mû par le désir de créer un cadre d'échange
              et de partage pour mener des actions concertées dans divers domaines d'activité.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Réunis en association depuis le <strong className="text-foreground">1er décembre 2018</strong>, le but
              ultime est de contribuer à l'épanouissement des membres autour des valeurs d'amitié, de solidarité
              et d'entraide, en plus de nous ouvrir sur notre communauté.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Reconnus par les autorités depuis le <strong className="text-foreground">03 octobre 2019</strong>, notre
              Récépissé de déclaration d'association porte le{" "}
              <strong className="text-foreground">N°0920/MATDCL-SG-DLPAP-DOCA</strong>.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/association/credo"
                className="px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Notre Credo
              </Link>
              <Link
                to="/implications/soutenir"
                className="px-6 py-3 border border-border text-sm font-semibold rounded-full hover:bg-muted transition-colors text-foreground"
              >
                Nous soutenir
              </Link>
            </div>
          </motion.div>

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
            {/* Badge récépissé */}
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

      </div>
    </section>
  );
}
