import EditorJs from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import List from '@editorjs/list'
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote'
import CyQuote from '@cychann/editorjs-quote'
import Embed from '@editorjs/embed'
import ImageTool from '@editorjs/image'
import SimpleImage from '@editorjs/simple-image'
import LinkTool from '@editorjs/link'
import Marker from '@editorjs/marker'
import RawTool from '@editorjs/raw'
import Delimiter from '@editorjs/delimiter'
import CoolDelimiter from '@coolbytes/editorjs-delimiter'
import TextStyle from '@skchawala/editorjs-text-style'
import ColorPicker from 'editorjs-color-picker'
import ParagraphWithAlignment from 'editorjs-paragraph-with-alignment'
import TitleTool from 'title-editorjs'

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
  },
  cyQuote: {
    class: CyQuote,
    inlineToolbar: true,
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
//   image: {
//     class: ImageTool,
//     config: {
//       uploader: {
//         async uploadByFile(file: File) {
//           const form = new FormData()
//           form.append('file', file)
//           const response = await fetch('/api/v1/uploads/editor-image', {
//             method: 'POST',
//             body: form,
//             headers: { Authorization: `Bearer ${yourAuthToken}` }, // add if needed
//           })
//           const json = await response.json()
//           return { success: 1, file: { url: json.url } }
//         },
//         async uploadByUrl(url: string) {
//           const response = await fetch('/api/v1/uploads/editor-image', {
//             method: 'POST',
//             body: JSON.stringify({ url }),
//             headers: { 'Content-Type': 'application/json' },
//           })
//           const json = await response.json()
//           return { success: 1, file: { url: json.url } }
//         },
//       },
//     },
//   },
  'simple-image': {
    class: SimpleImage,
    inlineToolbar: true,
  },
  linkTool: {
    class: LinkTool,
    config: { endpoint: '/api/v1/url-meta' },
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
  title: {
    class: TitleTool,
    config: { placeholder: 'Add title...' },
  },
}
