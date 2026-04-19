import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalAuth } from "../lib/LocalAuth";
import { members as staticMembers } from "../data/members.js";
import {
  Search, MapPin, Briefcase, Mail, Phone, X,
  Users, LayoutGrid, List, Star, Plus, Clock,
  Check, ChevronRight, UserPlus, AlertCircle, Shield, Edit2, Save,
  Upload, Link2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHero from "../components/PageHero";
import { toast } from "sonner";
import { useMemberStore } from "../lib/memberStore";
import { compressImage } from "../lib/imageUtils";

const PAYS_OPTIONS = ["Tous", ...Array.from(new Set(staticMembers.map((m) => m.pays))).sort()];

/* ════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════ */
export default function AnnuaireMembres() {
  const { session } = useLocalAuth();
  const isAdmin = session?.role === "admin";

  const {
    allMembers, pendingMembers, updateMember,
    validateMember, rejectMember, addPending,
  } = useMemberStore();

  const [search,    setSearch]    = useState("");
  const [pays,      setPays]      = useState("Tous");
  const [bureaOnly, setBureauOnly] = useState(false);
  const [viewMode,  setViewMode]  = useState("grid");
  const [selected,       setSelected]       = useState(null);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [editingMember,  setEditingMember]  = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return allMembers.filter((m) => {
      const hay = [m.nom, m.profession, m.ville, m.role, m.pays]
        .join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return (!search || hay.includes(q)) && (pays === "Tous" || m.pays === pays) && (!bureaOnly || m.bureau);
    });
  }, [allMembers, search, pays, bureaOnly]);

  const resetFilters = () => { setSearch(""); setPays("Tous"); setBureauOnly(false); };
  const hasFilters = search || pays !== "Tous" || bureaOnly;

  function handleSubmitNew(formData) {
    addPending(formData);
    setShowAddForm(false);
  }

  function handleSaveMember(member, data) {
    updateMember(member, data);
    if (selected?.id === member.id) setSelected(prev => ({ ...prev, ...data }));
    setEditingMember(null);
    toast.success("Fiche mise à jour !");
  }

  return (
    <div>
      <PageHero title="Adhérents" subtitle={`${allMembers.length} membres · Promotion FDD Lomé 1994–2000`} />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Membres", value: allMembers.length, icon: Users },
            { label: "Pays", value: Array.from(new Set(allMembers.map(m => m.pays))).length, icon: MapPin },
            { label: "Bureau exécutif", value: allMembers.filter(m => m.bureau).length, icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <div className="font-heading text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {filtered.length} membre{filtered.length !== 1 ? "s" : ""}{hasFilters ? " trouvé(s)" : ""}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Réseau des diplômés · FDD Université de Lomé</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("trombi")} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${viewMode === "trombi" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
              <List className="w-4 h-4" />
            </button>
            {isAdmin && pendingMembers.length > 0 && (
              <button onClick={() => setShowValidation(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-all">
                <Clock className="w-4 h-4" /> En attente
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingMembers.length}
                </span>
              </button>
            )}
            <button onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-muted/40 border border-border rounded-2xl p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Rechercher un membre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-background" />
            </div>
            <select className="flex h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={pays} onChange={(e) => setPays(e.target.value)}>
              {PAYS_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button onClick={() => setBureauOnly(!bureaOnly)} className={`h-9 px-4 rounded-md border text-sm font-semibold transition-colors flex items-center gap-2 ${bureaOnly ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-muted"}`}>
              <Star className="w-3.5 h-3.5" /> Bureau
            </button>
            {hasFilters && (
              <button onClick={resetFilters} className="h-9 w-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Aucun membre ne correspond.</p>
            <button onClick={resetFilters} className="mt-3 text-sm text-primary hover:underline">Réinitialiser</button>
          </div>
        )}

        {/* ── Trombinoscope ── */}
        {filtered.length > 0 && viewMode === "trombi" && (
          <div className="flex flex-wrap gap-2">
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(m)} className="flex flex-col items-center gap-0.5 cursor-pointer group" style={{ width: 72 }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/60 shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                  {m.photo
                    ? <img loading="lazy" src={m.photo} alt={m.nom} className="w-full h-full object-cover"
                        style={{ objectPosition: m.photoPosition === "center" ? "center" : "center 15%" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=200`; }} />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-primary-foreground font-heading font-bold text-sm">{m.nom.charAt(0)}</span></div>
                  }
                </div>
                <p className="text-[9px] font-medium text-foreground leading-tight text-center w-full truncate group-hover:text-primary transition-colors">{m.nom.split(" ")[0]}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Grille ── */}
        {filtered.length > 0 && viewMode === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((m, i) => {
              const isOwnCard = session?.email === m.email;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(m)}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group flex items-center gap-3 p-3">

                  {/* Photo petite à gauche */}
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {m.photo
                      ? <img loading="lazy" src={m.photo} alt={m.nom} className="w-full h-full object-cover"
                          style={{ objectPosition: m.photoPosition === "center" ? "center" : "center 15%" }}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=200`; }} />
                      : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60">
                          <span className="text-primary-foreground font-heading font-bold text-xl">{m.nom.charAt(0)}</span>
                        </div>
                    }
                  </div>

                  {/* Infos à droite */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug truncate">{m.nom}</h3>
                      {m.bureau && <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Bureau</span>}
                      {isOwnCard && <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">Moi</span>}
                    </div>
                    {m.profession && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{m.profession}</p>
                      </div>
                    )}
                    {m.ville && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{m.ville}{m.pays && m.pays !== "Togo" ? `, ${m.pays}` : ""}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      <AnimatePresence>
        {selected && !editingMember && (
          <MemberModal member={selected} session={session}
            onClose={() => setSelected(null)}
            onEdit={() => setEditingMember(selected)} />
        )}
        {editingMember && (
          <EditMemberModal member={editingMember}
            isAdmin={isAdmin}
            onClose={() => setEditingMember(null)}
            onSave={(data) => handleSaveMember(editingMember, data)} />
        )}
        {showAddForm    && <AddMemberModal onClose={() => setShowAddForm(false)} onSubmit={handleSubmitNew} />}
        {showValidation && <ValidationModal pending={pendingMembers} onValidate={validateMember} onReject={rejectMember} onClose={() => setShowValidation(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════
   FICHE MEMBRE
════════════════════════════════════════ */
function MemberModal({ member, onClose, session, onEdit }) {
  const isOwnCard = session?.email === member.email;
  const isAdmin   = session?.role === "admin";

  return (
    <Overlay onClose={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl border border-border shadow-2xl max-w-lg w-full overflow-hidden relative">

        <div className="relative h-80 bg-muted">
          {member.photo
            ? <img src={member.photo} alt={member.nom} className="w-full h-full object-cover"
                style={{ objectPosition: member.photoPosition === "center" ? "50% 50%" : "50% 20%" }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nom)}&background=064e3b&color=6ee7b7&size=400`; }} />
            : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60">
                <span className="text-primary-foreground font-heading font-bold text-6xl">{member.nom.charAt(0)}</span>
              </div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          {member.bureau && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900">
              Bureau exécutif
            </span>
          )}
          <div className="flex items-center gap-2 absolute top-4 right-4">
            {(isOwnCard || isAdmin) && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors">
                <Edit2 className="w-3 h-3" /> Modifier
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-heading text-xl font-bold text-white">{member.nom}</h3>
            <p className="text-emerald-300 text-sm font-semibold mt-0.5">{member.role}</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {member.profession && (
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Profession</p>
              <p className="text-sm text-foreground">{member.profession}</p>
            </div>
          )}
          <div className="space-y-2.5">
            {(member.ville || member.pays) && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{[member.ville, member.pays].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {member.anniversaire && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">🎂</span>
                <span className="text-foreground">{member.anniversaire}</span>
              </div>
            )}
            {session && member.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${member.email}`} className="text-primary hover:underline break-all">{member.email}</a>
              </div>
            )}
            {session && (member.telephone || member.tel) && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${member.telephone || member.tel}`} className="text-primary hover:underline">{member.telephone || member.tel}</a>
              </div>
            )}
            {member.linkedin && (
              <div className="flex items-center gap-3 text-sm">
                <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">LinkedIn</a>
              </div>
            )}
          </div>
          {!session && (
            <p className="text-xs text-muted-foreground italic p-3 bg-muted/40 rounded-xl">
              Connectez-vous pour voir les coordonnées.
            </p>
          )}
        </div>
      </motion.div>
    </Overlay>
  );
}

/* ════════════════════════════════════════
   ÉDITION DE SA PROPRE FICHE
════════════════════════════════════════ */
function EditMemberModal({ member, onClose, onSave, isAdmin }) {
  const [form, setForm] = useState({
    nom:          member.nom          || "",
    role:         member.role         || "",
    profession:   member.profession   || "",
    ville:        member.ville        || "",
    pays:         member.pays         || "",
    telephone:    member.telephone    || "",
    anniversaire: member.anniversaire || "",
    linkedin:     member.linkedin     || "",
    photo:        member.photo        || "",
  });
  const fileRef = useRef();

  async function handlePhotoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setForm(f => ({ ...f, photo: compressed }));
  }

  return (
    <Overlay onClose={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Modifier la fiche</h2>
              <p className="text-muted-foreground text-xs">{member.nom}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Champs admin uniquement */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nom complet</label>
                <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Rôle / Titre</label>
                <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50" />
              </div>
            </div>
          )}

          {[
            { label: "Profession", name: "profession", placeholder: "Ex : Avocat au Barreau du Togo" },
            { label: "Ville", name: "ville", placeholder: "Ex : Lomé" },
            { label: "Pays", name: "pays", placeholder: "Ex : Togo" },
            { label: "Téléphone", name: "telephone", placeholder: "+228 XX XX XX XX" },
            { label: "Anniversaire", name: "anniversaire", placeholder: "Ex : 15 mars" },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
              <input value={form[name]} onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50" />
            </div>
          ))}

          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">LinkedIn</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-input bg-background focus-within:border-primary/50 transition-colors">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input type="url" value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
                className="flex-1 text-sm text-foreground bg-transparent focus:outline-none" />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Photo</label>
            <input value={form.photo?.startsWith("data:") ? "" : (form.photo || "")}
              onChange={e => setForm(f => ({ ...f, photo: e.target.value }))}
              placeholder="https://... (URL)"
              className="w-full px-3 py-2.5 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50 mb-2" />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors font-medium">
                <Upload className="w-3.5 h-3.5" /> Uploader
              </button>
              <span className="text-xs text-muted-foreground">ou coller une URL</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
            {form.photo && (
              <img src={form.photo} alt="" className="mt-2 h-16 rounded-xl object-cover border border-border"
                onError={e => e.target.style.display="none"} />
            )}
          </div>

          {!isAdmin && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 italic">
              Le nom et le rôle sont gérés par l'administrateur.
            </p>
          )}
        </div>

        <div className="p-6 border-t border-border flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-colors">
            Annuler
          </button>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </motion.div>
    </Overlay>
  );
}

/* ════════════════════════════════════════
   FORMULAIRE AJOUT MEMBRE
════════════════════════════════════════ */
const EMPTY_FORM = { nom: "", profession: "", ville: "Lomé", pays: "Togo", email: "", telephone: "", anniversaire: "", role: "Membre actif", photo: "", linkedin: "" };

function AddMemberModal({ onClose, onSubmit }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [step,   setStep]   = useState(1);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  async function handlePhotoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setForm(f => ({ ...f, photo: compressed }));
  }

  function validate() {
    const e = {};
    if (!form.nom.trim())        e.nom        = "Le nom est obligatoire";
    if (!form.profession.trim()) e.profession = "La profession est obligatoire";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setStep(2);
  }

  return (
    <Overlay onClose={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Nouveau membre</h2>
              <p className="text-muted-foreground text-xs">{step === 1 ? "Renseignez les informations" : "Confirmez avant d'envoyer"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex px-6 pt-4 gap-2">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {[
              { label: "Nom complet", name: "nom", placeholder: "Ex : Jean DUPONT", required: true },
              { label: "Profession", name: "profession", placeholder: "Ex : Avocat au Barreau du Togo", required: true },
              { label: "Email", name: "email", placeholder: "email@exemple.com", type: "email", required: true },
              { label: "Téléphone", name: "telephone", placeholder: "+228 XX XX XX XX" },
              { label: "Anniversaire", name: "anniversaire", placeholder: "Ex : 15 mars" },
            ].map(({ label, name, placeholder, type = "text", required }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {label} {required && <span className="text-primary">*</span>}
                </label>
                <input type={type} value={form[name]} onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
                  placeholder={placeholder}
                  className={`w-full px-3 py-2.5 rounded-xl border text-foreground text-sm bg-background focus:outline-none transition-colors ${errors[name] ? "border-red-400" : "border-input focus:border-primary/50"}`} />
                {errors[name] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors[name]}</p>
                )}
              </div>
            ))}

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Photo</label>
              <input value={form.photo?.startsWith("data:") ? "" : (form.photo || "")}
                onChange={(e) => setForm(f => ({ ...f, photo: e.target.value }))}
                placeholder="https://... (URL de la photo)"
                className="w-full px-3 py-2.5 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50 mb-2" />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileRef.current.click()}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors font-medium">
                  <Upload className="w-3.5 h-3.5" /> Uploader une photo
                </button>
                <span className="text-xs text-muted-foreground">ou coller une URL ci-dessus</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
              {form.photo && (
                <img src={form.photo} alt="" className="mt-2 h-16 rounded-xl object-cover border border-border"
                  onError={e => e.target.style.display="none"} />
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">LinkedIn (optionnel)</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-input bg-background focus-within:border-primary/50 transition-colors">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input type="url" value={form.linkedin} onChange={(e) => setForm(f => ({ ...f, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="flex-1 text-sm text-foreground bg-transparent focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: "Ville", name: "ville", placeholder: "Lomé" }, { label: "Pays", name: "pays", placeholder: "Togo" }].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
                  <input value={form[name]} onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))} placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Rôle</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-input text-foreground text-sm bg-background focus:outline-none focus:border-primary/50">
                <option>Membre actif</option>
                <option>Membre active</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/60 flex-shrink-0">
                <img src={form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom)}&background=064e3b&color=6ee7b7&size=56`}
                  alt={form.nom} className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nom)}&background=064e3b&color=6ee7b7&size=56`; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{form.nom}</p>
                <p className="text-primary text-xs mt-0.5">{form.role}</p>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{form.profession}</p>
                <p className="text-muted-foreground text-xs">{form.ville}, {form.pays}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-semibold">En attente de validation</p>
                <p className="text-amber-700 text-xs mt-0.5">Un administrateur devra valider cette fiche avant qu'elle apparaisse dans l'annuaire.</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-border flex gap-3 justify-end">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-colors">
              Modifier
            </button>
          )}
          <button onClick={step === 1 ? handleNext : () => onSubmit(form)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
            {step === 1 ? <><span>Suivant</span><ChevronRight className="w-4 h-4" /></> : <><Check className="w-4 h-4" /><span>Soumettre</span></>}
          </button>
        </div>
      </motion.div>
    </Overlay>
  );
}

/* ════════════════════════════════════════
   VALIDATION ADMIN
════════════════════════════════════════ */
function ValidationModal({ pending, onValidate, onReject, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Demandes en attente</h2>
              <p className="text-muted-foreground text-xs">{pending.length} adhésion{pending.length > 1 ? "s" : ""} à valider</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {pending.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Check className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune demande en attente</p>
            </div>
          )}
          {pending.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img loading="lazy" src={m.photo} alt={m.nom} className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=48`; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{m.nom}</p>
                <p className="text-muted-foreground text-xs truncate">{m.profession}</p>
                <p className="text-muted-foreground text-xs">{m.ville}, {m.pays}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onReject(m.id)} className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={() => onValidate(m)} className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      {children}
    </motion.div>
  );
}
