import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PwaRegistration } from './pwa/PwaRegistration'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaRegistration />
    <App />
  </StrictMode>,
)
