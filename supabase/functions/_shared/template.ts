// Rendu des messages d'automatisation éditables depuis le dashboard.
//
// Principe : le bureau saisit un OBJET et un CORPS en texte simple, avec des
// variables de la forme {{prenom}}, {{date}}… Le design (en-tête/pied MBP) reste
// géré par le code via wrapHtml(). Si aucun message n'est défini en base, on
// retombe sur le modèle codé en dur de la fonction (paramètre `fallback`).
//
// Sécurité : le corps saisi est échappé (pas d'injection HTML possible), les
// retours à la ligne deviennent des <br>, et chaque variable est échappée à
// l'insertion. L'objet d'email est du texte brut (pas d'échappement HTML).

import { escHtml, wrapHtml } from "./brevo.ts";

export interface MessageTemplate {
  subject?: string;
  body?: string;
}

export interface RenderedMessage {
  subject: string;
  htmlContent: string;
}

// Remplace les {{cle}} d'un texte. `escape` = true pour le corps HTML, false pour l'objet.
function substitute(text: string, vars: Record<string, string>, escape: boolean): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) => {
    const value = vars[key] ?? "";
    return escape ? escHtml(value) : value;
  });
}

// Construit l'email final à partir du modèle éditable, ou du repli si vide.
export function renderTemplate(
  template: MessageTemplate | null | undefined,
  vars: Record<string, string>,
  fallback: RenderedMessage,
): RenderedMessage {
  if (!template || !template.subject?.trim() || !template.body?.trim()) {
    return fallback;
  }

  const subject = substitute(template.subject, vars, false);

  // Échappe le texte saisi, convertit les sauts de ligne, puis injecte les variables.
  const escapedBody = escHtml(template.body).replace(/\r?\n/g, "<br>");
  const body = substitute(escapedBody, vars, true);

  return { subject, htmlContent: wrapHtml(body) };
}
