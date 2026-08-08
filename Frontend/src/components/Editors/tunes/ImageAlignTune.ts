import type { API, BlockAPI } from '@editorjs/editorjs';

export type ImageAlignment = 'left' | 'center' | 'right';

export interface ImageAlignTuneData {
  alignment?: ImageAlignment;
}

export default class ImageAlignTune {
  private api: API;
  private block: BlockAPI;
  private data: ImageAlignTuneData;

  static get isTune() {
    return true;
  }

  constructor({ api, data, block }: { api: API; data?: ImageAlignTuneData; block: BlockAPI }) {
    this.api = api;
    this.block = block;
    this.data = data || { alignment: 'center' };
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ce-popover__item-html image-align-tune-container';
    container.style.cssText = 'padding: 6px 10px; display: flex; flex-direction: column; gap: 6px;';

    const label = document.createElement('span');
    label.innerText = 'Image Alignment';
    label.style.cssText = 'font-size: 11px; font-weight: 600; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.04em;';
    container.appendChild(label);

    const alignRow = document.createElement('div');
    alignRow.style.cssText = 'display: flex; gap: 4px; border-radius: 6px; background: var(--surface-container); padding: 2px;';

    const options: { id: ImageAlignment; label: string }[] = [
      { id: 'left', label: 'Left' },
      { id: 'center', label: 'Center' },
      { id: 'right', label: 'Right' },
    ];

    options.forEach((opt) => {
      const active = (this.data.alignment ?? 'center') === opt.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerText = opt.label;
      btn.dataset.id = opt.id;
      btn.style.cssText = `
        flex: 1;
        padding: 4px 6px;
        font-size: 11px;
        font-weight: 500;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: ${active ? 'var(--surface-container-highest)' : 'transparent'};
        color: ${active ? 'var(--primary)' : 'var(--on-surface)'};
        transition: background 0.15s ease, color 0.15s ease;
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectAlignment(opt.id, alignRow);
      });

      alignRow.appendChild(btn);
    });

    container.appendChild(alignRow);
    setTimeout(() => this.applyStyles(), 50);

    return container;
  }

  private selectAlignment(alignment: ImageAlignment, group: HTMLElement) {
    this.data.alignment = alignment;
    const btns = group.querySelectorAll('button');
    btns.forEach((btn) => {
      const isActive = btn.dataset.id === alignment;
      btn.style.background = isActive ? 'var(--surface-container-highest)' : 'transparent';
      btn.style.color = isActive ? 'var(--primary)' : 'var(--on-surface)';
    });

    this.applyStyles();
  }

  private applyStyles() {
    const blockElement = this.block.holder;
    if (!blockElement) return;

    const align = this.data.alignment ?? 'center';
    blockElement.setAttribute('data-img-align', align);

    const imageTool = blockElement.querySelector('.image-tool') as HTMLElement;
    const imgWrapper = blockElement.querySelector('.image-tool__image') as HTMLElement;

    if (imageTool && imageTool.classList.contains('image-tool--stretched')) {
      if (imgWrapper) {
        imgWrapper.style.removeProperty('margin-left');
        imgWrapper.style.removeProperty('margin-right');
        imgWrapper.style.removeProperty('width');
      }
      return;
    }

    if (imageTool) {
      imageTool.style.setProperty('display', 'flex', 'important');
      imageTool.style.setProperty('flex-direction', 'column', 'important');

      if (align === 'left') {
        imageTool.style.setProperty('align-items', 'flex-start', 'important');
        imageTool.style.setProperty('text-align', 'left', 'important');
      } else if (align === 'right') {
        imageTool.style.setProperty('align-items', 'flex-end', 'important');
        imageTool.style.setProperty('text-align', 'right', 'important');
      } else {
        imageTool.style.setProperty('align-items', 'center', 'important');
        imageTool.style.setProperty('text-align', 'center', 'important');
      }
    }

    if (imgWrapper) {
      if (align === 'left') {
        imgWrapper.style.setProperty('margin-left', '0', 'important');
        imgWrapper.style.setProperty('margin-right', 'auto', 'important');
      } else if (align === 'right') {
        imgWrapper.style.setProperty('margin-left', 'auto', 'important');
        imgWrapper.style.setProperty('margin-right', '0', 'important');
      } else {
        imgWrapper.style.setProperty('margin-left', 'auto', 'important');
        imgWrapper.style.setProperty('margin-right', 'auto', 'important');
      }
    }
  }

  save(): ImageAlignTuneData {
    return this.data;
  }
}
