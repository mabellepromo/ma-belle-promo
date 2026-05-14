import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Printer, BarChart2, Calendar, Users, FileText, TrendingUp, Banknote } from "lucide-react";
import { useCotisations } from "../../hooks/useCotisations";
import { useArticles } from "../../hooks/useArticles";
import { useEvenements } from "../../hooks/useEvenements";

const CURRENT_YEAR = new Date().getFullYear();

export default function RapportAnnuel({ members }) {
  const [annee, setAnnee] = useState(CURRENT_YEAR);
  const years = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 2 - i);

  const { cotisations, loading: cotLoading } = useCotisations(annee);
  const { articles } = useArticles();
  const { evenements } = useEvenements();

  const stats = useMemo(() => {
    const totalMembres  = members?.length ?? 0;
    const bureauMembres = members?.filter(m => m.bureau).length ?? 0;

    const rows = (members ?? []).map(m => {
      const cot = cotisations.find(c => String(c.member_id) === String(m.id));
      return { ...m, statut: cot?.statut ?? "en_attente", cotisation: cot ?? null };
    });

    const payes    = rows.filter(r => r.statut === "payé");
    const exempts  = rows.filter(r => r.statut === "exempté");
    const attente  = rows.filter(r => r.statut === "en_attente");
    const collecte = payes.reduce((s, r) => s + (r.cotisation?.montant || 0), 0);
    const effectif = totalMembres - exempts.length;
    const taux     = effectif > 0 ? Math.round((payes.length / effectif) * 100) : 0;

    const evts        = evenements ?? [];
    const evtsPasses  = evts.filter(e => e.statut?.toLowerCase() === "passé");
    const evtsAVenir  = evts.filter(e => e.statut?.toLowerCase() !== "passé");

    return {
      totalMembres, bureauMembres,
      payes: payes.length, exempts: exempts.length, attente: attente.length,
      collecte, taux,
      evtsPasses, evtsAVenir,
      articlesCount: articles?.length ?? 0,
      rows,
    };
  }, [members, cotisations, evenements, articles]);

  function handlePrint() {
    const dateGen = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const evtsTable = stats.evtsPasses.length > 0
      ? `<table class="table">
          <thead><tr><th>Événement</th><th>Date</th><th>Lieu</th></tr></thead>
          <tbody>
            ${stats.evtsPasses.map(e => `
              <tr>
                <td>${e.titre || "—"}</td>
                <td>${e.date || "—"}</td>
                <td>${e.lieu || "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>`
      : `<p style="font-size:13px;color:#6b7280;">Aucun événement enregistré comme passé pour ${annee}.</p>`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport annuel MBP ${annee}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #111827; background: #fff; padding: 40px; }
    .header { text-align: center; border-bottom: 3px solid #14532d; padding-bottom: 24px; margin-bottom: 32px; }
    .asso-name { font-size: 22px; font-weight: bold; color: #14532d; letter-spacing: 0.5px; }
    .asso-sub  { font-size: 13px; color: #6b7280; margin-top: 6px; }
    .report-title { font-size: 30px; font-weight: bold; color: #111827; margin-top: 16px; }
    .meta { font-size: 12px; color: #9ca3af; margin-top: 8px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 15px; font-weight: bold; color: #14532d; border-left: 4px solid #14532d;
      padding-left: 10px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    .stat-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .stat-value { font-size: 30px; font-weight: bold; color: #111827; font-family: Arial, sans-serif; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; margin-top: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #16a34a; border-radius: 4px; }
    .progress-txt  { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: Arial, sans-serif; }
    .table th { background: #f9fafb; padding: 8px 12px; text-align: left; font-weight: 600;
      border-bottom: 2px solid #e5e7eb; color: #374151; font-size: 11px; text-transform: uppercase; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
    .confidential { background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px;
      padding: 10px 14px; font-size: 12px; color: #92400e; margin-bottom: 24px; font-family: Arial; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb;
      text-align: center; font-size: 11px; color: #9ca3af; font-family: Arial; line-height: 1.8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>

  <div class="header">
    <div class="asso-name">Association Ma Belle Promo (MBP)</div>
    <div class="asso-sub">FDD · Faculté de Droit et de Développement · Université de Lomé · Promotion 1994–2000</div>
    <div class="report-title">Rapport Annuel ${annee}</div>
    <div class="meta">Généré le ${dateGen} — Document confidentiel</div>
  </div>

  <div class="confidential">
    Ce rapport est destiné exclusivement aux membres du bureau exécutif de l'association Ma Belle Promo.
  </div>

  <div class="section">
    <div class="section-title">1. Effectif des membres</div>
    <div class="grid-3">
      <div class="stat-card">
        <div class="stat-value">${stats.totalMembres}</div>
        <div class="stat-label">Membres au total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.bureauMembres}</div>
        <div class="stat-label">Membres du bureau</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalMembres - stats.bureauMembres}</div>
        <div class="stat-label">Membres ordinaires</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Cotisations ${annee}</div>
    <div class="grid-3" style="margin-bottom:14px;">
      <div class="stat-card">
        <div class="stat-value">${stats.payes}</div>
        <div class="stat-label">Ont payé</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${stats.taux}%"></div></div>
        <div class="progress-txt">${stats.taux}% de taux de cotisation</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.attente}</div>
        <div class="stat-label">En attente de paiement</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.collecte.toLocaleString("fr-FR")}</div>
        <div class="stat-label">FCFA collectés</div>
      </div>
    </div>
    ${stats.exempts > 0 ? `<p style="font-size:13px;color:#6b7280;font-family:Arial;">${stats.exempts} membre(s) exempté(s) de cotisation pour ${annee}.</p>` : ""}
  </div>

  <div class="section">
    <div class="section-title">3. Activités</div>
    <div class="grid-2" style="margin-bottom:14px;">
      <div class="stat-card">
        <div class="stat-value">${stats.evtsPasses.length}</div>
        <div class="stat-label">Événements organisés (passés)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.articlesCount}</div>
        <div class="stat-label">Articles publiés (total)</div>
      </div>
    </div>
    ${evtsTable}
  </div>

  ${stats.evtsAVenir.length > 0 ? `
  <div class="section">
    <div class="section-title">4. Événements à venir</div>
    <table class="table">
      <thead><tr><th>Événement</th><th>Date</th><th>Lieu</th></tr></thead>
      <tbody>
        ${stats.evtsAVenir.map(e => `
          <tr>
            <td>${e.titre || "—"}</td>
            <td>${e.date || "—"}</td>
            <td>${e.lieu || "—"}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  </div>
  ` : ""}

  <div class="footer">
    Ma Belle Promo · 12 BP 335 Baguida, Lomé, Togo<br>
    contact@mabellepromo.org · www.mabellepromo.org<br>
    © ${annee} Association Ma Belle Promo — Tous droits réservés
  </div>

</body>
</html>`;

    const win = window.open("", "_blank", "width=960,height=740,scrollbars=yes");
    if (!win) {
      toast.error("Veuillez autoriser les pop-ups pour imprimer le rapport.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }

  const SECTION_CARDS = [
    {
      label: "Membres",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      bar: "bg-blue-500",
      items: [
        { label: "Total membres", value: stats.totalMembres },
        { label: "Membres du bureau", value: stats.bureauMembres },
      ],
    },
    {
      label: "Cotisations " + annee,
      icon: Banknote,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      bar: "bg-emerald-500",
      items: [
        { label: "Ont payé", value: `${stats.payes} / ${stats.totalMembres}` },
        { label: "Total collecté", value: `${stats.collecte.toLocaleString("fr-FR")} FCFA` },
        { label: "Taux", value: `${stats.taux}%` },
      ],
    },
    {
      label: "Activités",
      icon: Calendar,
      color: "text-indigo-400",
      bg: "bg-indigo-500/15",
      bar: "bg-indigo-500",
      items: [
        { label: "Événements passés", value: stats.evtsPasses.length },
        { label: "Articles publiés", value: stats.articlesCount },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> Rapport annuel
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Synthèse imprimable — données en temps réel</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Printer className="w-4 h-4" /> Imprimer le rapport
          </button>
        </div>
      </div>

      {/* Aperçu */}
      {cotLoading ? (
        <div className="p-10 text-center text-muted-foreground text-sm">Chargement des cotisations…</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {SECTION_CARDS.map(({ label, icon: Icon, color, bg, bar, items }) => (
              <div key={label} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                <div className={`h-1 w-full ${bar}`} />
                <div className="p-5">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{label}</p>
                  <div className="space-y-2">
                    {items.map(({ label: l, value }) => (
                      <div key={l} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{l}</span>
                        <span className="text-sm font-bold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                  {label.startsWith("Cotisations") && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.taux}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Événements passés */}
          {stats.evtsPasses.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Événements passés ({stats.evtsPasses.length})
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Événement</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Lieu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.evtsPasses.map((e, i) => (
                    <tr key={e.id || i} className="hover:bg-muted/20">
                      <td className="px-5 py-2.5 font-medium text-foreground">{e.titre || "—"}</td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground hidden md:table-cell">{e.date || "—"}</td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground hidden lg:table-cell">{e.lieu || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-amber-500/15 border border-amber-500/25 rounded-2xl p-4">
            <p className="text-xs text-amber-400 flex items-start gap-2">
              <Printer className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Cliquez sur <strong>Imprimer le rapport</strong> pour ouvrir une version PDF/imprimable mise en page proprement.
              Autorisez les pop-ups si votre navigateur les bloque.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
