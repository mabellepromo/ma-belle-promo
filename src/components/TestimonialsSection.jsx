import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Fabienne SENAYA-ATAYI",
    role: "Présidente de Ma Belle Promo",
    titre: "Responsable administrative et juridique · Navitrans Africa Togo",
    photo: "/images/membres/fabienne.webp",
    quote: "Ma Belle Promo, c'est bien plus qu'une association d'anciens. C'est une famille qui transcende les frontières et les années. Chaque membre porte en lui cette flamme de la FDD de Lomé, et ensemble, nous l'entretenons pour éclairer les générations suivantes.",
  },
  {
    name: "Koffi Junior AOUGA",
    role: "Financial Advisor",
    titre: "World Financial Group · Minnesota, USA",
    photo: "/images/membres/junior.webp",
    quote: "Quand j'ai eu l'occasion de revenir à Lomé et de partager mon expérience avec les jeunes de l'ALG et ConnecTogo, j'ai mesuré à quel point notre association joue un rôle de pont. Ma Belle Promo m'a rappelé que nos racines sont notre plus grande force.",
  },
  {
    name: "Edwige KUAGBENU",
    role: "Enseignant-chercheur",
    titre: "Faculté de Droit · Université de Lomé",
    photo: "/images/membres/edwige-kuagbenu.webp",
    photoPosition: "center 5%",
    quote: "Animer des panels lors de La Nuit du Droit et dans le cadre des activités de MBP, c'est pour moi un devoir envers la prochaine génération. Ce que nos promoteurs ont construit à la FDD mérite d'être transmis avec fierté.",
  },
  {
    name: "Olga AKAKPOVI",
    role: "Associée, Cabinet FFA",
    titre: "Réseau ELYOS · Dakar, Sénégal",
    photo: "/images/membres/olga.webp",
    quote: "Le droit m'a ouvert des portes insoupçonnées. Aujourd'hui fiscaliste dans un cabinet international, je mesure combien la rigueur acquise à la FDD de Lomé est mon socle. Partager cela avec les étudiants via les webinaires MBP est une fierté immense.",
  },
  {
    name: "André Kangni AFANOU",
    role: "Secrétaire Général de MBP",
    titre: "Coordonnateur Afrique · CCPR Centre, Lomé",
    photo: "/images/membres/andre.webp",
    quote: "S'engager pour les droits humains est un choix de vie. Ma Belle Promo incarne cette idée que nos études de droit ne sont pas une fin en soi, mais le point de départ d'une responsabilité citoyenne. Je suis fier d'appartenir à cette famille.",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const go = (idx) => { setDirection(idx > current ? 1 : -1); setCurrent(idx); };
  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length); };
  const next = () => { setDirection(1); setCurrent((c) => (c + 1) % testimonials.length); };

  const t = testimonials[current];

  return (
    <section className="py-16 bg-foreground relative overflow-hidden">

      {/* Filigrane MBP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-heading font-bold text-background/[0.04] leading-none"
          style={{ fontSize: "clamp(8rem, 20vw, 16rem)" }}>
          MBP
        </span>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] font-bold uppercase tracking-[0.22em] mb-6"
          style={{ color: "rgba(52,211,153,0.55)" }}
        >
          Ce qu'ils disent
        </motion.p>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-6 py-2"
          >
            {/* Photo */}
            <div className="w-20 h-20 rounded-full flex-shrink-0 overflow-hidden border border-accent/30"
              style={{ background: "rgba(52,211,153,0.10)" }}>
              {t.photo
                ? <img loading="lazy" src={t.photo} alt={t.name} className="w-full h-full object-cover" style={{ objectPosition: t.photoPosition || "top" }} />
                : <span className="w-full h-full flex items-center justify-center font-heading text-xl font-bold text-accent">{t.name.charAt(0)}</span>
              }
            </div>

            {/* Citation + identité */}
            <div className="flex-1 min-w-0">
              <p className="text-background/80 text-sm md:text-base leading-relaxed italic line-clamp-3">
                « {t.quote} »
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-background">{t.name}</span>
                <span className="text-background/30">·</span>
                <span className="text-xs text-accent truncate">{t.role}</span>
                <span className="text-background/30 hidden sm:inline">·</span>
                <span className="text-xs text-background/40 truncate hidden sm:inline">{t.titre}</span>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <button onClick={prev} aria-label="Témoignage précédent" className="w-7 h-7 rounded-full border border-background/20 flex items-center justify-center text-background/40 hover:text-accent hover:border-accent transition-colors">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button onClick={next} aria-label="Témoignage suivant" className="w-7 h-7 rounded-full border border-background/20 flex items-center justify-center text-background/40 hover:text-accent hover:border-accent transition-colors">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Points */}
        <div className="flex gap-2 mt-5 justify-center items-center">
          {testimonials.map((t, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Afficher le témoignage de ${t.name}`}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5 bg-accent" : "w-2.5 h-2.5 bg-background/20 hover:bg-background/40"}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
