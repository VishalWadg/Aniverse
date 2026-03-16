import React, { useEffect } from "react";
import { Controller, type Control } from "react-hook-form";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

type RTEProps = {
  name: string;
  control: Control<any>;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
};

function MenuBar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link")?.href as string | undefined;
    const url = window.prompt("URL", previousUrl || "");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm text-black">
      <button type="button" className="px-2 py-1 hover:bg-gray-100 rounded" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        Undo
      </button>
      <button type="button" className="px-2 py-1 hover:bg-gray-100 rounded" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        Redo
      </button>
      <span className="mx-1 self-center text-gray-300">|</span>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("bold") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("italic") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </button>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("strike") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleStrike().run()}>
        Strike
      </button>
      <span className="mx-1 self-center text-gray-300">|</span>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </button>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("bulletList") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        Bullets
      </button>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("orderedList") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        Numbered
      </button>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("blockquote") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Quote
      </button>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("codeBlock") ? "bg-gray-100" : ""}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        Code
      </button>
      <span className="mx-1 self-center text-gray-300">|</span>
      <button type="button" className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive("link") ? "bg-gray-100" : ""}`} onClick={setLink}>
        Link
      </button>
      <button type="button" className="px-2 py-1 hover:bg-gray-100 rounded" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>
        Unlink
      </button>
    </div>
  );
}

function TiptapField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || "Write something..." }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] rounded-lg border border-gray-200 bg-white p-3 text-black outline-none focus:border-gray-300",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="w-full space-y-2">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default function RTE({
  name,
  control,
  label,
  defaultValue = "",
  placeholder,
}: RTEProps) {
  return (
    <div className="w-full">
      {label && <label className="inline-block mb-1 pl-1">{label}</label>}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <TiptapField value={(value as string) ?? ""} onChange={onChange} placeholder={placeholder} />
        )}
      />
    </div>
  );
}
