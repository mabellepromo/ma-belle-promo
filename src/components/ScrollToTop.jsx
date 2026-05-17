import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { scrollToTop } from "./SmoothScroll";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-opacity hover:opacity-80"
          style={{ background: "var(--brand-dark-mid)", border: "1px solid rgba(45,122,82,0.30)" }}
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-4 h-4 text-primary" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
