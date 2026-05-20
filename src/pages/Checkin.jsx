import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, MapPin, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";

export default function Checkin() {
  const { id } = useParams();
  const [event, setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm]     = useState({ nom: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    supabase
      .from("evenements")
      .select("id, titre, date, heures, lieu, image")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setEvent(data);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nom.trim()) return;
    setSaving(true);

    // Vérifier si déjà enregistré (même email)
    if (form.email.trim()) {
      const { data: existing } = await supabase
        .from("evenement_presences")
        .select("id")
        .eq("evenement_id", id)
        .eq("email", form.email.trim())
        .maybeSingle();
      if (existing) { setSaving(false); setAlready(true); return; }
    }

    // Auto-lier au membre si email connu
    let membre_id = null;
    if (form.email.trim()) {
      const { data: membre } = await supabase
        .from("members")
        .select("id")
        .eq("email", form.email.trim())
        .maybeSingle();
      if (membre) membre_id = membre.id;
    }

    await supabase.from("evenement_presences").insert({
      evenement_id: id,
      nom:          form.nom.trim(),
      email:        form.email.trim() || null,
      membre_id,
      methode:      "qr",
    });
    setSaving(false);
    setDone(true);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a3d28] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#0a3d28] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-white font-bold text-lg">Événement introuvable</p>
      <p className="text-white/60 text-sm mt-2">Ce QR code n'est pas valide ou l'événement a été supprimé.</p>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-[#0a3d28] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-white text-2xl font-bold mb-2">Présence enregistrée !</h1>
      <p className="text-white/70 text-base mb-1">Bienvenue, <span className="font-semibold text-white">{form.nom}</span></p>
      <p className="text-white/50 text-sm mt-4">{event.titre}</p>
    </div>
  );

  if (already) return (
    <div className="min-h-screen bg-[#0a3d28] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-400/20 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-amber-400" />
      </div>
      <h1 className="text-white text-2xl font-bold mb-2">Déjà enregistré !</h1>
      <p className="text-white/70 text-sm">Votre présence à cet événement a déjà été comptabilisée.</p>
      <button onClick={() => setAlready(false)} className="mt-6 text-xs text-white/40 underline">Enregistrer avec un autre email</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a3d28] flex flex-col">
      {/* En-tête événement */}
      {event.image && (
        <div className="h-40 w-full overflow-hidden flex-shrink-0">
          <img src={event.image} alt={event.titre} className="w-full h-full object-cover opacity-60" />
        </div>
      )}

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        {/* Logo + Association */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/Logo%20Redesign1.png" alt="MBP" className="h-10 w-auto" onError={e => e.target.style.display = "none"} />
          <div>
            <p className="text-white/90 text-xs font-semibold tracking-wide uppercase">Ma Belle Promo</p>
            <p className="text-white/50 text-xs">Check-in événement</p>
          </div>
        </div>

        {/* Infos événement */}
        <div className="mb-8">
          <h1 className="text-white text-xl font-bold leading-tight mb-3">{event.titre}</h1>
          <div className="space-y-1.5">
            {event.date && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{event.date}{event.heures ? ` · ${event.heures}` : ""}</span>
              </div>
            )}
            {event.lieu && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{event.lieu}</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1.5">Nom complet *</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              placeholder="Votre nom et prénom"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1.5">
              Email <span className="text-white/40 font-normal">(optionnel — pour liaison avec votre compte)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="votre@email.com"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.nom.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Enregistrer ma présence
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-8">
          Association FDD Ma Belle Promo · Lomé, Togo
        </p>
      </div>
    </div>
  );
}
