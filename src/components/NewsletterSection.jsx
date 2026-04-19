import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { sbGet, sbSet } from "@/lib/supabase";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { toast.error("Veuillez entrer une adresse email valide."); return; }
    setLoading(true);
    try {
      const existing = await sbGet("mbp_newsletter_subscribers") || [];
      if (!existing.find(s => s.email === email)) {
        await sbSet("mbp_newsletter_subscribers", [...existing, { email, name, source: "home", subscribedAt: new Date().toISOString() }]);
      }
      setDone(true);
      toast.success("Inscription confirmée ! Merci de votre soutien.");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="py-20 bg-primary relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-black/10 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
            Restez connectés à MBP
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Recevez en avant-première nos actualités, événements et programmes. 
            Rejoignez notre communauté de juristes engagés.
          </p>
        </motion.div>

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-semibold text-lg">Merci ! Votre inscription est confirmée.</p>
            <p className="text-white/60 text-sm">Vous recevrez bientôt nos prochaines actualités.</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <Input
              type="text"
              placeholder="Votre prénom (optionnel)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/40 rounded-full px-5 hidden sm:flex"
            />
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/40 rounded-full px-5 flex-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-7 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-all flex items-center justify-center gap-2 flex-shrink-0 text-sm"
            >
              {loading ? "..." : <>S'inscrire <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}

        <p className="mt-4 text-white/40 text-xs">
          Pas de spam. Désinscription possible à tout moment.
        </p>
      </div>
    </section>
  );
}