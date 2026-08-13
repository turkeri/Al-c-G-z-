import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/Layout/BottomNav'
import HomePage from './pages/HomePage'
import AnalysisFormPage from './pages/AnalysisFormPage'
import AnalysisResultPage from './pages/AnalysisResultPage'
import ChronicIssuesPage from './pages/ChronicIssuesPage'
import InspectionChecklistPage from './pages/InspectionChecklistPage'
import FavoritesPage from './pages/FavoritesPage'
import ComparePage from './pages/ComparePage'
import LoanCalculatorPage from './pages/LoanCalculatorPage'
import ExpertiseNotesPage from './pages/ExpertiseNotesPage'
import PaintCheckPage from './pages/PaintCheckPage'

export default function App() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <div className="app-content">
        <div className="route-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/analiz" element={<AnalysisFormPage />} />
            <Route path="/sonuc" element={<AnalysisResultPage />} />
            <Route path="/kronik-sorunlar" element={<ChronicIssuesPage />} />
            <Route path="/kontrol-listesi" element={<InspectionChecklistPage />} />
            <Route path="/favoriler" element={<FavoritesPage />} />
            <Route path="/karsilastir" element={<ComparePage />} />
            <Route path="/kredi-hesapla" element={<LoanCalculatorPage />} />
            <Route path="/ekspertiz-notlari" element={<ExpertiseNotesPage />} />
            <Route path="/boya-degisen" element={<PaintCheckPage />} />
          </Routes>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
