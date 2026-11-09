import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ConstellationDetail from '../pages/ConstellationDetail'
import Home from '../pages/Home'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/constellations/:id" element={<ConstellationDetail />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>,
)
