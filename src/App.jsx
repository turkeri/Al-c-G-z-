import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/Layout/BottomNav'
import HomePage from './pages/HomePage'
import AnalysisFormPage from './pages/AnalysisFormPage'
import AnalysisResultPage from './pages/AnalysisResultPage'
import ChronicIssuesPage from './pages/ChronicIssuesPage'
import InspectionChecklistPage from './pages/InspectionChecklistPage'
import FavoritesPage from './pages/FavoritesPage'

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analiz" element={<AnalysisFormPage />} />
          <Route path="/sonuc" element={<AnalysisResultPage />} />
          <Route path="/kronik-sorunlar" element={<ChronicIssuesPage />} />
          <Route path="/kontrol-listesi" element={<InspectionChecklistPage />} />
          <Route path="/favoriler" element={<FavoritesPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
