import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell, AlertTriangle, Users, BarChart2, TrendingUp, TrendingDown, Minus,
  Check, X, Banknote, Calendar, Wallet, Building2, FileText, Cake, Globe,
  Lock, Shield, Download, ExternalLink,
} from "lucide-react";
import WorldMembersMap from "../../components/dashboard/WorldMembersMap.jsx";
import { openDocUrl } from "../../lib/documentGenerators";
import { requestNotificationPermission } from "../../hooks/useNotifications";

/*
 * Vue d'ensemble du dashboard. Composant purement présentationnel :
 * toutes les données (pilotage, widgets, stats…) sont calculées dans
 * Dashboard.jsx et reçues en props. Aucun hook de données ici, pour ne
 * pas dupliquer les abonnements realtime ni alourdir le premier rendu.
 */
export default function OverviewSection({
  stats, STAT_COLORS, pilotage, currentYear, pendingMembers, setTab,
  notifPermission, setNotifPermission, cotStats, prochainEvenement,
  tresoWidget, prochaineAG, prochainsAnniversaires, membresDormants,
  repartitionGeo, agendaCombine, rejectMember, validateMember,
  session, exportBackup, PROTECTED_PAGES,
}) {
  return (
    <div className="space-y-6">

      {/* Bannière — accent institutionnel or + salutation personnalisée */}
      {(() => {
        const h = new Date().getHours();
        const greeting = h < 18 ? "Bonjour" : "Bonsoir";
        // Prénom = premier mot du nom réel (session.nom = user_metadata.nom ||
        // full_name || préfixe email). Capitalisé. Vide si rien d'exploitable.
        const raw = (session?.nom || "").trim().split(/\s+/)[0];
        const prenom = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
        const GOLD = "#e3c46a";
        return (
          <div className="relative overflow-hidden rounded-2xl px-8 py-8"
            style={{ background: "linear-gradient(135deg, var(--brand-dark) 0%, #1a3d2b 60%, #0f2a1e 100%)" }}>
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(52,211,153,0.08) 0%, transparent 60%)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)" }} />
            <div className="relative flex items-center justify-between gap-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: GOLD }}>
                  Association FDD · Ma Belle Promo
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
                  {greeting}{prenom ? `, ${prenom}` : ""}
                </h1>
                <div className="mt-3 h-px w-16" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
                <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Tableau de bord · Promotion 1994–2000 · Lomé, Togo
                </p>
              </div>
              {/* Monogramme MBP cerclé d'or */}
              <div className="hidden md:flex w-16 h-16 rounded-full flex-shrink-0 items-center justify-center"
                style={{ border: `2px solid ${GOLD}`, boxShadow: `0 0 0 4px rgba(227,196,106,0.08)` }}>
                <span className="font-heading text-lg font-bold tracking-tight" style={{ color: GOLD }}>MBP</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Notifications navigateur */}
      {notifPermission !== "granted" && notifPermission !== "unsupported" && (
        <div className="flex items-center gap-3 bg-emerald-700/40 border border-emerald-600/50 rounded-2xl px-5 py-3.5">
          <Bell className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-200 flex-1">
            {notifPermission === "denied"
              ? "Notifications bloquées — autorisez-les dans les paramètres de votre navigateur."
              : "Activez les notifications pour recevoir les alertes anniversaires et nouvelles demandes."}
          </p>
          {notifPermission === "default" && (
            <button
              onClick={async () => {
                const result = await requestNotificationPermission();
                setNotifPermission(result);
              }}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              Activer
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub, alert, trend, onClick }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            onClick={onClick}
            className={`bg-card rounded-2xl overflow-hidden border border-border shadow-sm group ring-2 ring-transparent ${STAT_COLORS[i].ring} ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" : ""}`}>
            <div className={`h-1 w-full ${STAT_COLORS[i].bar}`} />
            <div className="p-5">
              {alert && <span className="float-right w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1" />}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${STAT_COLORS[i].iconBg}`}>
                <Icon className={`w-4 h-4 ${STAT_COLORS[i].iconCl}`} />
              </div>
              <div className="font-heading text-4xl font-black tracking-tight text-foreground leading-none">{value}</div>
              <div className="text-sm font-semibold mt-1.5 text-foreground">{label}</div>
              <div className="text-xs mt-0.5 text-muted-foreground">{sub}</div>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${trend.value > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {trend.value > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {trend.value > 0 ? `+${trend.value}` : trend.value} {trend.label}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Indicateurs décisionnels — du constat à la décision */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(() => {
          const retardAlerte = pilotage.retardPct > 50 ? "rouge" : pilotage.retardPct > 30 ? "ambre" : "ok";
          const retardCls = retardAlerte === "rouge"
            ? "border-red-500 bg-red-500/25 ring-1 ring-red-500/40"
            : retardAlerte === "ambre"
              ? "border-amber-500 bg-amber-500/25 ring-1 ring-amber-500/40"
              : "border-border";
          const retardTxt = retardAlerte === "rouge"
            ? "text-red-200"
            : retardAlerte === "ambre" ? "text-amber-200" : "text-foreground";
          const engageBas = pilotage.engagementPct < 50;
          return (
            <>
              {/* Cotisations en retard */}
              <div className={`rounded-2xl border p-4 shadow-sm bg-card ${retardCls}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-4 h-4 ${retardTxt}`} />
                  <p className="text-xs font-semibold text-muted-foreground">Cotisations en retard {currentYear}</p>
                </div>
                <div className={`font-heading text-3xl font-black ${retardTxt}`}>{pilotage.retardPct}%</div>
                <p className="text-xs text-muted-foreground mt-0.5">{pilotage.enRetard} membre{pilotage.enRetard > 1 ? "s" : ""} concerné{pilotage.enRetard > 1 ? "s" : ""}</p>
              </div>

              {/* Taux d'engagement */}
              <div className={`rounded-2xl border p-4 shadow-sm bg-card ${engageBas ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${engageBas ? "text-amber-400" : "text-emerald-400"}`} />
                  <p className="text-xs font-semibold text-muted-foreground" title="Part des membres ayant payé ou partiellement payé au moins une cotisation sur les 3 dernières années.">
                    Taux d'engagement (3 ans)
                  </p>
                </div>
                <div className={`font-heading text-3xl font-black ${engageBas ? "text-amber-400" : "text-emerald-400"}`}>{pilotage.engagementPct}%</div>
                <p className="text-xs text-muted-foreground mt-0.5">{pilotage.engagedCount} / {pilotage.total} membres actifs</p>
              </div>

              {/* Évolution du taux de cotisation */}
              <div className="rounded-2xl border border-border p-4 shadow-sm bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs font-semibold text-muted-foreground">Cotisations vs {currentYear - 1}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="font-heading text-3xl font-black text-foreground">{pilotage.tauxCur}%</div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${pilotage.tauxDelta > 0 ? "text-emerald-400" : pilotage.tauxDelta < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    {pilotage.tauxDelta > 0 ? <TrendingUp className="w-3 h-3" /> : pilotage.tauxDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {pilotage.tauxDelta > 0 ? `+${pilotage.tauxDelta}` : pilotage.tauxDelta} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">contre {pilotage.tauxPrev}% l'an dernier</p>
              </div>
            </>
          );
        })()}
      </div>

      {pendingMembers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-amber-300">{pendingMembers.length} demande{pendingMembers.length > 1 ? "s" : ""} en attente</h3>
            <button onClick={() => setTab("pending")} className="ml-auto text-sm text-amber-400 font-semibold hover:underline">Voir tout →</button>
          </div>
          {pendingMembers.slice(0, 2).map(m => (
            <div key={m.id} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border mb-2">
              <div><p className="font-semibold text-sm text-foreground">{m.nom}</p><p className="text-xs text-muted-foreground">{m.profession} · {m.ville}</p></div>
              <div className="flex gap-2">
                <button onClick={() => rejectMember(m.id)} className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20"><X className="w-3.5 h-3.5" /></button>
                <button onClick={() => validateMember(m)} className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20"><Check className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cotisations + Prochain événement */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Taux de cotisation */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-emerald-500" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Cotisations {currentYear}</p>
                  <p className="text-xs text-muted-foreground">{cotStats.payes} / {cotStats.total} membres</p>
                </div>
              </div>
              <span className="font-heading text-2xl font-black text-emerald-400">{cotStats.taux}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${cotStats.taux}%` }} />
            </div>
            <button onClick={() => setTab("cotisations")}
              className="mt-3 text-xs font-semibold text-emerald-400 hover:underline">
              Gérer les cotisations →
            </button>
          </div>
        </div>

        {/* Prochain événement */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-indigo-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-foreground">Prochain événement</p>
            </div>
            {prochainEvenement ? (
              <>
                <p className="font-semibold text-foreground text-sm leading-snug">{prochainEvenement.titre}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {prochainEvenement.date}{prochainEvenement.lieu ? ` · ${prochainEvenement.lieu}` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun événement à venir.</p>
            )}
            <button onClick={() => setTab("evenements")}
              className="mt-3 text-xs font-semibold text-indigo-400 hover:underline">
              Gérer les événements →
            </button>
          </div>
        </div>
      </div>

      {/* Trésorerie + Prochaine AG */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Solde trésorerie */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-amber-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Trésorerie {tresoWidget?.annee ?? currentYear}</p>
                <p className="text-xs text-muted-foreground">Recettes · Dépenses</p>
              </div>
            </div>
            {tresoWidget ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Recettes</span>
                  <span className="text-emerald-400 font-semibold">
                    +{new Intl.NumberFormat("fr-FR").format(tresoWidget.recettes)} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Dépenses</span>
                  <span className="text-red-400 font-semibold">
                    −{new Intl.NumberFormat("fr-FR").format(tresoWidget.depenses)} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                  <span>Solde</span>
                  <span className={tresoWidget.solde >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {new Intl.NumberFormat("fr-FR").format(tresoWidget.solde)} FCFA
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune transaction enregistrée.</p>
            )}
            <button onClick={() => setTab("tresorerie")}
              className="mt-3 text-xs font-semibold text-amber-400 hover:underline">
              Gérer la trésorerie →
            </button>
          </div>
        </div>

        {/* Prochaine AG */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-violet-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-sm font-bold text-foreground">Prochaine Assemblée</p>
            </div>
            {prochaineAG ? (
              <>
                <p className="font-semibold text-foreground text-sm leading-snug">{prochaineAG.titre}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(prochaineAG.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  {prochaineAG.lieu ? ` · ${prochaineAG.lieu}` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune assemblée planifiée.</p>
            )}
            <button onClick={() => setTab("assemblees")}
              className="mt-3 text-xs font-semibold text-violet-400 hover:underline">
              Gérer les assemblées →
            </button>
          </div>
        </div>
      </div>

      {/* Convention de partenariat */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #1b6b45, #9a7118)" }} />
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Convention de Partenariat</p>
              <p className="text-xs text-muted-foreground">Document officiel — 13 articles + 4 annexes · à personnaliser avant signature</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => openDocUrl("/documents/Dossier_Partenariat_MBP.html", "Dossier-Partenariat-MBP.html")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#9a7118", color: "#fff" }}
            >
              <FileText className="w-3.5 h-3.5" /> Dossier
            </button>
            <button
              onClick={() => openDocUrl("/documents/Convention_Partenariat_MBP.html", "Convention-Partenariat-MBP.html")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#1b6b45", color: "#fff" }}
            >
              <FileText className="w-3.5 h-3.5" /> Convention
            </button>
          </div>
        </div>
      </div>

      {/* Widget anniversaires prochains */}
      {prochainsAnniversaires.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-pink-400" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center">
                <Cake className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Anniversaires — 30 prochains jours
                <span className="ml-2 text-xs font-semibold bg-pink-100 text-pink-400 px-2 py-0.5 rounded-full">{prochainsAnniversaires.length}</span>
              </p>
            </div>
            <div className="space-y-2">
              {prochainsAnniversaires.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <img
                    src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=064e3b&color=6ee7b7&size=32`}
                    alt={m.nom} className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.nom}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-pink-400">{m.dateStr}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {m.joursAvant === 0 ? "Aujourd'hui !" : m.joursAvant === 1 ? "Demain" : `dans ${m.joursAvant}j`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Widget membres dormants */}
      {membresDormants.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-muted-foreground/50" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Membres dormants — {currentYear - 2} à {currentYear}
                <span className="ml-2 text-xs font-semibold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{membresDormants.length}</span>
              </p>
              <button onClick={() => setTab("cotisations")} className="ml-auto text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline">Gérer →</button>
            </div>
            <div className="space-y-2">
              {membresDormants.slice(0, 5).map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <img
                    src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nom)}&background=475569&color=fff&size=32`}
                    alt={m.nom} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.nom}</p>
                  </div>
                  <span className="text-xs text-muted-foreground truncate flex-shrink-0">{m.profession || "—"}</span>
                </div>
              ))}
            </div>
            {membresDormants.length > 5 && (
              <p className="text-xs text-muted-foreground mt-2">+{membresDormants.length - 5} autres membres dormants</p>
            )}
          </div>
        </div>
      )}

      {/* Répartition géo + Agenda combiné */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-cyan-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-sm font-bold text-foreground">Rayonnement géographique</p>
            </div>
            <WorldMembersMap data={repartitionGeo} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-violet-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-sm font-bold text-foreground">Agenda</p>
            </div>
            {agendaCombine.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucune échéance à venir.</p>
            ) : (
              <div className="space-y-2.5">
                {agendaCombine.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "event" ? "bg-indigo-500/15" : "bg-pink-500/15"}`}>
                      {item.type === "event"
                        ? <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        : <Cake className="w-3.5 h-3.5 text-pink-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.titre}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.dateStr}{item.lieu ? ` · ${item.lieu}` : ""}</p>
                    </div>
                    {item.joursAvant !== null && (
                      <span className={`text-xs font-bold flex-shrink-0 ${item.joursAvant === 0 ? "text-red-400" : item.joursAvant <= 7 ? "text-amber-400" : "text-muted-foreground"}`}>
                        {item.joursAvant === 0 ? "Auj." : `J-${item.joursAvant}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-background border border-border rounded-2xl p-5">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Pages privées</h3>
          {PROTECTED_PAGES.map(({ label, href, icon: Icon }) => (
            <Link key={href} to={href} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors group mb-1">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-primary" /></div>
                <span className="text-sm font-medium">{label}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
        <div className="bg-background border border-border rounded-2xl p-5">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Session active</h3>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="font-mono text-xs text-foreground">{session?.email}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{session?.role || "admin"}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Pour gérer les comptes : ouvrir le dashboard Supabase → Authentication → Users. Le champ <code className="text-primary font-mono">role</code> dans les métadonnées détermine les droits.
          </p>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administration</p>
            <button onClick={exportBackup}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
              <Download className="w-3 h-3" /> Backup JSON complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
