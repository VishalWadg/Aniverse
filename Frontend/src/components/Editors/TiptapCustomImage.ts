import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TiptapImageNodeView } from './TiptapImageNodeView';

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-alignment') || 'center',
        renderHTML: (attributes) => ({
          'data-alignment': attributes.alignment,
        }),
      },
      width: {
        default: '100%',
        parseHTML: (element) => element.style.width || element.getAttribute('width') || '100%',
        renderHTML: (attributes) => ({
          style: `width: ${attributes.width};`,
        }),
      },
      publicId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-public-id'),
        renderHTML: (attributes) => {
          if (!attributes.publicId) return {};
          return {
            'data-public-id': attributes.publicId,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapImageNodeView);
  },
});


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        publicId?: string | null;
        alignment?: string;
        width?: string;
      }) => ReturnType;
    };
  }
}