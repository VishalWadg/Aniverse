import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import List from '@editorjs/list'
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote'
import CyQuote from '@cychann/editorjs-quote'
import Embed from '@editorjs/embed'
import SimpleImage from '@editorjs/simple-image'
import ImageTool from '@editorjs/image'
import LinkTool from '@editorjs/link'
import Marker from '@editorjs/marker'
import RawTool from '@editorjs/raw'
import Delimiter from '@editorjs/delimiter'
import CoolDelimiter from '@coolbytes/editorjs-delimiter'
import TextStyle from '@skchawala/editorjs-text-style'
import ColorPicker from 'editorjs-color-picker'
import ParagraphWithAlignment from 'editorjs-paragraph-with-alignment'
import { uploadImageToCloudinary, uploadImageUrlToCloudinary } from '@/api/uploadApi'

const editorBackendBaseUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')
const linkToolEndpoint = editorBackendBaseUrl
  ? `${editorBackendBaseUrl}/url-meta`
  : '/api/v1/url-meta'

export const tools = {
  header: {
    class: Header,
    inlineToolbar: ['link'],
    config: { placeholder: 'Section title' },
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
  },
  'paragraph-with-alignment': {
    class: ParagraphWithAlignment,
    inlineToolbar: true,
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Pull quote',
      captionPlaceholder: 'Source or note',
    },
  },
  cyQuote: {
    class: CyQuote,
    inlineToolbar: true,
    config: {
      defaultType: 'verticalLine',
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
  image: {
    class: ImageTool,
    config: {

      uploader: {
        /**
                 * This function triggers when a user drops a file into Editor.js
                 */
        async uploadByFile(file: File) {
          try {
            const uploadData = await uploadImageToCloudinary(file);
            if (uploadData.secure_url) {
              return {
                success: 1,
                file: {
                  url: uploadData.secure_url,
                }
              }
            } else {
              return {
                success: 0,
                message: "Upload failed",
              }
            }
          } catch (error: any) {
            return { success: 0, message: error.message || "An error occured" };
          }
        },
        async uploadByUrl(url: string) {
          try {
            const uploadData = await uploadImageUrlToCloudinary(url);
            if (uploadData.secure_url) {
              return {
                success: 1,
                file: {
                  url: uploadData.secure_url,
                }
              }
            } else {
              return {
                success: 0,
                message: "URL Upload failed",
              }
            }
          } catch (error: any) {
            return { success: 0, message: error.message || "An error occured" };
          }
        },
      },
    },
  },
  'simple-image': {
    class: SimpleImage,
    inlineToolbar: true,
  },
  linkTool: {
    class: LinkTool,
    config: { endpoint: linkToolEndpoint },
  },
  marker: {
    class: Marker,
    shortcut: 'CMD+SHIFT+M',
  },
  raw: {
    class: RawTool,
  },
  delimiter: {
    class: Delimiter,
  },
  'cool-delimiter': {
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
