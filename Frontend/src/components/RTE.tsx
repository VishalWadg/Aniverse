import React, { useEffect } from "react";
import { Controller, type Control } from "react-hook-form";
import { EditorContent, useEditor, type Editor, FloatingMenu, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import MonolithEditor from "./Editors/MonolithEditor";

type RTEProps = {
  name: string;
  control: Control<any>;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
};

// 1. Restored the MenuBar Component
function MenuBar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link")?.href as string | undefined;
    const url = window.prompt("URL", previousUrl || "");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Helper for active button styling
  const activeClass = "bg-gray-200 font-semibold";
  const btnClass = "px-2 py-1 rounded hover:bg-gray-100 transition-colors";

  return (
    <div className="flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 p-2 text-sm text-black">
      <button type="button" className={btnClass} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <img src="/icons/Undo.svg" alt="Undo" className="h-5 w-5" />
      </button>
      <button type="button" className={btnClass} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <img src="/icons/Redo.svg" alt="Redo" className="h-5 w-5"/>
      </button>
      
      <span className="mx-1 self-center text-gray-300">|</span>
      
      <button type="button" className={`${btnClass} ${editor.isActive("bold") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleBold().run()}>
        <img src="/icons/Bold.svg" alt="Bold" />
      </button>
      <button type="button" className={`${btnClass} ${editor.isActive("italic") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <img src="/icons/Italic.svg" alt="Italic" />
      </button>
      <button type="button" className={`${btnClass} ${editor.isActive("strike") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <img src="/icons/Strikethrough.svg" alt="Strikethrough" />
      </button>
      
      <span className="mx-1 self-center text-gray-300">|</span>
      
      <button type="button" className={`${btnClass} ${editor.isActive("heading", { level: 2 }) ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </button>
      <button type="button" className={`${btnClass} ${editor.isActive("bulletList") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        Bullets
      </button>
      <button type="button" className={`${btnClass} ${editor.isActive("orderedList") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        Numbered
      </button>
      <button type="button" className={`${btnClass} ${editor.isActive("blockquote") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Quote
      </button>
      <button type="button" className={`${btnClass} ${editor.isActive("codeBlock") ? activeClass : ""}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        Code
      </button>
      
      <span className="mx-1 self-center text-gray-300">|</span>
      
      <button type="button" className={`${btnClass} ${editor.isActive("link") ? activeClass : ""}`} onClick={setLink}>
        Link
      </button>
      <button type="button" className={btnClass} onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>
        Unlink
      </button>
    </div>
  );
}

// 2. Main Editor Field
function TiptapField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string; }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || "Write something..." }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        // Adjusted classes: removed top border radius to connect smoothly with the MenuBar
        class: "prose max-w-none min-h-[320px] rounded-b-lg border border-gray-200 bg-white p-3 text-black text-left outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col w-full shadow-sm">
      {/* MenuBar sits perfectly on top of the editor */}
      <MenuBar editor={editor} />

      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm shadow-lg flex gap-2">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className="font-bold hover:text-blue-300">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="italic hover:text-blue-300">I</button>
        </div>
      </BubbleMenu>

      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm text-sm">
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="hover:bg-gray-100 px-1 rounded font-semibold text-gray-700">
            H2
          </button>
        </div>
      </FloatingMenu>

      {/* The actual typing area */}
      <EditorContent editor={editor} />
    </div>
  );
}

// 3. React Hook Form Wrapper
export default function RTE({ name, control, label, defaultValue = "", placeholder }: RTEProps) {
  return (
    <div className="w-full text-start ">
      {/* {label && <label className="inline-block mb-1 pl-1 font-medium text-white">{label}</label>}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <TiptapField 
            value={(value as string) ?? ""} 
            onChange={onChange} 
            placeholder={placeholder} 
          />
        )}
      /> */}
      <MonolithEditor/>
    </div>
  );
}