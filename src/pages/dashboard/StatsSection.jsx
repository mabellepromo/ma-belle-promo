import { useMemo } from "react";
import { useMemberStore } from "@/lib/memberStore";
import { useMultiYearCotisations } from "@/hooks/useMultiYearCotisations";
import { useEvenements } from "@/hooks/useEvenements";
import { useArticles } from "@/hooks/useArticles";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Users, Globe, Banknote } from "lucide-react";

const COLORS = ["#1b6b45", "#9a7118", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/10 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <p className="font-semibold text-sm text-foreground">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function StatsSection() {
  const { allMembers } = useMemberStore({ realtime: false });
  const { data: multiYear } = useMultiYearCotisations(YEARS);
  const { evenements } = useEvenements();
  const { articles } = useArticles();

  /* Taux de cotisation par année */
  const cotData = useMemo(() => YEARS.map(yr => {
    const memberIds = Object.keys(multiYear || {});
    const payes = memberIds.filter(mid => multiYear[mid]?.[yr]?.statut === "payé").length;
    const total = allMembers?.length || 1;
    return { annee: String(yr), taux: Math.round((payes / total) * 100), payes, total };
  }), [multiYear, allMembers]);

  /* Répartition géographique */
  const geoData = useMemo(() => {
    const counts = {};
    (allMembers || []).forEach(m => {
      const k = m.pays?.trim() || "Non renseigné";
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }));
  }, [allMembers]);

  /* Répartition professionnelle */
  const proData = useMemo(() => {
    const counts = {};
    (allMembers || []).forEach(m => {
      const k = m.profession?.split(" ")[0] || "Non renseigné";
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [allMembers]);

  /* Articles par catégorie */
  const artData = useMemo(() => {
    const counts = {};
    (articles || []).forEach(a => {
      const k = a.categorie || "Autre";
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [articles]);

  /* Événements par type */
  const evtData = useMemo(() => {
    const counts = {};
    (evenements || []).forEach(e => {
      const k = e.type || "Autre";
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [evenements]);

  const total = allMembers?.length || 0;
  const withEmail = (allMembers || []).filter(m => m.email).length;
  const withPays = (allMembers || []).filter(m => m.pays).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">Statistiques & Analyses</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Vue d'ensemble chiffrée de l'association</p>
      </div>

      {/* KPI rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Membres", value: total, icon: Users, color: "bg-emerald-50 text-emerald-600" },
          { label: "Avec email", value: withEmail, icon: TrendingUp, color: "bg-blue-50 text-blue-600", sub: `${total > 0 ? Math.round(withEmail/total*100) : 0}%` },
          { label: "Pays représentés", value: geoData.length, icon: Globe, color: "bg-violet-50 text-violet-600" },
          { label: "Articles publiés", value: articles?.length || 0, icon: Banknote, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Taux de cotisation par année */}
      <ChartCard title="Taux de cotisation par année" icon={Banknote}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cotData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
            <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip formatter={(v, n) => [v + "%", "Taux"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Bar dataKey="taux" fill="#1b6b45" radius={[4, 4, 0, 0]}
              label={{ position: "top", fontSize: 11, fill: "#64748b", formatter: v => v + "%" }} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {cotData.map(d => (
            <div key={d.annee} className="text-center">
              <p className="text-xs font-bold text-foreground">{d.payes}/{d.total}</p>
              <p className="text-xs text-muted-foreground">{d.annee}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Répartition géographique */}
        <ChartCard title="Répartition géographique" icon={Globe}>
          {geoData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Données insuffisantes</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={geoData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                  labelLine={false} fontSize={10}>
                  {geoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 space-y-1">
            {geoData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-foreground">{d.name}</span>
                </div>
                <span className="font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Articles par catégorie */}
        <ChartCard title="Articles par catégorie" icon={TrendingUp}>
          {artData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun article</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={artData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#9a7118" radius={[0, 4, 4, 0]}
                  label={{ position: "right", fontSize: 11, fill: "#64748b" }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Professions */}
      {proData.length > 0 && (
        <ChartCard title="Professions (top 8)" icon={Users}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={proData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, angle: -35, textAnchor: "end" }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
