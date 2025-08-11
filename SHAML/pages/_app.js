import '../styles/globals.css'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { JobProvider } from '../contexts/JobContext'
import { ApplicationProvider } from '../contexts/ApplicationContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'

function MyApp({ Component, pageProps }) {
  // Create a client instance. This is necessary for react-query to work.
  const [queryClient] = useState(() => new QueryClient())

  return (
    // Provide the client to your App. This wrapper must be outside all other components
    // that use react-query hooks like `useQuery`.
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <JobProvider>
            <ApplicationProvider>
              <Component {...pageProps} />
            </ApplicationProvider>
          </JobProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default MyApp
