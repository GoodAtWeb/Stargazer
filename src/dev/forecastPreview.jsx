import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import StarForecast from '../pages/StarForecast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/forecast']}>
      <Routes>
        <Route path="/forecast" element={<StarForecast />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>,
)
