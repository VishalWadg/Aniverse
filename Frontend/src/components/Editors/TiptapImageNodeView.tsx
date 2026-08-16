import React, { useState, useRef } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { uploadImageToCloudinary } from '@/api/uploadApi';
import {
  Crop,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export function TiptapImageNodeView(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);

  const src = node.attrs.src as string;
  const alignment = (node.attrs.alignment as string) || 'center';
  const width = (node.attrs.width as string) || '100%';

  const handleAlign = (align: 'left' | 'center' | 'right') => {
    updateAttributes({ alignment: align });
  };

  const handleWidth = (w: string) => {
    updateAttributes({ width: w });
  };

  const handleSaveCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setIsUploading(true);
    try {
      const canvas = cropper.getCroppedCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsUploading(false);
          return;
        }

        const file = new File([blob], `cropped_${Date.now()}.png`, { type: 'image/png' });
        const uploadData = await uploadImageToCloudinary(file);

        if (uploadData?.secure_url) {
          updateAttributes({ 
            src: uploadData.secure_url,
            publicId: uploadData.public_id
          });
          
          setIsCropping(false);
        }
        setIsUploading(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to upload cropped image:', err);
      setIsUploading(false);
    }
  };

  const alignStyles: Record<string, string> = {
    left: 'margin-right: auto; margin-left: 0;',
    center: 'margin-left: auto; margin-right: auto;',
    right: 'margin-left: auto; margin-right: 0;',
  };

  return (
    <NodeViewWrapper className="relative my-4 group">
      <div
        className="relative transition-all"
        style={{
          display: 'flex',
          justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        }}
      >
        <div
          className={`relative rounded-xl overflow-hidden transition-all ${
            selected ? 'ring-2 ring-[var(--primary)]' : ''
          }`}
          style={{ width }}
        >
          <img
            src={src}
            alt={node.attrs.alt || ''}
            className="w-full h-auto block rounded-xl"
          />

          {/* Contextual Floating Toolbar */}
          {!isCropping && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--surface-container-high)]/90 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-[var(--outline-variant)] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20">
              <button
                type="button"
                onClick={() => setIsCropping(true)}
                className="p-1.5 rounded hover:bg-[var(--surface-container-highest)] text-xs font-semibold flex items-center gap-1 text-[var(--on-surface)]"
                title="Crop Image"
              >
                <Crop size={14} />
                <span>Crop</span>
              </button>

              <div className="h-3 w-[1px] bg-[var(--outline-variant)] mx-0.5" />

              <button
                type="button"
                onClick={() => handleAlign('left')}
                className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${alignment === 'left' ? 'text-[var(--primary)] font-bold' : ''}`}
                title="Align Left"
              >
                <AlignLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('center')}
                className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${alignment === 'center' ? 'text-[var(--primary)] font-bold' : ''}`}
                title="Align Center"
              >
                <AlignCenter size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('right')}
                className={`p-1.5 rounded hover:bg-[var(--surface-container-highest)] ${alignment === 'right' ? 'text-[var(--primary)] font-bold' : ''}`}
                title="Align Right"
              >
                <AlignRight size={14} />
              </button>

              <div className="h-3 w-[1px] bg-[var(--outline-variant)] mx-0.5" />

              <button
                type="button"
                onClick={() => handleWidth('50%')}
                className={`px-1.5 py-0.5 text-[10px] rounded hover:bg-[var(--surface-container-highest)] ${width === '50%' ? 'bg-[var(--primary)] text-white' : ''}`}
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleWidth('100%')}
                className={`px-1.5 py-0.5 text-[10px] rounded hover:bg-[var(--surface-container-highest)] ${width === '100%' ? 'bg-[var(--primary)] text-white' : ''}`}
              >
                100%
              </button>

              <div className="h-3 w-[1px] bg-[var(--outline-variant)] mx-0.5" />

              <button
                type="button"
                onClick={deleteNode}
                className="p-1.5 rounded hover:bg-red-500/20 text-red-500"
                title="Delete Image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-[var(--surface-container-high)] rounded-2xl p-4 flex flex-col gap-4 shadow-2xl border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Crop size={16} />
                <span>Crop Image</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="p-1 rounded hover:bg-[var(--surface-container-highest)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-black/40">
              <Cropper
                ref={cropperRef}
                src={src}
                style={{ height: 400, width: '100%' }}
                initialAspectRatio={NaN}
                guides={true}
                viewMode={1}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                disabled={isUploading}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface-container-highest)] text-[var(--on-surface)] hover:opacity-90"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={isUploading}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 flex items-center gap-1.5 shadow-md"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Apply & Save Crop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
