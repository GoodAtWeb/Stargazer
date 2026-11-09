import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ConstellationDetail from '../pages/ConstellationDetail'
import PhotoAnalysis from '../pages/PhotoAnalysis'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/photo']}>
      <Routes>
        <Route path="/photo" element={<PhotoAnalysis />} />
        <Route path="/constellations/:id" element={<ConstellationDetail />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>,
)
