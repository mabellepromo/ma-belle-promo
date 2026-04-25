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
    quote: "Animer des panels lors de La Nuit du Droit et dans le cadre des activités de MBP, c'est pour moi un devoir envers la prochaine génération. Ce que nos promoteurs ont construit à la FDD mérite d'être transmis avec fierté.",
  },
  {
    name: "Olga AKAKPOVI",
    role: "Associate Director",
    titre: "Ernst & Young · Dakar, Sénégal",
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
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const go = (idx) => { setDirection(idx > current ? 1 : -1); setCurrent(idx); };
  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length); };
  const next = () => { setDirection(1); setCurrent((c) => (c + 1) % testimonials.length); };

  const t = testimonials[current];

  return (
    <section className="py-16 md:py-20 bg-foreground relative overflow-hidden">

      {/* Filigrane MBP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-heading font-bold text-background/[0.04] leading-none"
          style={{ fontSize: "clamp(8rem, 20vw, 16rem)" }}>
          MBP
        </span>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">

        {/* En-tête */}
        <div className="text-center mb-10">
          <p className="eyebrow text-primary/70 mb-3">Ils témoignent</p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">La parole à nos membres</h2>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.45 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 md:p-10"
          >
            {/* Guillemet décoratif */}
            <div className="font-heading text-5xl text-accent/40 leading-none mb-4 select-none">"</div>

            {/* Citation */}
            <p className="text-background/80 text-base md:text-lg leading-relaxed italic mb-8">
              {t.quote}
            </p>

            {/* Identité + contrôles */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden border-2 border-accent/30"
                  style={{ background: "rgba(52,211,153,0.10)" }}>
                  {t.photo
                    ? <img loading="lazy" src={t.photo} alt={t.name} className="w-full h-full object-cover object-top" />
                    : <span className="w-full h-full flex items-center justify-center font-heading text-lg font-bold text-accent">{t.name.charAt(0)}</span>
                  }
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-background">{t.name}</p>
                  <p className="text-xs text-accent mt-0.5">{t.role}</p>
                  <p className="text-xs text-background/40 mt-0.5 hidden sm:block">{t.titre}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={prev} className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center text-background/40 hover:text-accent hover:border-accent transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center text-background/40 hover:text-accent hover:border-accent transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Points */}
        <div className="flex gap-2 mt-6 justify-center">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-background/20 hover:bg-background/40"}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
