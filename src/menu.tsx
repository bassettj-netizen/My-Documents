import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MenuPage from './MenuPage.tsx'

createRoot(document.getElementById('menu-root')!).render(
  <StrictMode>
    <MenuPage />
  </StrictMode>,
)
