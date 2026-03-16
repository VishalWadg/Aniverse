import React from 'react'
import {Editor} from '@tinymce/tinymce-react'
import {Controller} from 'react-hook-form'

export default function RTE({name, control, label, defaultValue=""}) {
  return (
    <div className='w-full'>
        {label && <label
        className='inline-block mb-1 pl-1'>
        {label}</label>}

        <Controller // Controller is used to wrap custom components so that they can be integrated with react-hook-form in this case Editor component is a custom component
          name={name} // name of the field used for form submission 
          control={control}  // control is given by useForm hook of react-hook-form
          render={({ field: { onChange } }) => (  // render is a prop of Controller component which is used to render the custom component. 
            <Editor
              apiKey='iu0w1o8c8pzixkx6c2q6ihrdaa76mbxk4eh5u45q5eyyvurq'
              initialValue={defaultValue}  // initialValue is the initial content of the editor
              init={{
                initialValue: defaultValue, 
                height: 500,  
                menubar: true,
                plugins: [
                  "image",
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                  "anchor",
                ],
                toolbar:
                  'undo redo | casechange | styleselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
              onEditorChange={onChange} // onEditorChange is a prop of Editor component which is called whenever there is a change in the content of the editor
            />
          )}
        />
    </div>
  )
}