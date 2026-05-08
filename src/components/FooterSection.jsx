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
  { label: "Contact",       href: "/informations/contacts" },
];

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }
    setLoading(true);
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer", active: false, token });
    // 23505 = email déjà inscrit → on re-envoie quand même le lien de confirmation
    if (error && error.code !== "23505") { 
      toast.error("Une erreur est survenue."); 
      setLoading(false);
      return; 
    }
    const confirm_url = `${window.location.origin}/newsletter/confirmer?token=${token}`;
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter_confirm", email, token, confirm_url }),
    });
    setDone(true);
    setLoading(false);
    toast.success("Vérifiez votre boîte email pour confirmer !");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative text-background footer-safe-area" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Pied de page</h2>

      {/* Ligne d'accent brillant (shimmer) */}
      <div className="absolute inset-x-0 -top-1 h-1 overflow-hidden pointer-events-none">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 shimmer" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Main row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">

          {/* Brand */}
          <div className="flex items-center gap-4 shrink-0">
            <img
              loading="lazy"
              src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
              alt="Logo Ma Belle Promo"
              className="w-14 h-14 rounded-full bg-white/5 p-1 shadow-xl"
              style={{ boxShadow: "0 6px 30px rgba(0,0,0,0.35)" }}
            />
            <div>
              <div className="font-heading text-lg font-semibold text-white">Ma Belle Promo</div>
              <div className="text-xs text-white/60 leading-tight mt-0.5">FDD Lomé · 1994–2000</div>
              <div className="text-[10px] text-white/40 leading-tight mt-0.5 tracking-wide">Amitié · Solidarité · Entraide</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-6 gap-y-1.5 justify-center text-sm text-white/70" aria-label="Liens du site">
            {NAV.map((l) => (
              <Link key={l.href} to={l.href} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded" >
                {l.label}
              </Link>
            ))}
            <a
              href="https://passerelles.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity text-white/70 flex items-center gap-1"
            >
              Programme <span className="text-yellow-400 font-semibold">"Passerelles"</span>
            </a>
          </nav>

          {/* Contact + newsletter */}
          <div className="flex flex-col gap-3 items-center lg:items-end text-sm text-white/70 shrink-0 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <a href="tel:+22896090707" className="flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded">
                <Phone className="w-4 h-4" /> <span className="sr-only">Téléphone</span> <span>+228 96 09 07 07</span>
              </a>
              <Link to="/informations/contacts" className="flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded">
                <Mail className="w-4 h-4" /> <span>Nous contacter</span>
              </Link>
            </div>

            <div className="w-full lg:w-auto">
              {done ? (
                <p className="text-sm text-white/60" role="status" aria-live="polite">✓ Vérifiez votre email pour confirmer l'inscription</p>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto" aria-label="Inscription newsletter">
                  <label htmlFor="footer-email" className="sr-only">Votre email</label>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 px-3 rounded-md bg-white/6 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all w-full lg:w-64"
                  />
                  <button
                    type="submit"
                    aria-label="S'abonner à la newsletter"
                    className={`h-10 px-3 rounded-md flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:scale-105 transition-transform shadow-sm ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Envoi…' : 'S&#39;abonner'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-white/50">© {new Date().getFullYear()} Ma Belle Promo · Amitié · Solidarité · Entraide</p>
            <div className="flex items-center gap-3">
              <Link to="/mentions-legales" className="text-sm text-white/50 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-yellow-300 rounded">Mentions légales</Link>
              <span className="text-white/20">·</span>
              <Link to="/confidentialite" className="text-sm text-white/50 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-yellow-300 rounded">Confidentialité</Link>
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
                className="text-white/60 hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded p-1 transition-all transform hover:scale-110"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <p className="text-sm text-white/50 flex items-center gap-2">
            Fait avec <Heart className="w-4 h-4 text-red-400" /> au Togo
          </p>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Remonter en haut"
        className="fixed right-6 bottom-6 z-50 h-11 w-11 rounded-full bg-yellow-400 text-black shadow-lg flex items-center justify-center hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
      >
        ↑
      </button>

      <style>{`
        footer { background: linear-gradient(180deg, rgba(6,7,9,0.96), rgba(10,11,12,0.98)); }
        .shimmer { background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
      `}</style>
    </footer>
  );
}
