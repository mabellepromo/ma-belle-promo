import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";
import SEO from "../components/SEO";

export default function Verifier() {
  const [params] = useSearchParams();
  const ref = params.get("id") || "";

  const [etat, setEtat] = useState("chargement"); // chargement | valide | invalide | vide
  const [attestation, setAttestation] = useState(null);

  useEffect(() => {
    if (!ref) { setEtat("vide"); return; }

    supabase
      .from("attestations")
      .select("ref, nom, statut, profession, generated_at, valid_until")
      .eq("ref", ref)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) { setEtat("invalide"); return; }
        setAttestation(data);
        const expiry = new Date(data.valid_until);
        expiry.setHours(23, 59, 59);
        setEtat(expiry >= new Date() ? "valide" : "expire");
      });
  }, [ref]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-green-800 flex flex-col items-center justify-center p-6">
      <SEO title="Vérification d'attestation" description="Vérifiez l'authenticité d'une attestation délivrée par l'association Ma Belle Promo." path="/verifier" />

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <img src="/Logo%20Redesign1.png" alt="MBP" className="h-12 w-auto" />
        <div className="text-white">
          <p className="font-bold text-lg leading-tight">l'association Ma Belle Promo (MBP)</p>
          <p className="text-green-300 text-sm">Système de vérification d'attestation</p>
        </div>
      </div>

      {/* Carte résultat */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">

        {etat === "chargement" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-12 h-12 text-green-700 animate-spin" />
            <p className="text-gray-500">Vérification en cours…</p>
          </div>
        )}

        {etat === "vide" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <ShieldCheck className="w-14 h-14 text-gray-300" />
            <h1 className="text-xl font-bold text-gray-700">Aucune référence fournie</h1>
            <p className="text-gray-500 text-sm">
              Scannez le QR code figurant sur l'attestation originale pour lancer la vérification.
            </p>
          </div>
        )}

        {etat === "valide" && attestation && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-1">Attestation valide</h1>
            <p className="text-gray-500 text-sm mb-6">Document authentique émis par l'association Ma Belle Promo (MBP)</p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left space-y-3 mb-6">
              <Row label="Titulaire"   value={attestation.nom} />
              <Row label="Statut"      value={attestation.statut} />
              {attestation.profession && <Row label="Profession" value={attestation.profession} />}
              <Row label="Émis le"     value={new Date(attestation.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
              <Row label="Valide jusqu'au" value={new Date(attestation.valid_until).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
              <Row label="Référence"   value={attestation.ref} mono />
            </div>

            <p className="text-xs text-gray-400">
              Pour toute question : <a href="mailto:contact@mabellepromo.org" className="underline">contact@mabellepromo.org</a>
            </p>
          </>
        )}

        {etat === "expire" && attestation && (
          <>
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-orange-700 mb-1">Attestation expirée</h1>
            <p className="text-gray-500 text-sm mb-6">
              Ce document était valide mais sa période de validité est dépassée.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-left space-y-3">
              <Row label="Titulaire" value={attestation.nom} />
              <Row label="Référence" value={attestation.ref} mono />
              <Row label="Expirée le" value={new Date(attestation.valid_until).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
            </div>
          </>
        )}

        {etat === "invalide" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-700 mb-1">Attestation introuvable</h1>
            <p className="text-gray-500 text-sm mb-4">
              La référence <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{ref}</span> ne correspond à aucun document enregistré.
            </p>
            <p className="text-xs text-gray-400">
              Ce document pourrait être falsifié ou la référence est incorrecte.<br/>
              Contactez <a href="mailto:contact@mabellepromo.org" className="underline">contact@mabellepromo.org</a>
            </p>
          </>
        )}
      </div>

      <Link to="/" className="mt-8 text-green-300 hover:text-white text-sm transition-colors">
        ← Retour au site
      </Link>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-xs text-gray-500 uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-gray-800 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
