import { Heart, Mail, Phone, ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useLocalAuth } from "@/lib/LocalAuth";

const SOCIAL = [
  { href: "https://www.instagram.com/mabellepromo",  Icon: Instagram, label: "Instagram" },
  { href: "https://www.facebook.com/mabellepromo",   Icon: Facebook,  label: "Facebook"  },
  { href: "https://x.com/mabellepromo",              Icon: Twitter,   label: "X"         },
  { href: "https://www.youtube.com/@mabellepromo",   Icon: Youtube,   label: "YouTube"   },
  { href: "https://www.linkedin.com/in/fdd-mbp/",   Icon: Linkedin,  label: "LinkedIn"  },
];

const SectionLabel = ({ children }) => (
  <span className="block text-[9px] uppercase tracking-widest text-background/30 mb-2">
    {children}
  </span>
);

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);
  const { session } = useLocalAuth();
  const isAdmin = session?.role === "admin";

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
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
    <footer className="bg-[var(--brand-dark)] text-background footer-safe-area">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-5">

        {/* ── Grille 4 colonnes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">

          {/* Col 1 — Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                loading="lazy"
                src="/Logo Redesign1.webp"
                alt="Logo Ma Belle Promo"
                className="w-10 h-10 rounded-full opacity-90 flex-shrink-0"
                style={{ boxShadow: "0 0 16px rgba(45,122,82,0.20)" }}
              />
              <div>
                <div className="font-heading text-sm font-bold text-background leading-tight">Ma Belle Promo</div>
                <div className="text-[10px] text-background/35 mt-0.5">FDD Lomé · 1994–2000</div>
              </div>
            </div>
            <p className="text-[10px] text-background/25 tracking-widest uppercase">Amitié · Solidarité · Entraide</p>
            <div className="mt-3 flex items-start gap-1.5 border-l border-primary/30 pl-2">
              <p className="text-[9px] text-background/25 leading-relaxed">
                Association officiellement reconnue par les autorités<br />
                togolaises depuis le 03 octobre 2019<br />
                <span className="text-background/18">Récépissé N°0920/MATDCL-SG-DLPAP-DOCA</span>
              </p>
            </div>
          </div>

          {/* Col 2 — L'Association */}
          <div>
            <SectionLabel>L'Association</SectionLabel>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Accueil",           href: "/" },
                { label: "Valeurs & Mission", href: "/association/qui-sommes-nous" },
                { label: "Notre Équipe",      href: "/association/equipe" },
                { label: "Événements",        href: "/activites/evenements" },
                { label: "Actualités",        href: "/informations/actualites" },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="text-xs text-background/50 hover:text-background transition-colors">
                  {l.label}
                </Link>
              ))}
              <a
                href="https://passerelles.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-background/50 hover:text-background/80 transition-colors"
              >
                Programme <span style={{ color: "#f97316" }}>"Passerelles"</span> ↗
              </a>
            </nav>
          </div>

          {/* Col 3 — S'impliquer */}
          <div>
            <SectionLabel>S'impliquer</SectionLabel>
            <nav className="flex flex-col gap-2">
              {isAdmin && (
                <Link to="/boutique" className="text-xs text-background/50 hover:text-background transition-colors">
                  Boutique MBP
                </Link>
              )}
              {[
                { label: "Annuaire",      href: "/annuaire" },
                { label: "Adhésion",      href: "/implications/adhesion" },
                { label: "Nous soutenir", href: "/implications/soutenir" },
                { label: "Faire un don",  href: "/don" },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="text-xs text-background/50 hover:text-background transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 4 — Contact + Newsletter */}
          <div>
            <SectionLabel>Contact</SectionLabel>
            <div className="flex flex-col gap-2 mb-5">
              <a href="tel:+22896090707" className="flex items-center gap-1.5 text-xs text-background/50 hover:text-background transition-colors">
                <Phone className="w-3 h-3 flex-shrink-0" /> +228 96 09 07 07
              </a>
              <a href="mailto:contact@mabellepromo.org" className="flex items-center gap-1.5 text-xs text-background/50 hover:text-background transition-colors">
                <Mail className="w-3 h-3 flex-shrink-0" /> contact@mabellepromo.org
              </a>
            </div>

            <SectionLabel>Newsletter</SectionLabel>
            {done ? (
              <p className="text-xs text-background/40">✓ Vérifiez votre email pour confirmer</p>
            ) : (
              <>
              <form onSubmit={handleNewsletter} className="flex items-center gap-1.5">
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-7 px-3 rounded-md bg-white/10 border border-white/15 text-white placeholder:text-white/45 text-xs focus:outline-none focus:border-white/35 flex-1 min-w-0"
                />
                <button type="submit" aria-label="S'abonner à la newsletter" className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-md bg-primary hover:bg-primary/80 transition-opacity">
                  <ArrowRight className="w-3 h-3 text-primary-foreground" />
                </button>
              </form>
              <p className="text-[10px] text-background/25 mt-1.5">Actualités mensuelles et événements</p>
              </>
            )}
          </div>

        </div>

        {/* ── Barre du bas ── */}
        <div className="mt-4 pt-4 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-background/30">© {new Date().getFullYear()} Ma Belle Promo</p>
            <span className="text-background/20">·</span>
            <Link to="/mentions-legales" className="text-xs text-background/30 hover:text-background/60 transition-colors">Mentions légales</Link>
            <span className="text-background/20">·</span>
            <Link to="/confidentialite" className="text-xs text-background/30 hover:text-background/60 transition-colors">Confidentialité</Link>
          </div>

          <div className="flex items-center gap-4">
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

          <p className="text-xs text-background/30 flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-red-400/70" /> au Togo
          </p>
        </div>

      </div>
    </footer>
  );
}
