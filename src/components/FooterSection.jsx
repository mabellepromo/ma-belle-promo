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
  { label: "Accueil",       href: "/" },
  { label: "Adhésion",      href: "/implications/adhesion" },
  { label: "Actualités",    href: "/informations/actualites" },
  { label: "Nous soutenir", href: "/implications/soutenir" },
];

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

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Ligne principale ── */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">

          {/* Brand */}
          <div className="flex items-center gap-4 shrink-0">
            <img
              loading="lazy"
              src="/Logo Redesign1.webp"
              alt="Logo Ma Belle Promo"
              className="w-14 h-14 rounded-full opacity-90 shadow-lg"
              style={{ boxShadow: "0 0 20px rgba(52,211,153,0.20)" }}
            />
            <div>
              <div className="font-heading text-lg font-bold text-background leading-tight">Ma Belle Promo</div>
              <div className="text-xs text-background/40 leading-tight mt-0.5">FDD Lomé · 1994–2000</div>
              <div className="text-[10px] text-background/30 leading-tight mt-0.5 tracking-wide">Amitié · Solidarité · Entraide</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-xs text-background/50">
            {NAV.map((l) => (
              <Link key={l.href} to={l.href} className="hover:text-background transition-colors">
                {l.label}
              </Link>
            ))}
            <a
              href="https://passerelles.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity text-background/50"
            >
              Programme <span style={{ color: "#f97316" }}>
                "Passerelles"
              </span>
            </a>
          </nav>

          {/* Contact + newsletter */}
          <div className="flex flex-col gap-2.5 items-center lg:items-end text-xs text-background/50 shrink-0">
            <div className="flex items-center gap-4">
              <a href="tel:+22896090707" className="flex items-center gap-1.5 hover:text-background transition-colors">
                <Phone className="w-3 h-3" /> +228 96 09 07 07
              </a>
              <Link to="/informations/contacts" className="flex items-center gap-1.5 hover:text-background transition-colors">
                <Mail className="w-3 h-3" /> Nous contacter
              </Link>
            </div>
            {done ? (
              <p className="text-background/40 text-xs">✓ Vérifiez votre email pour confirmer l'inscription</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-full lg:w-auto">
                <span className="text-background/60 text-xs font-medium text-center lg:text-right lg:whitespace-nowrap">Restez informé(e), inscrivez-vous à la Newsletter</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-7 px-3 rounded-md bg-white/8 border border-white/10 text-background placeholder:text-background/25 text-xs focus:outline-none focus:border-white/25 flex-1 min-w-0"
                  />
                  <button type="submit" aria-label="S'abonner à la newsletter" className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-md bg-primary hover:bg-primary/80 transition-opacity">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Barre du bas ── */}
        <div className="mt-6 pt-4 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-background/30">© {new Date().getFullYear()} Ma Belle Promo</p>
            <div className="flex items-center gap-3">
              <Link to="/mentions-legales" className="text-xs text-background/30 hover:text-background/60 transition-colors">Mentions légales</Link>
              <span className="text-background/20">·</span>
              <Link to="/confidentialite" className="text-xs text-background/30 hover:text-background/60 transition-colors">Confidentialité</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL.map(({ href, Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-background/40 hover:text-background transition-colors hover:scale-110 transition-transform"
              >
                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              </a>
            ))}
          </div>

          <p className="text-xs text-background/30 flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-red-400/70" /> au Togo
          </p>
        </div>

      </div>
    </footer>
  );
}
