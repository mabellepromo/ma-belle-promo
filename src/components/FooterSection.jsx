import { Heart, Mail, Phone, ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
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
  { label: "Accueil",    href: "/" },
  { label: "Adhésion",  href: "/implications/adhesion" },
  { label: "Actualités",href: "/informations/actualites" },
  { label: "Contact",   href: "/informations/contacts" },
];

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    await base44.entities.NewsletterSubscriber.create({ email, source: "footer", active: true });
    setDone(true);
    toast.success("Inscription confirmée !");
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Ligne principale ── */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              loading="lazy"
              src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
              alt="Logo Ma Belle Promo"
              className="w-10 h-10 rounded-full opacity-90"
            />
            <div>
              <div className="font-heading font-bold text-background leading-tight">Ma Belle Promo</div>
              <div className="text-xs text-background/40 leading-tight">FDD Lomé · 1994–2000</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-xs text-background/50">
            {NAV.map((l) => (
              <Link key={l.href} to={l.href} className="hover:text-background transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Contact + newsletter */}
          <div className="flex flex-col gap-2.5 items-center lg:items-end text-xs text-background/50 shrink-0">
            <div className="flex items-center gap-4">
              <a href="tel:+22896020000" className="flex items-center gap-1.5 hover:text-background transition-colors">
                <Phone className="w-3 h-3" /> +228 96 02 00 00
              </a>
              <a href="mailto:mabellepromo@gmail.com" className="flex items-center gap-1.5 hover:text-background transition-colors">
                <Mail className="w-3 h-3" /> mabellepromo@gmail.com
              </a>
            </div>
            {done ? (
              <p className="text-background/40 text-xs">✓ Inscrit(e) à la newsletter</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="Votre email — newsletter"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-7 px-3 rounded-md bg-white/8 border border-white/10 text-background placeholder:text-background/25 text-xs focus:outline-none focus:border-white/25 w-48"
                />
                <button type="submit" className="h-7 w-7 flex items-center justify-center rounded-md bg-primary hover:bg-primary/80 transition-colors">
                  <ArrowRight className="w-3 h-3 text-primary-foreground" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Barre du bas ── */}
        <div className="mt-6 pt-4 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/30">© {new Date().getFullYear()} Ma Belle Promo · Amitié · Solidarité · Entraide</p>

          <div className="flex items-center gap-4">
            {SOCIAL.map(({ href, Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-background/35 hover:text-background transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
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
