import { motion } from "framer-motion";
import {
  Search, Users, Plus, Upload, Download, Images, FileText,
  Link2, MapPin, Edit2, Trash2,
} from "lucide-react";
import { FormPanel, ImgField, Field, inp } from "./shared.jsx";
import { genererTrombinoscope } from "../../lib/documentGenerators";

/*
 * Onglet « Membres » : barre d'outils, formulaires d'ajout/édition et tableau.
 * Composant présentationnel — la donnée et les actions (CRUD, import CSV,
 * exports, dialogues) restent gérées par Dashboard.jsx et passent en props.
 * Les modales partagées (fiche détail, renouvellement, attestation, confirm)
 * vivent au niveau de Dashboard.jsx : on déclenche ici via les setters reçus.
 */
export default function MembresSection({
  search, setSearch, filteredMembers, cotisationsAnnee, currentYear, allMembers,
  addingMember, setAddingMember, handleSaveNewMember,
  editingMember, setEditingMember, handleSaveEditMember,
  setMemberDetail, setAttestationDialog, setConfirmDialog, deleteMember,
  csvInputRef, handleCsvUpload, exportMembresExcel, setRenewDialog,
  isSeeded, seedFromStatic, memberSaving,
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/8 rounded-xl border border-primary/15">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-primary">{filteredMembers.length}</span>
          <span className="text-xs text-primary/70">membre{filteredMembers.length !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={() => setAddingMember({ nom: "", profession: "", ville: "", pays: "", email: "", telephone: "", linkedin: "", anneeObtention: "", photo: "", notes_internes: "" })}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
        <button onClick={() => csvInputRef.current?.click()}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <Upload className="w-4 h-4" /> Importer CSV
        </button>
        <button onClick={exportMembresExcel}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-emerald-500/25 bg-emerald-500/15 text-sm font-medium hover:bg-emerald-100 transition-colors text-emerald-400">
          <Download className="w-4 h-4" /> Exporter Excel
        </button>
        <button onClick={() => genererTrombinoscope(allMembers)}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-indigo-500/25 bg-indigo-500/15 text-sm font-medium hover:bg-indigo-100 transition-colors text-indigo-400">
          <Images className="w-4 h-4" /> Trombinoscope
        </button>
        <button onClick={() => setRenewDialog(true)}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-amber-500/25 bg-amber-500/15 text-sm font-medium hover:bg-amber-100 transition-colors text-amber-400"
          title="Renouveler la date de validité de toutes les attestations">
          <FileText className="w-4 h-4" /> Attestations
        </button>
        <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
        {!isSeeded && (
          <button onClick={seedFromStatic} disabled={memberSaving}
            className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-60">
            {memberSaving
              ? <><div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Migration…</>
              : <>☁️ Migrer les données initiales</>}
          </button>
        )}
      </div>

      {addingMember && (
        <FormPanel title="Nouveau membre" onClose={() => setAddingMember(null)} onSave={handleSaveNewMember}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom complet" required><input className={inp} value={addingMember.nom} onChange={e => setAddingMember(p => ({ ...p, nom: e.target.value }))} placeholder="Prénom NOM" /></Field>
            <Field label="Profession"><input className={inp} value={addingMember.profession} onChange={e => setAddingMember(p => ({ ...p, profession: e.target.value }))} /></Field>
            <Field label="Ville"><input className={inp} value={addingMember.ville} onChange={e => setAddingMember(p => ({ ...p, ville: e.target.value }))} /></Field>
            <Field label="Pays"><input className={inp} value={addingMember.pays} onChange={e => setAddingMember(p => ({ ...p, pays: e.target.value }))} /></Field>
            <Field label="Email"><input className={inp} type="email" value={addingMember.email} onChange={e => setAddingMember(p => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Téléphone"><input className={inp} value={addingMember.telephone} onChange={e => setAddingMember(p => ({ ...p, telephone: e.target.value }))} /></Field>
            <Field label="Année d'obtention du diplôme"><input className={inp} value={addingMember.anneeObtention} onChange={e => setAddingMember(p => ({ ...p, anneeObtention: e.target.value }))} placeholder="ex: 2005" /></Field>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn</label>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={addingMember.linkedin} onChange={e => setAddingMember(p => ({ ...p, linkedin: e.target.value }))} />
              </div>
            </div>
            <div className="md:col-span-2"><ImgField label="Photo" value={addingMember.photo} onChange={v => setAddingMember(p => ({ ...p, photo: v }))} /></div>
            <div className="md:col-span-2">
              <Field label="Notes internes (admin uniquement)">
                <textarea className={inp} rows={2} placeholder="Notes confidentielles, visibles uniquement par l'admin…"
                  value={addingMember.notes_internes || ""}
                  onChange={e => setAddingMember(p => ({ ...p, notes_internes: e.target.value }))} />
              </Field>
            </div>
          </div>
        </FormPanel>
      )}

      {editingMember && (
        <FormPanel title={`Modifier — ${editingMember.nom}`} onClose={() => setEditingMember(null)} onSave={handleSaveEditMember}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom complet"><input className={inp} value={editingMember.nom || ""} onChange={e => setEditingMember(p => ({ ...p, nom: e.target.value }))} /></Field>
            <Field label="Profession"><input className={inp} value={editingMember.profession || ""} onChange={e => setEditingMember(p => ({ ...p, profession: e.target.value }))} /></Field>
            <Field label="Ville"><input className={inp} value={editingMember.ville || ""} onChange={e => setEditingMember(p => ({ ...p, ville: e.target.value }))} /></Field>
            <Field label="Pays"><input className={inp} value={editingMember.pays || ""} onChange={e => setEditingMember(p => ({ ...p, pays: e.target.value }))} /></Field>
            <Field label="Email"><input className={inp} type="email" value={editingMember.email || ""} onChange={e => setEditingMember(p => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Téléphone"><input className={inp} value={editingMember.telephone || editingMember.tel || ""} onChange={e => setEditingMember(p => ({ ...p, telephone: e.target.value, tel: e.target.value }))} /></Field>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn</label>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input className={inp} type="url" placeholder="https://linkedin.com/in/..." value={editingMember.linkedin || ""} onChange={e => setEditingMember(p => ({ ...p, linkedin: e.target.value }))} />
              </div>
            </div>
            <div className="md:col-span-2"><ImgField label="Photo" value={editingMember.photo} onChange={v => setEditingMember(p => ({ ...p, photo: v }))} /></div>
            <div className="md:col-span-2">
              <Field label="Notes internes (admin uniquement)">
                <textarea className={inp} rows={2} placeholder="Notes confidentielles, visibles uniquement par l'admin…"
                  value={editingMember.notes_internes || ""}
                  onChange={e => setEditingMember(p => ({ ...p, notes_internes: e.target.value }))} />
              </Field>
            </div>
          </div>
        </FormPanel>
      )}

      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-5 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_auto_auto] gap-4 items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membre</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Profession</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:block">Localisation</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden xl:block">Cotis. {currentYear}</span>
          <span></span>
        </div>
        <div className="divide-y divide-border/60">
          {filteredMembers.map((m, i) => {
            const cot = cotisationsAnnee.find(c => String(c.member_id) === String(m.id));
            const cotStatut = cot?.statut ?? "en_attente";
            const COT_CFG = {
              "payé":       { label: "Payé",       cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
              "partiel":    { label: "Partiel",    cls: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
              "en_attente": { label: "En attente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
              "exempté":    { label: "Exempté",    cls: "bg-muted/60 text-muted-foreground border-border" },
            }[cotStatut] ?? { label: cotStatut, cls: "bg-muted text-muted-foreground border-border" };
            return (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="group grid grid-cols-[2fr_2fr_1fr_1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-primary/[0.03] transition-all relative">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r scale-y-0 group-hover:scale-y-100 transition-transform" />
              <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setMemberDetail(m)}>
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/20 transition-all">
                  <img
                    src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`}
                    alt={m.nom} className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=40`; }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{m.nom}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email || "—"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 hidden md:block">{m.profession || "—"}</p>
              <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{m.ville}{m.pays ? `, ${m.pays}` : ""}</span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  m.bureau ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" :
                  m.status === "validated" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                  "bg-primary/8 text-primary border border-primary/15"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.bureau ? "bg-amber-500" : m.status === "validated" ? "bg-emerald-500" : "bg-primary"}`} />
                  {m.bureau ? "Bureau" : m.status === "validated" ? "Validé" : "Actif"}
                </span>
              </div>
              <div className="hidden xl:block">
                <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border ${COT_CFG.cls}`}>
                  {COT_CFG.label}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setAttestationDialog(m)} title="Attestation de membre"
                  className="w-7 h-7 rounded-lg hover:bg-amber-500/15 flex items-center justify-center text-muted-foreground hover:text-amber-400 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingMember({ ...m })} className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setConfirmDialog({ title: `Supprimer ${m.nom} ?`, message: "Cette action est irréversible.", onConfirm: () => { deleteMember(m.id); setConfirmDialog(null); } })} className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
