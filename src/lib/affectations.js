// Helpers partagés pour les affectations bénévoles ↔ missions.

export const ASSIGNMENT_STATUSES = [
  { value: "CANDIDATE", label: "Pressenti",  color: "bg-blue-500/15 text-blue-400" },
  { value: "ASSIGNED",  label: "Affecté",    color: "bg-violet-500/15 text-violet-400" },
  { value: "ACTIVE",    label: "Active",     color: "bg-amber-500/15 text-amber-500" },
  { value: "COMPLETED", label: "Terminée",   color: "bg-emerald-500/15 text-emerald-400" },
  { value: "CANCELLED", label: "Annulée",    color: "bg-red-500/15 text-red-400" },
];

export const ROLE_SUGGESTIONS = [
  "Mentor", "Conférencier", "Logistique", "Communication",
  "Coordination", "Rédaction", "Fundraising", "Technique", "Bénévole",
];

export function statusLabel(v) {
  return ASSIGNMENT_STATUSES.find((s) => s.value === v)?.label ?? v ?? "—";
}

export function statusColor(v) {
  return ASSIGNMENT_STATUSES.find((s) => s.value === v)?.color ?? "bg-muted text-muted-foreground";
}

/**
 * Notifie le bénévole de son affectation (email Brevo via l'API Vercel).
 * Non bloquant : toute erreur est seulement journalisée.
 */
export async function notifyAssignment({ to_email, to_name, mission_titre, assigned_role, assignment_status, start_date, end_date }) {
  if (!to_email) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "volunteer_assignment",
        to_email, to_name, mission_titre, assigned_role,
        assignment_status, start_date: start_date || null, end_date: end_date || null,
      }),
    });
  } catch (e) {
    console.error("notifyAssignment", e);
  }
}
