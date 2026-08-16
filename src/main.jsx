import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

/*
 * Web Share Target manifesti paylaşımı uygulama kökündeki query parametreleri
 * ile açar. HashRouter bu parametreleri route olarak görmez; ilk çizimden
 * önce onları İlan Analizi rotasına taşır. URL tarayıcıda kalır, arka planda
 * hiçbir ilan sitesine gidilmez.
 */
const shared = new URLSearchParams(window.location.search)
if (shared.has('share-url') || shared.has('share-text')) {
  window.history.replaceState(null, '', `${window.location.pathname}#/ilan-analizi?${shared.toString()}`)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
