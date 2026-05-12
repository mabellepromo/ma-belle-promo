import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Charge les cotisations pour plusieurs années en une seule requête.
 * Retourne une map : { memberId: { annee: { statut, montant } } }
 */
export function useMultiYearCotisations(years) {
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!years?.length) return;
    setLoading(true);
    supabase
      .from("cotisations")
      .select("member_id, annee, statut, montant")
      .in("annee", years)
      .then(({ data: rows }) => {
        const map = {};
        (rows ?? []).forEach(r => {
          if (!map[r.member_id]) map[r.member_id] = {};
          map[r.member_id][r.annee] = { statut: r.statut, montant: Number(r.montant) || 0 };
        });
        setData(map);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years.join(",")]);

  return { data, loading };
}
