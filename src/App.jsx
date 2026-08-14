import { useCallback, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BottomNav from './components/Layout/BottomNav'
import SplashScreen from './components/SplashScreen'
import HomePage from './pages/HomePage'
import AnalysisFormPage from './pages/AnalysisFormPage'
import AnalysisResultPage from './pages/AnalysisResultPage'
import ChronicIssuesPage from './pages/ChronicIssuesPage'
import InspectionChecklistPage from './pages/InspectionChecklistPage'
import ComparePage from './pages/ComparePage'
import LoanCalculatorPage from './pages/LoanCalculatorPage'
import ExpertiseNotesPage from './pages/ExpertiseNotesPage'
import PaintCheckPage from './pages/PaintCheckPage'
import VehicleComparePage from './pages/VehicleComparePage'
import DiagnosisPage from './pages/DiagnosisPage'
import InspectionHubPage from './pages/InspectionHubPage'
import GuidePage from './pages/GuidePage'
import GaragePage from './pages/GaragePage'
import DamageRecordPage from './pages/DamageRecordPage'
import MicronReportPage from './pages/MicronReportPage'
import OwnershipCostPage from './pages/OwnershipCostPage'
import ObdCodePage from './pages/ObdCodePage'
import SafePurchasePage from './pages/SafePurchasePage'
import SellerQuestionsPage from './pages/SellerQuestionsPage'

export default function App() {
  const location = useLocation()
  const [splashDone, setSplashDone] = useState(false)
  const handleSplashDone = useCallback(() => setSplashDone(true), [])

  return (
    <div className="app-shell">
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div className="app-content">
        <div className="route-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />

            {/* Analiz akışı */}
            <Route path="/analiz" element={<AnalysisFormPage />} />
            <Route path="/sonuc" element={<AnalysisResultPage />} />
            <Route path="/kredi-hesapla" element={<LoanCalculatorPage />} />

            {/* Yerinde kontrol akışı */}
            <Route path="/yerinde-kontrol" element={<InspectionHubPage />} />
            <Route path="/kontrol-listesi" element={<InspectionChecklistPage />} />
            <Route path="/ekspertiz-raporu" element={<MicronReportPage />} />
            <Route path="/boya-degisen" element={<PaintCheckPage />} />
            <Route path="/tramer" element={<DamageRecordPage />} />
            <Route path="/satici-sorulari" element={<SellerQuestionsPage />} />
            <Route path="/ekspertiz-notlari" element={<ExpertiseNotesPage />} />

            {/* Araç rehberi */}
            <Route path="/rehber" element={<GuidePage />} />
            <Route path="/kronik-sorunlar" element={<ChronicIssuesPage />} />
            <Route path="/aracimin-nesi-var" element={<DiagnosisPage />} />
            <Route path="/arac-karsilastir" element={<VehicleComparePage />} />
            <Route path="/obd" element={<ObdCodePage />} />
            <Route path="/maliyet" element={<OwnershipCostPage />} />
            <Route path="/guvenli-alim" element={<SafePurchasePage />} />

            {/* Garaj */}
            <Route path="/garaj" element={<GaragePage />} />
            <Route path="/karsilastir" element={<ComparePage />} />

            {/* Eski adres, yeni yerine yönlendirilir */}
            <Route path="/favoriler" element={<Navigate to="/garaj" replace />} />
          </Routes>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
