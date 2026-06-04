import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, Send, Loader2, Database, PenLine, User, Bot, AlertTriangle, Trash2,
} from "lucide-react";

// Suggestions affichées au démarrage, selon le mode actif
const SUGGESTIONS = {
  data: [
    "Combien de membres sont à jour de cotisation cette année ?",
    "Quel est le solde de trésorerie 2026 ?",
    "Répartition des membres par pays ?",
    "Quels sont les prochains événements ?",
  ],
  content: [
    "Rédige un communiqué pour annoncer notre prochaine assemblée générale.",
    "Résume ce procès-verbal : …",
    "Brouillon d'email de relance pour les cotisations en retard.",
    "Circulaire d'invitation à la rencontre annuelle des diplômés.",
  ],
};

const MODES = [
  { key: "data",    label: "Questions sur les données", Icon: Database },
  { key: "content", label: "Génération de contenu",     Icon: PenLine  },
];

export default function AssistantIA() {
  const [mode,     setMode]     = useState("data");
  const [messages, setMessages] = useState([]); // { role: "user" | "assistant", content }
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const scrollRef = useRef(null);

  // Défilement automatique vers le dernier message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Changer de mode réinitialise la conversation (les contextes ne se mélangent pas)
  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setMessages([]);
    setError(null);
  }

  function resetConversation() {
    setMessages([]);
    setError(null);
  }

  async function sendMessage(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setError(null);
    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const { data, error: fnErr } = await supabase.functions.invoke("assistant-ia", {
        body: {
          mode,
          // On n'envoie que role + content (jamais d'autres champs)
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Erreurs renvoyées par la fonction (403, 429, 500…) arrivent via fnErr.context
      if (fnErr) {
        let serverMsg = fnErr.message;
        try {
          const ctx = await fnErr.context?.json?.();
          if (ctx?.error) serverMsg = ctx.error;
        } catch { /* corps non-JSON : on garde fnErr.message */ }
        throw new Error(serverMsg);
      }
      if (!data?.reply) throw new Error("Réponse vide de l'assistant.");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Entrée = envoyer ; Maj+Entrée = nouvelle ligne
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2a6040, #0a1f12)" }}>
            <Sparkles className="w-5 h-5" style={{ color: "#f0a030" }} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">Assistant IA</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Réservé au bureau · les données restent dans le périmètre de l'association.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={resetConversation}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/40 transition-colors flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" /> Effacer
          </button>
        )}
      </div>

      {/* Toggle de mode */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit mb-4">
        {MODES.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => switchMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Fil de conversation */}
      <div ref={scrollRef}
        className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 space-y-4">

        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "linear-gradient(135deg, #2a6040, #0a1f12)" }}>
              <Sparkles className="w-6 h-6" style={{ color: "#f0a030" }} />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {mode === "data"
                ? "Posez une question sur les données de l'association"
                : "Décrivez le contenu à rédiger"}
            </p>
            <p className="text-xs text-muted-foreground mb-5 max-w-sm">
              {mode === "data"
                ? "L'assistant consulte les chiffres réels (membres, cotisations, trésorerie, événements)."
                : "Résumés de PV, communiqués, emails, circulaires — à partir de votre consigne."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS[mode].map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs text-left px-3 py-2 rounded-xl border border-border bg-background hover:border-primary/40 hover:text-primary text-muted-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              m.role === "user" ? "bg-primary/15" : ""
            }`}
              style={m.role === "assistant"
                ? { background: "linear-gradient(135deg, #2a6040, #0a1f12)" }
                : undefined}>
              {m.role === "user"
                ? <User className="w-4 h-4 text-primary" />
                : <Bot className="w-4 h-4" style={{ color: "#f0a030" }} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                : "bg-muted/50 text-foreground border border-border"
            }`}>
              {m.role === "user" ? m.content : (
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-primary font-medium underline underline-offset-2 hover:opacity-80">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2a6040, #0a1f12)" }}>
              <Bot className="w-4 h-4" style={{ color: "#f0a030" }} />
            </div>
            <div className="bg-muted/50 border border-border rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "data" ? "Consultation des données…" : "Rédaction en cours…"}
            </div>
          </div>
        )}
      </div>

      {/* Bandeau d'erreur */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mt-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed flex-1">{error}</p>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={mode === "data"
            ? "Posez votre question…  (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            : "Votre consigne ou le texte à traiter…"}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-y max-h-40"
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-2 text-center">
        L'IA peut se tromper — vérifiez les informations importantes. Aucune donnée personnelle brute (email, téléphone) n'est transmise au moteur.
      </p>
    </div>
  );
}
