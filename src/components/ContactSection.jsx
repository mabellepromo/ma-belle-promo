import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", sujet: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.sujet || !form.message) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (!consent) {
      toast.error("Veuillez accepter la politique de confidentialité pour envoyer votre message.");
      return;
    }
    setSending(true);

    const msg = {
      ...form,
      sujet: "",
      id: Date.now(),
      receivedAt: new Date().toISOString(),
      read: false,
    };

    try {
      // Sauvegarde dans la table messages (non bloquante)
      supabase.from("messages").insert({
        id: msg.id, name: msg.name, email: msg.email,
        sujet: msg.sujet, message: msg.message,
        received_at: msg.receivedAt, read: false,
      }).then(({ error }) => { if (error) console.warn("Sauvegarde messages échouée:", error.message); });

      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:    "contact",
          name:    form.name,
          email:   form.email,
          sujet:   form.sujet,
          message: form.message,
          sent_at: new Date().toLocaleString("fr-FR"),
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      toast.success("Message envoyé avec succès !");
      setForm({ name: "", email: "", sujet: "", message: "" });
    } catch (err) {
      console.error("Erreur envoi message:", err);
      toast.error("Erreur lors de l'envoi. Réessayez ou contactez-nous par email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-12 md:py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow text-accent">Restons en contact</span>
            <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Contactez-nous
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Vous avez une question, une suggestion ou souhaitez nous rejoindre ?
              N'hésitez pas à nous écrire. Nous vous répondrons dans les meilleurs délais.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Adresse</h4>
                  <p className="text-muted-foreground text-sm mt-0.5">12 BP 335 Baguida, Togo</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Téléphone</h4>
                  <p className="text-muted-foreground text-sm mt-0.5">+228 96 09 07 07</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Email</h4>
                  <Link to="/informations/contacts" className="text-primary text-sm mt-0.5 hover:underline">
                    Formulaire de contact
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5 shadow-sm">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
                <Input
                  placeholder="Votre nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Objet</label>
                <Input
                  placeholder="Objet de votre message"
                  value={form.sujet}
                  onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <Textarea
                  placeholder="Écrivez votre message ici..."
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              {/* Consentement RGPD */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  J'accepte que mes données (nom, email, message) soient traitées par Ma Belle Promo afin de répondre à ma demande, conformément à la{" "}
                  <Link to="/confidentialite" className="text-primary hover:underline font-medium">
                    politique de confidentialité
                  </Link>.
                </span>
              </label>

              <Button type="submit" disabled={sending || !consent} className="w-full h-12 rounded-full text-sm font-semibold gap-2">
                {sending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
