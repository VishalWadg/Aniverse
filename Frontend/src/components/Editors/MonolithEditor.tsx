import React, { useEffect, useRef } from 'react';
import EditorJs from '@editorjs/editorjs';
import { createEditorJsData, editorJsToHtml } from './monolith-content';
import { tools } from './tools';

type MonolithEditorProps = {
    title: string;
    onTitleChange: (value: string) => void;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

function MonolithEditor({
    title,
    onTitleChange,
    value,
    onChange,
    placeholder = 'Press "/" for commands or start typing...',
}: MonolithEditorProps) {
    const editorRef = useRef<EditorJs | null>(null);
    const titleRef = useRef<HTMLTextAreaElement | null>(null);
    const saveTimeoutRef = useRef<number | null>(null);
    const lastSerializedContentRef = useRef(value);
    const onContentChangeRef = useRef(onChange);

    useEffect(() => {
        onContentChangeRef.current = onChange;
    }, [onChange]);

    const resizeTitle = () => {
        if (!titleRef.current) {
            return;
        }

        titleRef.current.style.height = '0px';
        titleRef.current.style.height = `${Math.max(titleRef.current.scrollHeight, 72)}px`;
    };

    const persistEditorContent = async () => {
        if (!editorRef.current) {
            return;
        }

        const output = await editorRef.current.save();
        const html = editorJsToHtml(output);

        lastSerializedContentRef.current = html;
        onContentChangeRef.current(html);
    };

    const schedulePersist = () => {
        if (saveTimeoutRef.current !== null) {
            window.clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            void persistEditorContent();
        }, 180);
    };

    useEffect(() => {
        resizeTitle();
    }, [title]);

    useEffect(() => {
        if (editorRef.current) {
            return;
        }

        editorRef.current = new EditorJs({
            holder: 'mono-editorjs',
            tools,
            data: createEditorJsData(value),
            autofocus: true,
            defaultBlock: 'paragraph',
            placeholder,
            inlineToolbar: true,
            async onChange() {
                schedulePersist();
            },
        });

        return () => {
            if (saveTimeoutRef.current !== null) {
                window.clearTimeout(saveTimeoutRef.current);
            }

            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }

        if (value === lastSerializedContentRef.current) {
            return;
        }

        const nextData = createEditorJsData(value);
        lastSerializedContentRef.current = value;

        void editorRef.current.isReady.then(() => editorRef.current?.render(nextData));
    }, [value]);

    return (
        <section className="monolith-editor w-full bg-[var(--editor-bg)] text-[var(--editor-text)] transition-colors duration-200">
            <div className="mx-auto w-full max-w-[880px] px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pt-16">
                <div className="monolith-editor__canvas relative">
                    <textarea
                        ref={titleRef}
                        value={title}
                        onChange={(event) => onTitleChange(event.target.value)}
                        rows={1}
                        placeholder="Untitled"
                        className="monolith-editor__title"
                    />
                    <div
                        id="mono-editorjs"
                        className="min-h-[60vh] px-0 pb-8 sm:pb-10"
                    />
                </div>
            </div>
        </section>
    );
}

export default MonolithEditor;
