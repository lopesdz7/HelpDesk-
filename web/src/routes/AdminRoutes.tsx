import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminTickets } from '@/pages/admin/AdminTickets'
import { Clients } from '@/pages/admin/Clients'
import { Services } from '@/pages/admin/Services'
import { TechnicianForm } from '@/pages/admin/TechnicianForm'
import { Technicians } from '@/pages/admin/Technicians'
import { TicketDetails } from '@/pages/shared/TicketDetails'

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<AdminTickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/technicians/new" element={<TechnicianForm />} />
        <Route path="/technicians/:id" element={<TechnicianForm />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/services" element={<Services />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
