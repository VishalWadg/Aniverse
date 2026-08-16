import type { API, BlockAPI } from '@editorjs/editorjs';

export interface ImageBgColorData {
  bgColor?: string; // hex color string like "#121212" or preset string
}

export default class ImageBgColorTune {
  private api: API;
  private block: BlockAPI;
  private data: ImageBgColorData;

  static get isTune() {
    return true;
  }

  constructor({ api, data, block }: { api: API; data?: ImageBgColorData; block: BlockAPI }) {
    this.api = api;
    this.block = block;
    this.data = data || { bgColor: '' };
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ce-popover__item-html image-bg-color-tune-container';
    container.style.cssText = 'padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; min-width: 220px;';

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

    const label = document.createElement('span');
    label.innerText = 'Card Background Color';
    label.style.cssText = 'font-size: 11px; font-weight: 600; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.04em;';
    headerRow.appendChild(label);

    container.appendChild(headerRow);

    // Color Swatches + Custom Picker Row
    const pickerRow = document.createElement('div');
    pickerRow.style.cssText = 'display: flex; gap: 6px; align-items: center; flex-wrap: wrap;';

    const presets = [
      { title: 'Default Card', color: '' },
      { title: 'Dark Card', color: '#18181b' },
      { title: 'Light Card', color: '#ffffff' },
      { title: 'Primary Tint', color: '#e0e7ff' },
      { title: 'Rose Tint', color: '#ffe4e6' },
      { title: 'Amber Tint', color: '#fef3c7' },
      { title: 'Emerald Tint', color: '#d1fae5' },
    ];

    presets.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = preset.title;
      btn.style.cssText = `
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: ${preset.color || 'var(--surface-container-low)'};
        border: 2px solid ${this.data.bgColor === preset.color ? 'var(--primary)' : 'var(--outline-variant)'};
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease;
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setColor(preset.color, colorInput);
        this.updateActiveBtn(pickerRow, btn);
      });

      pickerRow.appendChild(btn);
    });

    // Custom Color Input (HTML5 Color Picker)
    const customPickerWrapper = document.createElement('label');
    customPickerWrapper.title = 'Choose custom color';
    customPickerWrapper.style.cssText = 'position: relative; width: 22px; height: 22px; border-radius: 50%; border: 2px dashed var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden;';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = this.data.bgColor && this.data.bgColor.startsWith('#') ? this.data.bgColor : '#3b82f6';
    colorInput.style.cssText = 'position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;';

    const pickerIcon = document.createElement('span');
    pickerIcon.innerText = '🎨';
    pickerIcon.style.cssText = 'font-size: 11px; pointer-events: none;';

    customPickerWrapper.appendChild(colorInput);
    customPickerWrapper.appendChild(pickerIcon);

    colorInput.addEventListener('input', (e) => {
      const hexColor = (e.target as HTMLInputElement).value;
      this.setColor(hexColor, colorInput);
      customPickerWrapper.style.border = '2px solid var(--primary)';
      customPickerWrapper.style.backgroundColor = hexColor;
    });

    pickerRow.appendChild(customPickerWrapper);
    container.appendChild(pickerRow);

    setTimeout(() => this.applyStyles(), 50);

    return container;
  }

  private updateActiveBtn(group: HTMLElement, activeBtn: HTMLElement) {
    const btns = group.querySelectorAll('button');
    btns.forEach((b) => {
      (b as HTMLElement).style.borderColor = b === activeBtn ? 'var(--primary)' : 'var(--outline-variant)';
    });
  }

  private setColor(color: string, colorInput: HTMLInputElement) {
    this.data.bgColor = color;
    if (color && color.startsWith('#')) {
      colorInput.value = color;
    }
    this.applyStyles();
  }

  private applyStyles() {
    const blockElement = this.block.holder;
    if (!blockElement) return;

    const color = this.data.bgColor || '';
    blockElement.setAttribute('data-custom-bg', color);

    const imgWrapper = blockElement.querySelector('.image-tool__image') as HTMLElement;
    const imageTool = blockElement.querySelector('.image-tool') as HTMLElement;

    if (imageTool && imageTool.classList.contains('image-tool--withBackground')) {
      if (imgWrapper) {
        if (color) {
          imgWrapper.style.setProperty('background-color', color, 'important');
          imgWrapper.style.setProperty('padding', '1.25rem', 'important');
          imgWrapper.style.setProperty('border-radius', '0.75rem', 'important');
        } else {
          imgWrapper.style.setProperty('background-color', 'var(--surface-container-low)', 'important');
          imgWrapper.style.setProperty('padding', '1.25rem', 'important');
          imgWrapper.style.setProperty('border-radius', '0.75rem', 'important');
        }
      }
    }
  }

  save(): ImageBgColorData {
    return this.data;
  }
}
