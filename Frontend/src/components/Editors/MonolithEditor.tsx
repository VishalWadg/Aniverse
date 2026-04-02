import React, { useEffect, useRef, useState } from 'react';
import EditorJs from '@editorjs/editorjs';
import { tools } from './tools';

function MonolithEditor() {
    const [isReady, setIsReady] = useState<boolean>(false);
    const editorRef = useRef<EditorJs | null>(null);

    useEffect(() => {
        initEditor();
        return () => destroyEditor();
    }, []);
    
    const initEditor = () => {
        if (!editorRef.current) {
            editorRef.current = new EditorJs({
                holder: 'mono-editorjs',
                tools: tools,
                autofocus: true,
                placeholder: 'Press "/" for commands or start typing...', // More Notion-esque
                inlineToolbar: true,
                onReady: () => setIsReady(true),
            });
        }
    }

    const destroyEditor = () => {
        if (editorRef.current && typeof editorRef.current.destroy === 'function') {
            editorRef.current.destroy();
            editorRef.current = null;
        }
        setIsReady(false);
    }

    return (
        // Added dark mode classes and removed the inner text
        <div className="w-full min-h-screen bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#rgba(255,255,255,0.81)] transition-colors duration-200">
            <div 
                id="mono-editorjs" 
                className="max-w-[900px] mx-auto py-12 px-10 md:px-20"
            />
        </div>
    );
}

export default MonolithEditor;