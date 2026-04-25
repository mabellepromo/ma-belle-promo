import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback } from "react";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link2 } from "lucide-react";

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}>
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Synchronise la valeur externe (réinitialisation du formulaire)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.getHTML() !== (value || "")) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL du lien :");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-muted border-b border-border">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })} title="Titre H2">
          <span className="text-xs font-bold">H2</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })} title="Titre H3">
          <span className="text-xs font-bold">H3</span>
        </ToolbarBtn>

        <div className="w-px h-4 bg-border mx-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")} title="Gras">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")} title="Italique">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")} title="Souligné">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-border mx-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-border mx-1" />

        <ToolbarBtn onClick={handleLink} active={editor.isActive("link")}
          title={editor.isActive("link") ? "Supprimer le lien" : "Insérer un lien"}>
          <Link2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="flex-1" />

        <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          active={false} title="Effacer la mise en forme">
          <span className="text-xs">Ax</span>
        </ToolbarBtn>
      </div>

      {/* Zone de saisie */}
      <EditorContent
        editor={editor}
        className={[
          "bg-background min-h-[180px] px-4 py-3 text-sm text-foreground",
          "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[160px]",
          "[&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-3",
          "[&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:mt-2",
          "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-2",
          "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-2",
          "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline",
          "[&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none",
        ].join(" ")}
      />
    </div>
  );
}
