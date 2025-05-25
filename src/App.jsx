import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import PatientsPage from './pages/PatientsPage'
import ProvidersPage from './pages/ProvidersPage'
import ServicesPage from './pages/ServicesPage'
import AppointmentsPage from './pages/AppointmentsPage'
import ClaimsPage from './pages/ClaimsPage'
import PatientFormPage from './pages/PatientFormPage'
import PatientDetailPage from './pages/PatientDetailPage'
import ProviderFormPage from './pages/ProviderFormPage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import ServiceFormPage from './pages/ServiceFormPage'
import AppointmentFormPage from './pages/AppointmentFormPage'
import ClaimDetailPage from './pages/ClaimDetailPage'
import AppointmentDetailPage from './pages/AppointmentDetailPage'
import AuditPage from './pages/AuditPage'
import ClaimFormPage from './pages/ClaimFormPage'
import SimpleOllamaTest from './pages/SimpleOllamaTest'
// Import other pages as needed

function App() {
  return (
    <>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/new" element={<PatientFormPage />} />
          <Route path="/patients/:id/edit" element={<PatientFormPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          {/* TODO: Add routes for patient/:id */}
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/new" element={<ProviderFormPage />} />
          <Route path="/providers/:id/edit" element={<ProviderFormPage />} />
          <Route path="/providers/:id" element={<ProviderDetailPage />} />
          {/* TODO: Add routes for provider/:id */}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/new" element={<ServiceFormPage />} />
          <Route path="/services/:id/edit" element={<ServiceFormPage />} />
          {/* No dedicated detail page for services in this example */}
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/new" element={<AppointmentFormPage />} />
          <Route path="/appointments/:id/edit" element={<AppointmentFormPage />} />
          {/* No dedicated detail page for appointments in this example */}
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/claims/new" element={<ClaimFormPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/claims/:id/edit" element={<ClaimFormPage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/simple-test" element={<SimpleOllamaTest />} />
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
    </>
  )
}

export default App
