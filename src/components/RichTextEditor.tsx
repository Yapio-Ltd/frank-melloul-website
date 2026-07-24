"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}

/* ── Icônes SVG légères ── */
function Icon({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox={viewBox}
    >
      <path d={d} />
    </svg>
  );
}

function IconFill({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox={viewBox}>
      <path d={d} />
    </svg>
  );
}

/* ── Bouton de la barre d'outils ── */
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-150
        ${active
          ? "bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/40"
          : "text-primary-400 hover:bg-navy-700/60 hover:text-primary-100"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ── Séparateur ── */
function Divider() {
  return <span className="w-px h-5 bg-gold-500/10 mx-0.5 shrink-0" />;
}

/* ─────────────────────────────────────────── */

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  dir = "ltr",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-gold-400 underline hover:text-gold-300 transition-colors" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Rédigez votre article…",
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-primary-600 before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[220px] text-primary-100 leading-relaxed focus:outline-none",
        dir,
      },
    },
    onUpdate({ editor }) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const attrs = editor.view.dom.getAttribute("dir");
    if (attrs !== dir) {
      editor.view.dom.setAttribute("dir", dir);
    }
  }, [editor, dir]);
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gold-500/15 bg-navy-900/60 focus-within:border-gold-500/40 transition-colors duration-200 overflow-hidden">

      {/* ── Barre d'outils ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gold-500/10 bg-navy-900/80">

        {/* Titres */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Titre 1 (H1)"
        >
          <span className="text-xs font-bold tracking-tight">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre 2 (H2)"
        >
          <span className="text-xs font-bold tracking-tight">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Sous-titre (H3)"
        >
          <span className="text-xs font-bold tracking-tight">H3</span>
        </ToolbarButton>

        <Divider />

        {/* Style du texte */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras (Ctrl+B)"
        >
          <IconFill d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique (Ctrl+I)"
        >
          <Icon d="M19 4h-9M14 20H5M14.7 4.7L9.2 19.4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Souligné (Ctrl+U)"
        >
          <Icon d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Icon d="M16 4H9a3 3 0 0 0-2.83 4 M14 12a4 4 0 0 1 0 8H6 M4 12h16" />
        </ToolbarButton>

        <Divider />

        {/* Alignement */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Aligner à gauche"
        >
          <Icon d="M3 6h18M3 12h12M3 18h15" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centrer"
        >
          <Icon d="M3 6h18M6 12h12M4 18h16" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Aligner à droite"
        >
          <Icon d="M3 6h18M9 12h12M6 18h15" />
        </ToolbarButton>

        <Divider />

        {/* Listes */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <Icon d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </ToolbarButton>

        <Divider />

        {/* Bloc citation */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Bloc citation"
        >
          <Icon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </ToolbarButton>

        {/* Lien */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Ajouter un lien"
        >
          <Icon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </ToolbarButton>

        <Divider />

        {/* Saut de ligne dur */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHardBreak().run()}
          active={false}
          title="Saut de ligne (Shift+Entrée)"
        >
          <Icon d="M9 18H5a2 2 0 0 1-2-2V8 M15 6l3 3-3 3 M18 9H9" />
        </ToolbarButton>

        {/* Code inline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Code inline"
        >
          <Icon d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </ToolbarButton>

        <Divider />

        {/* Annuler / Rétablir */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Annuler (Ctrl+Z)"
        >
          <Icon d="M3 7v6h6 M21 17a9 9 0 1 0-2.36-8.36L3 13" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Rétablir (Ctrl+Y)"
        >
          <Icon d="M21 7v6h-6 M3 17a9 9 0 0 1 2.36-8.36L21 13" />
        </ToolbarButton>
      </div>

      {/* ── Zone d'édition ── */}
      <div className="px-4 py-3 rich-editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
