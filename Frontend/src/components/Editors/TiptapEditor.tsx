import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './TiptapCustomImage';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { uploadImageToCloudinary } from '@/api/uploadApi';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Undo,
  Redo,
  Send,
  Loader2,
  Plus,
} from 'lucide-react';
import './tiptap-editor.css';

type TitleSize = 'sm' | 'md' | 'lg' | 'xl';

type TiptapEditorProps = {
  title: string;
  onTitleChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  titleSize?: TitleSize;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isEditing?: boolean;
};

const TITLE_SIZE_MAP: Record<TitleSize, string> = {
  sm: 'text-3xl',
  md: 'text-4xl',
  lg: 'text-5xl',
  xl: 'text-6xl',
};

export function TiptapEditor({
  title,
  onTitleChange,
  value,
  onChange,
  placeholder = 'Start writing or type "/"...',
  titleSize = 'lg',
  onSubmit,
  submitLabel,
  isSubmitting = false,
  isEditing = false,
}: TiptapEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const resizeTitle = () => {
    if (!titleRef.current) return;
    titleRef.current.style.height = 'auto';
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTitle();
  }, [title]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      CustomImage,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Subscript,
      Superscript,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      const uploadData = await uploadImageToCloudinary(file);
      if (uploadData?.secure_url) {
        editor.chain().focus().setImage({ 
          src: uploadData.secure_url,
          publicId: uploadData.public_id, 
        }).run();
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <section className="w-full bg-[var(--editor-bg)] text-[var(--editor-text)] transition-colors duration-200 tiptap-container">
      {/* Floating Contextual Bubble Menu on Selection */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
        className="flex items-center gap-1 bg-[var(--surface-container-high)] border border-[var(--outline-variant)] rounded-xl p-1 shadow-2xl backdrop-blur-md z-40"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('bold') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('italic') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('underline') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('highlight') ? 'text-amber-500 font-bold' : ''}`}
          title="Highlight Text"
        >
          <Highlighter size={16} />
        </button>
      </BubbleMenu>

      {/* Floating Menu for Empty Lines / Quick Insert */}
      <FloatingMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
        className="flex items-center gap-1 bg-[var(--surface-container-high)] border border-[var(--outline-variant)] rounded-xl p-1 shadow-xl backdrop-blur-md z-40"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
          title="Checklist"
        >
          <CheckSquare size={16} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </FloatingMenu>

      {/* Mobile Top Header Bar for Primary Actions (< 640px) */}
      <div className="sticky top-0 z-40 sm:hidden flex items-center justify-between px-4 py-2.5 bg-[var(--editor-bg)]/90 backdrop-blur-md border-b border-[var(--outline-variant)]/20 transition-all">
        <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>{isEditing ? "Editing Post" : "Draft"}</span>
        </div>

        {onSubmit && (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            size="sm"
            className="px-3.5 py-1 font-bold bg-[var(--primary)] text-[var(--on-primary)] shadow-md flex items-center gap-1.5 hover:opacity-90 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>{submitLabel || (isEditing ? "Update" : "Publish")}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Floating Desktop Toolbar Dock (≥ 640px) */}
      <div className="hidden sm:flex sticky top-3 z-30 mx-auto w-[calc(100%-2rem)] max-w-[1400px] rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-high)]/95 backdrop-blur-xl px-4 py-2 shadow-xl transition-all items-center justify-between gap-2">
        {/* Left Formatting Tools Container (No wrapping) */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0 flex-1">
        {/* Inline Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('bold') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('italic') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('underline') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('strike') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>

        {/* Text Highlight & Color */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('highlight') ? 'text-amber-500 font-bold' : ''}`}
          title="Highlight Text"
        >
          <Highlighter size={18} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)]"
            title="Text Color"
          >
            <Palette size={18} />
          </button>
          {showColorPicker && (
            <div className="absolute top-10 left-0 z-50 p-2 bg-[var(--surface-container-high)] border border-[var(--outline-variant)] rounded-xl shadow-xl flex gap-1 items-center">
              {['#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-white/20"
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-container-highest)]"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[var(--outline-variant)] mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('heading', { level: 3 }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>

        <div className="h-4 w-[1px] bg-[var(--outline-variant)] mx-1" />

        {/* Lists & Tasks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('bulletList') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('orderedList') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('taskList') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Checklist / Task List"
        >
          <CheckSquare size={18} />
        </button>

        <div className="h-4 w-[1px] bg-[var(--outline-variant)] mx-1" />

        {/* Blocks & Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('blockquote') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Quote"
        >
          <Quote size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('codeBlock') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Code Block"
        >
          <Code2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)]"
          title="Divider Line"
        >
          <Minus size={18} />
        </button>

        <div className="h-4 w-[1px] bg-[var(--outline-variant)] mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive({ textAlign: 'left' }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive({ textAlign: 'center' }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive({ textAlign: 'right' }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>

        <div className="h-4 w-[1px] bg-[var(--outline-variant)] mx-1" />

        {/* Subscript & Superscript */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('subscript') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Subscript"
        >
          <SubIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${editor.isActive('superscript') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Superscript"
        >
          <SuperIcon size={18} />
        </button>

        <div className="h-4 w-[1px] bg-[var(--outline-variant)] mx-1" />

        {/* Image Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded hover:bg-[var(--surface-container-highest)]"
          title="Upload Image"
        >
          <ImageIcon size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        </div>

        {/* Right Fixed Action Area (Undo/Redo & Submit) */}
        <div className="flex items-center gap-2 shrink-0 border-l border-[var(--outline-variant)] pl-2">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] font-medium mr-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isEditing ? "Editing" : "Draft"}</span>
          </div>

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] disabled:opacity-40"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] disabled:opacity-40"
            title="Redo"
          >
            <Redo size={18} />
          </button>

          {onSubmit && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              size="sm"
              className="hidden sm:flex ml-2 px-4 font-semibold shadow-md items-center gap-1.5 bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{submitLabel || (isEditing ? "Update Post" : "Publish Post")}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-[880px] px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
        <div className="relative flex flex-col gap-4">
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            rows={1}
            placeholder="Untitled"
            className={`
              w-full resize-none overflow-hidden bg-transparent font-bold 
              leading-tight outline-none placeholder:text-gray-400 
              dark:placeholder:text-gray-600 transition-all duration-200
              px-1.5 sm:px-0 sm:pl-14
              ${TITLE_SIZE_MAP[titleSize]}
            `}
          />

          <div className="pl-0 sm:pl-14">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Fixed Mobile Bottom Accessory Toolbar (< 640px) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden flex items-center gap-1 border-t border-[var(--outline-variant)] bg-[var(--surface-container-high)]/95 backdrop-blur-md px-3 py-1.5 shadow-2xl overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-[var(--surface-container-highest)] ${editor.isActive('bold') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-[var(--surface-container-highest)] ${editor.isActive('italic') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg hover:bg-[var(--surface-container-highest)] ${editor.isActive('underline') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg hover:bg-[var(--surface-container-highest)] ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-[var(--surface-container-highest)] ${editor.isActive('bulletList') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded-lg hover:bg-[var(--surface-container-highest)] ${editor.isActive('taskList') ? 'text-[var(--primary)] font-bold' : ''}`}
          title="Checklist"
        >
          <CheckSquare size={18} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-[var(--surface-container-highest)]"
          title="Upload Image"
        >
          <ImageIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-[var(--surface-container-highest)] disabled:opacity-40 ml-auto"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-[var(--surface-container-highest)] disabled:opacity-40"
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>
    </section>
  );
}

export default TiptapEditor;
