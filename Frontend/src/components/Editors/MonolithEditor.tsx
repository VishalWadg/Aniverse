import React, { useEffect, useRef, useState } from 'react';
import EditorJs from '@editorjs/editorjs';
import { createEditorJsData, editorJsToHtml } from './monolith-content';
import { tools } from './tools';
import './monolith-editor.css';

type TitleSize = 'sm' | 'md' | 'lg' | 'xl';

type MonolithEditorProps = {
    title: string;
    onTitleChange: (value: string) => void;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    titleSize?: TitleSize;
};

const TITLE_SIZE_MAP: Record<TitleSize, string> = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
};

function MonolithEditor({
    title,
    onTitleChange,
    value,
    onChange,
    placeholder = 'Press "/" for commands or start typing...',
    titleSize = 'lg',
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
        if (!titleRef.current) return;
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    };

    const persistEditorContent = async () => {
        if (!editorRef.current) return;

        try {
            const output = await editorRef.current.save();
            const html = editorJsToHtml(output);

            lastSerializedContentRef.current = html;
            onContentChangeRef.current(html);
        } catch (error) {
            console.error('Failed to save Editor.js content:', error);
        }
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
        if (editorRef.current) return;

        editorRef.current = new EditorJs({
            holder: 'mono-editorjs',
            tools,
            data: createEditorJsData(value),
            autofocus: true,
            defaultBlock: 'paragraph',
            placeholder,
            inlineToolbar: true,
            onChange: schedulePersist,
        });

        return () => {
            if (saveTimeoutRef.current !== null) {
                window.clearTimeout(saveTimeoutRef.current);
            }

            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                try {
                    editorRef.current.destroy();
                } catch (e) {
                    console.warn('Editor.js cleanup bypassed an error:', e);
                }
                editorRef.current = null;
            }

            const ghostPopovers = document.querySelectorAll('.ce-popover, .tc-popover, .ct__popover');
            ghostPopovers.forEach((el) => el.remove());
        };
    }, []);

    useEffect(() => {
        if (!editorRef.current || value === lastSerializedContentRef.current) return;

        const nextData = createEditorJsData(value);
        lastSerializedContentRef.current = value;

        void editorRef.current.isReady.then(() => {
            editorRef.current?.render(nextData);
        });
    }, [value]);

    return (
        <section className="w-full bg-[var(--editor-bg)] text-[var(--editor-text)] transition-colors duration-200">
            <div className="mx-auto w-full max-w-[880px] px-4 pb-10 pt-2 sm:px-6 sm:pb-12 sm:pt-3 lg:px-8 lg:pt-4">

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

                    <div
                        id="mono-editorjs"
                        className="min-h-[60vh] pl-0 sm:pl-14"
                    />
                </div>
            </div>
        </section>
    );
}

export default MonolithEditor;