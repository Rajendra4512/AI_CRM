import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import ConstructionMarketing from './pages/ConstructionMarketing'
import ClinicalMarketing from './pages/ClinicalMarketing'
import MaritimeMarketing from './pages/MaritimeMarketing'
import { Login } from './pages/app/Login'
import { Dashboard } from './pages/app/Dashboard'
import { LeadsPipeline } from './pages/app/LeadsPipeline'
import { CompaniesContacts } from './pages/app/CompaniesContacts'
import { VerticalHub } from './pages/app/VerticalHub'
import { AdminConsole } from './pages/app/AdminConsole'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing & Vertical Discovery */}
        <Route path="/" element={<Welcome />} />
        <Route path="/vertical/construction" element={<ConstructionMarketing />} />
        <Route path="/vertical/clinical" element={<ClinicalMarketing />} />
        <Route path="/vertical/maritime" element={<MaritimeMarketing />} />

        {/* Authentication & Workspace Registration */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        {/* Internal Authenticated CRM Portal */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/leads" element={<LeadsPipeline />} />
        <Route path="/app/contacts" element={<CompaniesContacts />} />
        <Route path="/app/verticals" element={<VerticalHub />} />
        <Route path="/app/admin" element={<AdminConsole />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
