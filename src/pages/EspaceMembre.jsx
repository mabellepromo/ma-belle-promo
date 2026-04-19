import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, FileText, Lock, Edit2, Save, X, Download, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageHero from "../components/PageHero";

const documentsExclusifs = [
  { titre: "Statuts de l'association (2018)", type: "PDF", taille: "245 Ko", date: "Janv. 2018" },
  { titre: "Règlement intérieur MBP", type: "PDF", taille: "180 Ko", date: "Mars 2018" },
  { titre: "Rapport d'activités 2022-2023", type: "PDF", taille: "1.2 Mo", date: "Déc. 2023" },
  { titre: "Plan d'action 2023-2025", type: "PDF", taille: "890 Ko", date: "Janv. 2023" },
  { titre: "Compte-rendu AG 2023", type: "PDF", taille: "320 Ko", date: "Nov. 2023" },
  { titre: "Annuaire des membres", type: "PDF", taille: "—", date: "2024", restreint: true },
];

const historiqueExemple = [
  { annee: "2024", montant: "15 000", statut: "payée", date: "15 Jan. 2024", recu: true },
  { annee: "2023", montant: "15 000", statut: "payée", date: "10 Fév. 2023", recu: true },
  { annee: "2022", montant: "10 000", statut: "payée", date: "5 Mars 2022", recu: true },
  { annee: "2025", montant: "15 000", statut: "en attente", date: "—", recu: false },
];

const tabs = [
  { id: "profil", label: "Mon Profil", icon: User },
  { id: "cotisations", label: "Cotisations", icon: Clock },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function EspaceMembre() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ phone: "", city: "", country: "Togo", profession: "", linkedin: "" });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profil");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        const meta = u.user_metadata || {};
        setUser({ ...u, ...meta });
        setProfile({
          phone: meta.phone || "",
          city: meta.city || "",
          country: meta.country || "Togo",
          profession: meta.profession || "",
          linkedin: meta.linkedin || "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await supabase.auth.updateUser({ data: profile });
    setUser((u) => ({ ...u, ...profile }));
    setEditing(false);
    setSaving(false);
    toast.success("Profil mis à jour !");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Accès réservé aux membres</h2>
          <p className="text-muted-foreground mb-6 text-justify">Veuillez vous connecter pour accéder à votre espace membre et consulter votre profil, vos cotisations et les documents exclusifs.</p>
          <Button onClick={() => navigate('/login')} className="rounded-full gap-2">
            <Shield className="w-4 h-4" /> Se connecter
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHero title="Espace Adhérent" subtitle="Ma Belle Promo — Accès privé" />

      <section className="py-12 max-w-5xl mx-auto px-6">
        {/* Header profil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-primary-foreground font-heading font-bold text-3xl">
              {user.full_name?.charAt(0) || "M"}
            </span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="font-heading text-2xl font-bold text-foreground">{user.full_name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">Adhérent MBP</span>
              {user.role === "admin" && (
                <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Administrateur</span>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-xs text-muted-foreground mb-1">Statut cotisation 2025</div>
            <span className="px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">En attente</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Profil */}
        {tab === "profil" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-foreground">Mes informations</h3>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2 rounded-full">
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-2 rounded-full">
                    <X className="w-3.5 h-3.5" /> Annuler
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 rounded-full">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Champs lecture seule */}
              {[
                { icon: User, label: "Nom complet", value: user.full_name },
                { icon: Mail, label: "Email", value: user.email },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className="text-sm font-medium text-foreground">{value}</div>
                  </div>
                </div>
              ))}

              {/* Champs éditables */}
              {[
                { key: "phone", label: "Téléphone", icon: Phone, placeholder: "+228 00 00 00 00" },
                { key: "city", label: "Ville", icon: MapPin, placeholder: "Ex: Lomé" },
                { key: "country", label: "Pays", icon: MapPin, placeholder: "Ex: Togo" },
                { key: "profession", label: "Profession", icon: User, placeholder: "Ex: Avocat, Magistrat..." },
                { key: "linkedin", label: "LinkedIn", icon: User, placeholder: "https://linkedin.com/in/..." },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  {editing ? (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
                      <Input placeholder={placeholder} value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                        <div className="text-sm font-medium text-foreground">{profile[key] || <span className="text-muted-foreground italic">Non renseigné</span>}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cotisations */}
        {tab === "cotisations" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-primary font-heading">3</div>
                <div className="text-xs text-muted-foreground mt-1">Années de cotisation</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-foreground font-heading">40 000 F</div>
                <div className="text-xs text-muted-foreground mt-1">Total versé</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <div className="text-2xl font-bold text-amber-600 font-heading">2025</div>
                <div className="text-xs text-amber-600 mt-1">Cotisation en attente</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-heading text-lg font-bold text-foreground">Historique des cotisations</h3>
              </div>
              <div className="divide-y divide-border">
                {historiqueExemple.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.statut === "payée" ? "bg-green-100" : "bg-amber-100"}`}>
                        {c.statut === "payée"
                          ? <CheckCircle className="w-4 h-4 text-green-600" />
                          : <AlertCircle className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Cotisation {c.annee}</div>
                        <div className="text-xs text-muted-foreground">{c.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">{c.montant} FCFA</div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.statut === "payée" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {c.statut}
                        </span>
                      </div>
                      {c.recu && (
                        <button onClick={() => toast.info("Reçu disponible prochainement.")} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Download className="w-3 h-3" /> Reçu
                        </button>
                      )}
                      {!c.recu && (
                        <a href="/implications/cotisation" className="text-xs font-semibold text-amber-600 hover:underline">
                          Payer →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Pour toute question sur vos cotisations, contactez le trésorier à mabellepromo@gmail.com
            </p>
          </motion.div>
        )}

        {/* Documents */}
        {tab === "documents" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="space-y-3">
              {documentsExclusifs.map((doc, i) => (
                <div key={i} className={`flex items-center justify-between p-5 bg-card border rounded-xl transition-all ${doc.restreint ? "border-border opacity-60" : "border-border hover:border-primary/20 hover:shadow-sm"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.restreint ? "bg-muted" : "bg-primary/10"}`}>
                      {doc.restreint ? <Lock className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{doc.titre}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{doc.type} · {doc.taille} · {doc.date}</div>
                    </div>
                  </div>
                  {doc.restreint ? (
                    <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-full">Accès bureau</span>
                  ) : (
                    <button onClick={() => toast.info("Téléchargement disponible prochainement.")} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                      <Download className="w-3.5 h-3.5" /> Télécharger
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}