import { CHARTE, CHARTE_VERSION, CHARTE_DATE } from "@/lib/charteBenevolat";

// Rendu de la charte à partir de la source unique (charteBenevolat.js).
// Réutilisé par la page publique et par la modale du formulaire.
export default function CharteContent({ showSommaire = true }) {
  return (
    <div className="space-y-10 text-foreground">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Version {CHARTE_VERSION} · en vigueur au {CHARTE_DATE}
      </p>

      {/* Préambule */}
      <section id="preambule" className="space-y-3 scroll-mt-24">
        <h2 className="font-heading text-2xl font-bold text-foreground">Préambule</h2>
        {CHARTE.preambule.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">{p}</p>
        ))}
      </section>

      {/* Sommaire */}
      {showSommaire && (
        <nav className="rounded-2xl border border-border bg-card/50 p-5">
          <p className="font-heading font-bold text-foreground mb-3">Sommaire</p>
          <ol className="space-y-1.5">
            {CHARTE.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-primary hover:underline">
                  {s.num}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Sections */}
      {CHARTE.sections.map((s) => (
        <section key={s.id} id={s.id} className="space-y-4 scroll-mt-24">
          <h2 className="font-heading text-2xl font-bold text-foreground border-b-2 border-accent/60 pb-2">
            {s.num}. {s.title}
          </h2>
          {s.subs.map((sub) => (
            <div key={sub.title} className="space-y-1.5">
              <h3 className="font-heading text-lg font-semibold text-foreground">{sub.title}</h3>
              <ul className="space-y-1.5 pl-1">
                {sub.items.map((it, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-muted-foreground">
                    <span className="text-accent mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
