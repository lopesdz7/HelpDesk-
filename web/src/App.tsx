import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppRoutes } from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Erros 4xx não melhoram com nova tentativa.
      retry: (failureCount, error) =>
        !(error instanceof AxiosError && (error.response?.status ?? 500) < 500) && failureCount < 2,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              '!rounded-lg !border !border-gray-500 !bg-gray-600 !font-sans !text-gray-200 !shadow-md',
            description: '!text-gray-300',
            success: '[&_[data-icon]]:!text-done',
            error: '[&_[data-icon]]:!text-danger',
          },
        }}
      />
    </QueryClientProvider>
  )
}
