import { useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import { Send, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function Contacts() {
  const [form, setForm] = useState({ name: "", email: "", sujet: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!consent) {
      toast.error("Veuillez accepter la politique de confidentialité pour envoyer votre message.");
      return;
    }
    setSending(true);

    const msg = {
      ...form,
      id: Date.now(),
      receivedAt: new Date().toISOString(),
      read: false,
    };

    try {
      // Sauvegarde dans la table messages (visible dans le Dashboard)
      supabase.from("messages").insert({
        id: msg.id, name: msg.name, email: msg.email,
        sujet: msg.sujet || "", message: msg.message,
        received_at: msg.receivedAt, read: false,
      }).then(({ error }) => { if (error) console.warn("Sauvegarde messages:", error.message); });

      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:    "contact",
          name:    form.name,
          email:   form.email,
          sujet:   form.sujet || "(sans sujet)",
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
    <div>
      <SEO title="Contact" description="Contactez Ma Belle Promo : adresse, téléphone, email et formulaire de contact de l'association des anciens diplômés FDD de Lomé." path="/informations/contacts" />
      <PageHero title="Contact" subtitle="Informations — Nous joindre" />

      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Infos */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Coordonnées</h2>

              {[
                { icon: MapPin, label: "Adresse", value: "12 BP 335 Baguida, Togo" },
                { icon: Phone, label: "TMoney", value: "90 05 36 06 / 90 03 63 43" },
                { icon: Phone, label: "Flooz", value: "96 02 00 00 / 99 41 91 92" },
                { icon: Mail, label: "Email", value: "contact@mabellepromo.org" },
                { icon: Clock, label: "Disponibilité", value: "Lun – Ven : 8h – 18h" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    {item.href
                      ? <a href={item.href} className="text-primary text-sm font-medium hover:underline">{item.value}</a>
                      : <div className="text-sm text-foreground font-medium">{item.value}</div>
                    }
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-5 bg-primary text-primary-foreground rounded-2xl">
              <h3 className="font-heading font-bold mb-2">Faculté de Droit de Lomé</h3>
              <p className="text-sm text-primary-foreground/80">
                Ma Belle Promo est l'association des anciens de la Faculté de Droit de l'Université de Lomé, promotion 1994-2000.
              </p>
            </motion.div>
          </div>

          {/* Formulaire */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-3">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-4 sm:p-8 space-y-5 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Envoyer un message</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet *</label><Input placeholder="Votre nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12" /></div>
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label><Input type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-12" /></div>
              </div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Sujet</label><Input placeholder="Objet de votre message" value={form.sujet} onChange={e => setForm({...form, sujet: e.target.value})} className="h-12" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Message *</label><Textarea placeholder="Écrivez votre message ici..." rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>

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
                {sending ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
