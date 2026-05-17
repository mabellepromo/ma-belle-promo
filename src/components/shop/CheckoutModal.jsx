import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Lock, Loader, CheckCircle, Copy, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const fmt = (n) => n.toLocaleString("fr-FR") + " FCFA";

const METHODS = [
  { id: "card",   label: "Carte bancaire",   icon: "💳", desc: "Visa · Mastercard · Carte prépayée",      color: "#3b82f6" },
  { id: "paypal", label: "PayPal",            icon: "🅿️", desc: "Paiement sécurisé via PayPal",            color: "#003087" },
  { id: "wave",   label: "Wave",              icon: "〰️", desc: "Paiement mobile — Togo, Côte d'Ivoire, Sénégal", color: "#2563eb" },
  { id: "tmoney", label: "T-Money",           icon: "🔵", desc: "Paiement mobile Togocel",                  color: "#1d4ed8" },
  { id: "flooz",  label: "Flooz",             icon: "🟢", desc: "Paiement mobile Moov Africa Togo",         color: "#16a34a" },
  { id: "wire",   label: "Virement ECOBANK",  icon: "🏦", desc: "Virement bancaire — traitement 1–3 jours", color: "#2d7a52" },
];

function Steps({ step }) {
  const labels = ["Infos", "Paiement", "Détails", "✓"];
  return (
    <div className="flex items-center gap-0 mb-6">
      {labels.map((l, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            animate={{ scale: i === step ? 1.1 : 1 }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all"
            style={{
              background: i < step ? "#2d7a52" : i === step ? "linear-gradient(135deg,#2d7a52,#1a5e38)" : "rgba(255,255,255,0.07)",
              color: i <= step ? "#000" : "rgba(255,255,255,0.25)",
              boxShadow: i === step ? "0 0 12px rgba(45,122,82,0.40)" : "none",
            }}
          >
            {i < step ? "✓" : i + 1}
          </motion.div>
          {i < labels.length - 1 && (
            <div className="w-8 h-px mx-1 transition-all" style={{ background: i < step ? "#2d7a52" : "rgba(255,255,255,0.08)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

const inputCls = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(45,122,82,0.18)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "white",
  fontSize: 14,
  outline: "none",
};

function CardForm({ onPay, loading }) {
  const [num, setNum]       = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv]       = useState("");
  const [name, setName]     = useState("");

  const fmtNum = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v) => { const r = v.replace(/\D/g, "").slice(0, 4); return r.length >= 3 ? r.slice(0,2)+"/"+r.slice(2) : r; };
  const valid = num.replace(/\s/g,"").length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim().length >= 2;

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-center py-1 px-3 rounded-full mb-2"
        style={{ background: "rgba(251,191,36,0.08)", color: "rgba(251,191,36,0.60)", border: "1px solid rgba(251,191,36,0.18)" }}>
        ⚠️ Simulation — aucun débit réel ne sera effectué
      </p>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>Titulaire</label>
        <input style={inputCls} placeholder="NOM Prénom" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>Numéro de carte</label>
        <input style={inputCls} placeholder="1234 5678 9012 3456" value={num}
          onChange={e => setNum(fmtNum(e.target.value))} inputMode="numeric" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>Expiration</label>
          <input style={inputCls} placeholder="MM/AA" value={expiry}
            onChange={e => setExpiry(fmtExp(e.target.value))} inputMode="numeric" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>CVV</label>
          <input style={inputCls} placeholder="•••" type="password" maxLength={4} value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
        </div>
      </div>
      <motion.button
        whileHover={valid ? { scale: 1.02 } : {}}
        whileTap={valid ? { scale: 0.97 } : {}}
        onClick={() => valid && !loading && onPay()}
        disabled={!valid || loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-all"
        style={{
          background: valid ? "linear-gradient(135deg,#2d7a52,#1a5e38)" : "rgba(255,255,255,0.06)",
          color: valid ? "#000" : "rgba(255,255,255,0.25)",
          cursor: valid ? "pointer" : "not-allowed",
        }}
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
        {loading ? "Traitement en cours…" : "Payer maintenant"}
      </motion.button>
    </div>
  );
}

function MobileForm({ method, onPay, loading }) {
  const [phone, setPhone] = useState("");
  const valid = phone.replace(/\D/g,"").length >= 8;
  const colors = { wave: "#2563eb", tmoney: "#1d4ed8", flooz: "#16a34a" };
  const c = colors[method] || "#2d7a52";

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 text-sm text-center" style={{ background: `${c}12`, border: `1px solid ${c}30`, color: "rgba(255,255,255,0.55)" }}>
        Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>Numéro de téléphone</label>
        <input style={{ ...inputCls, borderColor: `${c}35` }}
          placeholder="+228 90 00 00 00" value={phone} onChange={e => setPhone(e.target.value)} type="tel" inputMode="tel" />
      </div>
      <motion.button
        whileHover={valid ? { scale: 1.02 } : {}}
        whileTap={valid ? { scale: 0.97 } : {}}
        onClick={() => valid && !loading && onPay()}
        disabled={!valid || loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: valid ? `linear-gradient(135deg,${c},${c}bb)` : "rgba(255,255,255,0.06)",
          color: valid ? "#fff" : "rgba(255,255,255,0.25)",
          cursor: valid ? "pointer" : "not-allowed",
        }}
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Envoi de la demande…" : "Confirmer le paiement"}
      </motion.button>
    </div>
  );
}

function PayPalForm({ onPay, loading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5 text-center" style={{ background: "rgba(0,48,135,0.18)", border: "1px solid rgba(0,48,135,0.40)" }}>
        <div className="text-4xl mb-2">🅿️</div>
        <p className="font-heading text-white font-bold mb-1">PayPal</p>
        <p className="text-white/40 text-xs">Vous allez être redirigé vers PayPal pour finaliser votre paiement de façon sécurisée.</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => !loading && onPay()}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: "#003087", color: "#fff" }}
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Redirection PayPal…" : "Continuer avec PayPal →"}
      </motion.button>
    </div>
  );
}

function WireForm({ total }) {
  const [copied, setCopied] = useState(null);
  const copy = (val, key) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const rows = [
    { label: "Titulaire",   value: "ASSOCIATION MA BELLE PROMO MBP", key: "nom" },
    { label: "Banque",      value: "ECOBANK Togo",                   key: "banque" },
    { label: "IBAN",        value: "TG53 TG05 5017 1014 1766 3880 0153", key: "iban", mono: true },
    { label: "Swift / BIC", value: "ECOCTGTGXXX",                   key: "bic",  mono: true },
    { label: "Montant",     value: fmt(total),                       key: "mt" },
    { label: "Référence",   value: "BOUTIQUE MBP — [Votre nom]",    key: "ref" },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(45,122,82,0.18)" }}>
        <div className="px-4 py-2.5" style={{ background: "rgba(45,122,82,0.08)", borderBottom: "1px solid rgba(45,122,82,0.10)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#7db89a" }}>Coordonnées bancaires</p>
        </div>
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div>
              <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{r.label}</p>
              <p className={`text-white text-xs font-semibold ${r.mono ? "font-mono" : ""}`}>{r.value}</p>
            </div>
            <button onClick={() => copy(r.value, r.key)}
              className="w-6 h-6 flex items-center justify-center rounded-md transition-colors ml-2 flex-shrink-0"
              style={{ color: copied === r.key ? "#2d7a52" : "rgba(255,255,255,0.20)" }}
              title="Copier">
              {copied === r.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center" style={{ color: "rgba(45,122,82,0.55)" }}>
        Votre commande sera traitée à réception du virement (1–3 jours ouvrés).
      </p>
    </div>
  );
}

export default function CheckoutModal() {
  const { items, total, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  const [step, setStep]     = useState(0);
  const [buyer, setBuyer]   = useState({ nom: "", email: "" });
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  const close = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => { setStep(0); setMethod(null); setLoading(false); setBuyer({ nom: "", email: "" }); }, 350);
  };

  const sendConfirmEmail = async (ref, methode, lignesData) => {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:      "order_confirm",
          email:     buyer.email,
          nom:       buyer.nom,
          reference: ref,
          methode,
          total,
          lignes:    lignesData,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Email confirmation failed:", res.status, err);
        toast.warning("Commande enregistrée — email de confirmation non envoyé.");
      }
    } catch (e) {
      console.error("Email confirmation error:", e);
      toast.warning("Commande enregistrée — email de confirmation non envoyé.");
    }
  };

  const handlePay = async () => {
    const isWire = method === "wire";
    const ref = (isWire ? "MBP-WIRE-" : "MBP-") + Date.now().toString(36).toUpperCase();
    const lignesData = items.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty }));
    const payload = {
      reference:         ref,
      acheteur_nom:      buyer.nom,
      acheteur_email:    buyer.email,
      methode_paiement:  method,
      statut:            isWire ? "pending" : "completed",
      total,
      lignes:            lignesData,
    };

    if (isWire) {
      await supabase.from("commandes").insert(payload);
      sendConfirmEmail(ref, method, lignesData);
      clearCart(); setOrderRef(ref); setStep(3); return;
    }

    setLoading(true);
    supabase.from("commandes").insert(payload);
    sendConfirmEmail(ref, method, lignesData);
    setTimeout(() => { setOrderRef(ref); clearCart(); setLoading(false); setStep(3); }, 2400);
  };

  const buyerValid = buyer.nom.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email);

  const slide = { initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -18 }, transition: { duration: 0.22 } };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div key="co-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step < 3 ? close : undefined}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md" />

          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="co-panel"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl p-6 flex flex-col pointer-events-auto"
              style={{
                background: "linear-gradient(160deg, #0d2419 0%, #071510 100%)",
                border: "1px solid rgba(45,122,82,0.20)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.70)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {step > 0 && step < 3 && (
                    <button onClick={() => setStep(s => s - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40">
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <h2 className="font-heading text-white font-bold text-base">
                    {["Vos coordonnées", "Mode de paiement", "Détails du paiement", "Commande confirmée !"][step]}
                  </h2>
                </div>
                {step < 3 && (
                  <button onClick={close}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {step < 3 && <Steps step={step} />}

              <AnimatePresence mode="wait">

                {/* ── STEP 0 : Buyer info ── */}
                {step === 0 && (
                  <motion.div key="s0" {...slide}>
                    <div className="rounded-xl p-3 mb-5 space-y-1.5"
                      style={{ background: "rgba(45,122,82,0.05)", border: "1px solid rgba(45,122,82,0.10)" }}>
                      {items.map(i => (
                        <div key={i.id} className="flex justify-between text-xs">
                          <span className="text-white/50 truncate">{i.emoji} {i.name} ×{i.qty}</span>
                          <span className="font-semibold ml-3 flex-shrink-0" style={{ color: "#7db89a" }}>{fmt(i.price * i.qty)}</span>
                        </div>
                      ))}
                      <div className="pt-1.5 flex justify-between font-bold text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-white">Total</span>
                        <span style={{ color: "#7db89a" }}>{fmt(total)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>Nom complet</label>
                        <input style={inputCls} placeholder="Votre nom complet"
                          value={buyer.nom} onChange={e => setBuyer(b => ({ ...b, nom: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(125,184,154,0.50)" }}>Adresse email</label>
                        <input style={inputCls} placeholder="email@exemple.com" type="email"
                          value={buyer.email} onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))} />
                        <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.20)" }}>
                          Votre confirmation de commande sera envoyée à cette adresse.
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={buyerValid ? { scale: 1.02 } : {}}
                      whileTap={buyerValid ? { scale: 0.97 } : {}}
                      onClick={() => buyerValid && setStep(1)}
                      disabled={!buyerValid}
                      className="w-full py-3.5 rounded-xl font-bold text-sm mt-5 transition-all"
                      style={{
                        background: buyerValid ? "linear-gradient(135deg,#2d7a52,#1a5e38)" : "rgba(255,255,255,0.06)",
                        color: buyerValid ? "#000" : "rgba(255,255,255,0.25)",
                        cursor: buyerValid ? "pointer" : "not-allowed",
                      }}>
                      Choisir mon mode de paiement →
                    </motion.button>
                  </motion.div>
                )}

                {/* ── STEP 1 : Payment method ── */}
                {step === 1 && (
                  <motion.div key="s1" {...slide}>
                    <p className="text-white/30 text-xs mb-4">Choisissez votre moyen de paiement</p>
                    <div className="space-y-2">
                      {METHODS.map(m => (
                        <motion.button key={m.id}
                          whileHover={{ scale: 1.01, x: 3 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => { setMethod(m.id); setStep(2); }}
                          className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors"
                          style={{ background: `${m.color}10`, border: `1px solid ${m.color}25` }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${m.color}1e`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${m.color}10`; }}
                        >
                          <span className="text-2xl w-8 text-center select-none">{m.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold">{m.label}</p>
                            <p className="text-white/35 text-xs mt-0.5">{m.desc}</p>
                          </div>
                          <span className="text-white/25 text-sm flex-shrink-0">›</span>
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-5">
                      <Lock className="w-3 h-3" style={{ color: "rgba(45,122,82,0.40)" }} />
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>Paiement 100% sécurisé · SSL 256 bits · Données chiffrées</p>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2 : Payment details ── */}
                {step === 2 && (
                  <motion.div key="s2" {...slide}>
                    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-xl">{METHODS.find(m => m.id === method)?.icon}</span>
                      <span className="text-white/50 text-sm">{METHODS.find(m => m.id === method)?.label}</span>
                      <span className="ml-auto font-heading font-bold" style={{ color: "#7db89a" }}>{fmt(total)}</span>
                    </div>
                    {method === "card"   && <CardForm onPay={handlePay} loading={loading} />}
                    {method === "paypal" && <PayPalForm onPay={handlePay} loading={loading} />}
                    {(method === "wave" || method === "tmoney" || method === "flooz") && (
                      <MobileForm method={method} onPay={handlePay} loading={loading} />
                    )}
                    {method === "wire" && (
                      <>
                        <WireForm total={total} />
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={handlePay}
                          className="w-full py-3.5 rounded-xl font-bold text-sm mt-4 flex items-center justify-center gap-2"
                          style={{ background: "rgba(45,122,82,0.12)", color: "#7db89a", border: "1px solid rgba(45,122,82,0.25)" }}>
                          J'ai noté les coordonnées — Enregistrer ma commande ✓
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 3 : Success ── */}
                {step === 3 && (
                  <motion.div key="s3"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{
                        background: "radial-gradient(circle, rgba(45,122,82,0.22) 0%, rgba(45,122,82,0.04) 100%)",
                        border: "2px solid rgba(45,122,82,0.40)",
                        boxShadow: "0 0 40px rgba(45,122,82,0.20)",
                      }}>
                      <CheckCircle className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h3 className="font-heading text-white text-xl font-black mb-2">Merci, {buyer.nom.split(" ")[0]} !</h3>
                    <p className="text-white/45 text-sm mb-4">
                      {method === "wire"
                        ? "Votre commande est en attente de réception du virement."
                        : "Votre commande a été traitée avec succès."}
                    </p>
                    <div className="inline-block px-4 py-2.5 rounded-xl mb-5"
                      style={{ background: "rgba(45,122,82,0.07)", border: "1px solid rgba(45,122,82,0.18)" }}>
                      <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(125,184,154,0.45)" }}>Référence commande</p>
                      <p className="font-mono font-bold text-sm" style={{ color: "#7db89a" }}>{orderRef}</p>
                    </div>
                    {buyer.email && (
                      <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.30)" }}>
                        Récapitulatif envoyé à <span style={{ color: "rgba(255,255,255,0.55)" }}>{buyer.email}</span>
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={close}
                      className="px-8 py-3 rounded-xl font-bold text-sm"
                      style={{ background: "linear-gradient(135deg,#2d7a52,#1a5e38)", color: "#000" }}>
                      Retour à la boutique
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
