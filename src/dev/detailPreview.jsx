import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ConstellationDetail from '../pages/ConstellationDetail'
import ConstellationList from '../pages/ConstellationList'
import Home from '../pages/Home'
import PhotoAnalysis from '../pages/PhotoAnalysis'
import StarForecast from '../pages/StarForecast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/constellations']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast" element={<StarForecast />} />
        <Route path="/photo" element={<PhotoAnalysis />} />
        <Route path="/constellations" element={<ConstellationList />} />
        <Route path="/constellations/:id" element={<ConstellationDetail />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>,
)
