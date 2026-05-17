import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const fmt = (n) => n.toLocaleString("fr-FR") + " FCFA";

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQty, total, count, openCheckout } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[360px] flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0c1f14 0%, #061208 100%)",
              borderLeft: "1px solid rgba(45,122,82,0.15)",
              boxShadow: "-16px 0 60px rgba(0,0,0,0.60)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(45,122,82,0.10)" }}>
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="font-heading text-white font-bold text-sm">Mon panier</span>
                {count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{ background: "rgba(45,122,82,0.20)", color: "#7db89a" }}>
                    {count} article{count > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Package className="w-12 h-12 mb-3" style={{ color: "rgba(45,122,82,0.15)" }} />
                  <p className="text-white/30 text-sm font-medium">Votre panier est vide</p>
                  <button onClick={() => { setIsCartOpen(false); navigate("/boutique"); }}
                    className="mt-4 text-xs font-semibold hover:underline"
                    style={{ color: "#7db89a" }}>
                    Découvrir la boutique →
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 rounded-xl p-3"
                      style={{ background: "rgba(45,122,82,0.06)", border: "1px solid rgba(45,122,82,0.10)" }}
                    >
                      <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl select-none"
                        style={{ background: item.imgBg || "rgba(45,122,82,0.12)" }}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{item.name}</p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: "#7db89a" }}>{fmt(item.price)}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors text-white/50 hover:text-white hover:bg-white/10">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-xs font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors text-white/50 hover:text-white hover:bg-white/10">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeItem(item.id)}
                            className="ml-auto w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                            style={{ color: "rgba(248,113,113,0.50)" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.10)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "rgba(248,113,113,0.50)"; e.currentTarget.style.background = "transparent"; }}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(45,122,82,0.10)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/40 text-sm">Total</span>
                  <span className="font-heading font-bold text-white text-xl">{fmt(total)}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #2d7a52, #1a5e38)", color: "#000" }}
                >
                  Passer commande <ArrowRight className="w-4 h-4" />
                </motion.button>
                <p className="text-center text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.20)" }}>
                  🔒 Paiement 100% sécurisé — SSL 256 bits
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
