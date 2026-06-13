import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Ứng dụng có phiên bản mới, bạn có muốn cập nhật không?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Ứng dụng đã sẵn sàng để hoạt động offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
