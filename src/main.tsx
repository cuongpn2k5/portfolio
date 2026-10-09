import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'pullcord/pullcord.css'
import './index.css'
import './utils/gsap'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
