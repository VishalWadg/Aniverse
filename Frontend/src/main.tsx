import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { 
  RouterProvider, 
} from 'react-router-dom'

import store from './store/store'

import './index.css'

import { router } from './router'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Provider store={store}>
      <Toaster
        position="top-right"
        theme="dark"
        closeButton
        richColors
        duration={4000}
        visibleToasts={3}
        offset={16}
        toastOptions={{
          classNames: {
            toast:
              'border border-white/10 bg-zinc-950 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)]',
            title: 'text-sm font-medium text-white',
            description: 'text-xs text-zinc-400',
            content: 'gap-1',
            icon: 'text-zinc-200',
            success: 'border-emerald-500/30 bg-zinc-950',
            error: 'border-red-500/35 bg-zinc-950',
            info: 'border-sky-500/30 bg-zinc-950',
            loading: 'border-white/10 bg-zinc-950',
            closeButton:
              'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white',
          },
        }}
      />
      <RouterProvider router={router} />
    </Provider>
  // </React.StrictMode>,
)
