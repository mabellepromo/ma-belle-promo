import { Heart, Mail, Phone, ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SOCIAL = [
  { href: "https://www.instagram.com/mabellepromo",  Icon: Instagram, label: "Instagram" },
  { href: "https://www.facebook.com/mabellepromo",   Icon: Facebook,  label: "Facebook"  },
  { href: "https://x.com/mabellepromo",              Icon: Twitter,   label: "X"         },
  { href: "https://www.youtube.com/@mabellepromo",   Icon: Youtube,   label: "YouTube"   },
  { href: "https://www.linkedin.com/in/fdd-mbp/",   Icon: Linkedin,  label: "LinkedIn"  },
];

const NAV = [
  { label: "Accueil",          href: "/" },
  { label: "Qui sommes-nous",  href: "/association/qui-sommes-nous" },
  { label: "Nos Actions",      href: "/activites/evenements" },
  { label: "Actualités",       href: "/informations/actualites" },
  { label: "Adhésion",         href: "/implications/adhesion" },
  { label: "Nous soutenir",    href: "/implications/soutenir" },
];

function FooterHeading({ children }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-background/40 mb-4">
      {children}
    </h3>
  );
}

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer", active: false, token });
    // 23505 = email déjà inscrit → on re-envoie quand même le lien de confirmation
    if (error && error.code !== "23505") { toast.error("Une erreur est survenue."); return; }
    const confirm_url = `${window.location.origin}/newsletter/confirmer?token=${token}`;
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter_confirm", email, token, confirm_url }),
    });
    setDone(true);
    toast.success("Vérifiez votre boîte email pour confirmer !");
  };

  return (
    <footer className="bg-foreground text-background footer-safe-area">
      {/* Ligne d'accent en haut */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Grille principale : 4 colonnes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Colonne 1 — Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                loading="lazy"
                src="/Logo Redesign1.webp"
                alt="Logo Ma Belle Promo"
                className="w-12 h-12 rounded-full opacity-90 shadow-lg flex-shrink-0"
                style={{ boxShadow: "0 0 20px rgba(52,211,153,0.20)" }}
              />
              <div>
                <div className="font-heading text-base font-bold text-background leading-tight">Ma Belle Promo</div>
                <div className="text-[11px] text-background/40 leading-tight mt-0.5">FDD Lomé · 1994–2000</div>
              </div>
            </div>
            <p className="text-xs text-background/40 leading-relaxed">
              Association des diplômés de la Faculté de Droit de l'Université de Lomé, promotion 1994–2000.
            </p>
            <p className="text-[10px] text-background/25 tracking-widest uppercase">
              Amitié · Solidarité · Entraide
            </p>
            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3 mt-1">
              {SOCIAL.map(({ href, Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-background/35 hover:text-background transition-colors hover:scale-110"
                  style={{ display: "inline-flex" }}
                >
                  <Icon style={{ width: 16, height: 16 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 — Navigation */}
          <div>
            <FooterHeading>Navigation</FooterHeading>
            <nav className="flex flex-col gap-2">
              {NAV.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-xs text-background/50 hover:text-background transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="https://passerelles.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-background/50 hover:text-background/80 transition-colors"
              >
                Programme <span style={{ color: "#f97316" }}>"Passerelles"</span>
              </a>
            </nav>
          </div>

          {/* Colonne 3 — Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+22896090707"
                className="flex items-center gap-2 text-xs text-background/50 hover:text-background transition-colors"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                +228 96 09 07 07
              </a>
              <Link
                to="/informations/contacts"
                className="flex items-center gap-2 text-xs text-background/50 hover:text-background transition-colors"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Colonne 4 — Newsletter */}
          <div>
            <FooterHeading>Restez informé(e)</FooterHeading>
            {done ? (
              <p className="text-xs text-background/40 leading-relaxed">
                ✓ Vérifiez votre email pour confirmer l'inscription.
              </p>
            ) : (
              <>
                <p className="text-xs text-background/40 mb-3 leading-relaxed">
                  Recevez nos actualités et événements directement dans votre boîte mail.
                </p>
                <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-8 px-3 rounded-md bg-white/8 border border-white/10 text-background placeholder:text-background/25 text-xs focus:outline-none focus:border-white/25"
                  />
                  <button
                    type="submit"
                    className="h-8 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/80 transition-opacity text-primary-foreground text-xs font-medium"
                  >
                    S'inscrire <ArrowRight className="w-3 h-3" />
                  </button>
                </form>
              </>
            )}
          </div>

        </div>

        {/* ── Barre du bas ── */}
        <div className="mt-10 pt-5 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/30">© {new Date().getFullYear()} Ma Belle Promo · Tous droits réservés</p>

          <div className="flex items-center gap-4">
            <Link to="/mentions-legales" className="text-xs text-background/30 hover:text-background/60 transition-colors">
              Mentions légales
            </Link>
            <span className="text-background/20">·</span>
            <Link to="/confidentialite" className="text-xs text-background/30 hover:text-background/60 transition-colors">
              Confidentialité
            </Link>
          </div>

          <p className="text-xs text-background/30 flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-red-400/70" /> au Togo
          </p>
        </div>

      </div>
    </footer>
  );
}
