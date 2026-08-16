import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BottomNav from './components/Layout/BottomNav'
import SplashScreen from './components/SplashScreen'
import { hydrateVehicleData, subscribeDataset } from './services/vehicleDataStore'

// Her araç ekranını ilk açılışta indirmek, mobil bağlantıda ilan analizine
// ulaşmadan 1 MB'ın üzerinde JavaScript bekletiyordu. Sayfalar ihtiyaç
// anında yüklenir; veri deposu ve PWA davranışı aynen korunur.
const HomePage = lazy(() => import('./pages/HomePage'))
const AnalysisFormPage = lazy(() => import('./pages/AnalysisFormPage'))
const ListingAnalysisPage = lazy(() => import('./pages/ListingAnalysisPage'))
const ExpertiseReportPage = lazy(() => import('./pages/ExpertiseReportPage'))
const AnalysisResultPage = lazy(() => import('./pages/AnalysisResultPage'))
const ChronicIssuesPage = lazy(() => import('./pages/ChronicIssuesPage'))
const InspectionChecklistPage = lazy(() => import('./pages/InspectionChecklistPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const LoanCalculatorPage = lazy(() => import('./pages/LoanCalculatorPage'))
const ExpertiseNotesPage = lazy(() => import('./pages/ExpertiseNotesPage'))
const PaintCheckPage = lazy(() => import('./pages/PaintCheckPage'))
const VehicleComparePage = lazy(() => import('./pages/VehicleComparePage'))
const DiagnosisPage = lazy(() => import('./pages/DiagnosisPage'))
const InspectionHubPage = lazy(() => import('./pages/InspectionHubPage'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const GaragePage = lazy(() => import('./pages/GaragePage'))
const DamageRecordPage = lazy(() => import('./pages/DamageRecordPage'))
const MicronReportPage = lazy(() => import('./pages/MicronReportPage'))
const OwnershipCostPage = lazy(() => import('./pages/OwnershipCostPage'))
const ObdCodePage = lazy(() => import('./pages/ObdCodePage'))
const SafePurchasePage = lazy(() => import('./pages/SafePurchasePage'))
const SellerQuestionsPage = lazy(() => import('./pages/SellerQuestionsPage'))

export default function App() {
  const location = useLocation()
  const [splashDone, setSplashDone] = useState(false)
  const handleSplashDone = useCallback(() => setSplashDone(true), [])
  // Veri deposu güncellenince ekranlar yeniden çizilsin.
  const [dataVersion, setDataVersion] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeDataset(() => setDataVersion((v) => v + 1))
    // Senkronizasyon açılış animasyonu sürerken arka planda yapılır;
    // başarısız olursa uygulama gömülü veriyle çalışmaya devam eder.
    hydrateVehicleData()
    return unsubscribe
  }, [])

  return (
    <div className="app-shell">
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div className="app-content">
        {/* Anahtara veri sürümü de girer: sayfalar listeleri useMemo ile bir kez
            hesapladığı için, sunucudan yeni veri geldiğinde yeniden kurulmaları
            gerekir. Veri en fazla açılışta bir kez değişir, maliyeti yok. */}
        <div className="route-transition" key={location.pathname + ':' + dataVersion}>
          <Suspense fallback={<div className="route-loading" role="status">Sayfa yükleniyor…</div>}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />

            {/* Analiz akışı */}
            <Route path="/ilan-analizi" element={<ListingAnalysisPage />} />
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
            <Route path="/rapor" element={<ExpertiseReportPage />} />

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
          </Suspense>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
