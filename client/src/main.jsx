import 'bootstrap/dist/css/bootstrap.min.css'
import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Sentry — only active when VITE_SENTRY_DSN is provided at build time.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    sendDefaultPii: false,
  })
}

// Plausible analytics (or any compatible vendor — same script-tag shape).
// Set VITE_PLAUSIBLE_DOMAIN to your registered site domain to enable.
if (import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
  const s = document.createElement('script')
  s.defer = true
  s.setAttribute('data-domain', import.meta.env.VITE_PLAUSIBLE_DOMAIN)
  s.src = import.meta.env.VITE_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'
  document.head.appendChild(s)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
