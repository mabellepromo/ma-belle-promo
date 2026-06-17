import { useState, useEffect, useRef, useMemo } from "react";
import { Search } from "lucide-react";

// Normalisation insensible à la casse et aux accents pour la recherche.
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/*
 * Palette de commandes du dashboard (Ctrl/Cmd+K).
 * Composant autonome : il enregistre lui-même le raccourci global, gère sa
 * visibilité et la navigation clavier. Il reçoit la liste des onglets et une
 * fonction de sélection — il n'a aucune connaissance de la logique métier.
 */
export default function CommandPalette({ items, onSelect }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  // Ctrl/Cmd+K : ouvre ou ferme la palette depuis n'importe où.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    // Ouverture aussi via un bouton (événement custom) pour la découvrabilité.
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mbp:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mbp:open-palette", onOpen);
    };
  }, []);

  // À l'ouverture : reset de la recherche et focus sur le champ.
  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = norm(query);
    if (!q) return items;
    return items.filter(it => norm(it.label).includes(q) || norm(it.groupLabel).includes(q));
  }, [query, items]);

  // La frappe remet la sélection en haut de liste.
  useEffect(() => { setIndex(0); }, [query]);

  // Garde l'élément sélectionné visible lors de la navigation au clavier.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [index, open]);

  if (!open) return null;

  const choose = (it) => {
    if (!it) return;
    onSelect(it.key);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown")      { e.preventDefault(); setIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter")     { e.preventDefault(); choose(results[index]); }
    else if (e.key === "Escape")    { setOpen(false); }
  };

  return (
    <div className="dark fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/50"
      onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden text-foreground"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Rechercher un onglet…"
            className="flex-1 bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun résultat</p>
          ) : results.map((it, i) => {
            const Icon = it.icon;
            const active = i === index;
            return (
              <button key={it.key} data-idx={i} onMouseEnter={() => setIndex(i)} onClick={() => choose(it)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                  active ? "bg-primary/15" : "hover:bg-muted/40"
                }`}>
                {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "opacity-60"}`} />}
                <span className={`flex-1 truncate ${active ? "text-primary font-semibold" : "text-foreground"}`}>{it.label}</span>
                {it.groupLabel && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0">{it.groupLabel}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
          <span>↑↓ naviguer</span><span>↵ ouvrir</span><span>esc fermer</span>
        </div>
      </div>
    </div>
  );
}
