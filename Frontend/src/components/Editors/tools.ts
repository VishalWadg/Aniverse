import Header from '@editorjs/header'
import List from '@editorjs/list'
import CyQuote from '@cychann/editorjs-quote'
import Embed from '@editorjs/embed'
import ImageTool from '@editorjs/image'
import LinkTool from '@editorjs/link'
import Marker from '@editorjs/marker'
import RawTool from '@editorjs/raw'
import CoolDelimiter from '@coolbytes/editorjs-delimiter'
import TextStyle from '@skchawala/editorjs-text-style'
import ColorPicker from 'editorjs-color-picker'
import ParagraphWithAlignment from 'editorjs-paragraph-with-alignment'
import CropperTune from 'editorjs-image-crop-resize'
import 'editorjs-image-crop-resize/dist/cropper-tune.css'
import ImageAlignTune from './tunes/ImageAlignTune'
import ImageBgColorTune from './tunes/ImageBgColorTune'
import { uploadImageToCloudinary, uploadImageUrlToCloudinary } from '@/api/uploadApi'

/**
 * Helper function to handle Editor.js image upload formatting and error boundaries.
 * Keeps the plugin configuration DRY and strictly typed.
 */
const handleImageUpload = async (uploadPromise: Promise<any>) => {
  try {
    const uploadData = await uploadPromise;
    
    if (uploadData?.secure_url) {
      return {
        success: 1,
        file: {
          url: uploadData.secure_url,
          public_id: uploadData.public_id,
        },
      }
    }
    
    return { success: 0, message: "Upload failed: Invalid response from server" };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: 0, message: errorMessage };
  }
};

export const tools = {
  header: {
    class: Header,
    inlineToolbar: ['link'],
    config: { placeholder: 'Section title' },
  },
  // Overriding the default paragraph with the alignment plugin
  paragraph: {
    class: ParagraphWithAlignment,
    inlineToolbar: true,
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  // Overriding the default quote with CyQuote
  quote: {
    class: CyQuote,
    inlineToolbar: true,
    config: {
      defaultType: 'verticalLine',
      quotePlaceholder: 'Pull quote',
      captionPlaceholder: 'Source or note',
    },
  },
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        vimeo: true,
        instagram: true,
      },
    },
  },
  ImageAlignTune: {
    class: ImageAlignTune,
  },
  ImageBgColorTune: {
    class: ImageBgColorTune,
  },
  CropperTune: {
    class: CropperTune,
  },
  image: {
    class: ImageTool,
    tunes: ['ImageAlignTune', 'ImageBgColorTune', 'CropperTune'],
    config: {
      features: { border: true, stretch: true, caption: 'optional', bg: true },
      uploader: {
        uploadByFile: (file: File) => handleImageUpload(uploadImageToCloudinary(file)),
        uploadByUrl: (url: string) => handleImageUpload(uploadImageUrlToCloudinary(url)),
      },
    },
  },
  linkTool: {
    class: LinkTool,
  },
  marker: {
    class: Marker,
    shortcut: 'CMD+SHIFT+M',
  },
  raw: {
    class: RawTool,
  },
  // Overriding the default delimiter
  delimiter: {
    class: CoolDelimiter,
  },
  textStyle: {
    class: TextStyle,
    inlineToolbar: true,
  },
  color: {
    class: ColorPicker,
    config: { defaultColor: '#ff4500' },
  },
}