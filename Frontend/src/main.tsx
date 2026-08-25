import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeToaster } from '@/components/ui/ThemeToaster'
import { 
  RouterProvider, 
} from 'react-router-dom'

import store from './store/store'

import './index.css'

import { router } from './router'
import { ThemeProvider } from './components/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ThemeToaster />
        <RouterProvider 
          router={router} 
          fallbackElement={
            <div className="flex h-screen w-full items-center justify-center bg-surface-container">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          } 
        />
      </ThemeProvider>
    </Provider>
  // </React.StrictMode>,
)
