import { useEffect } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";

let lenis = null;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export default function SmoothScroll() {
  const location = useLocation();

  useEffect(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenis = null;
    };
  }, []);

  // Retour en haut à chaque changement de page
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  return null;
}
