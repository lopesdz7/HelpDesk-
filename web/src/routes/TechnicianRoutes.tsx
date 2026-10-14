import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { TicketDetails } from '@/pages/shared/TicketDetails'
import { TechnicianTickets } from '@/pages/technician/TechnicianTickets'

export function TechnicianRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<TechnicianTickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
