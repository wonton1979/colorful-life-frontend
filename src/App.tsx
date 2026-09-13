import { AppRoutes } from './app/routes.tsx'
import { AuthProvider } from './features/auth/AuthContext.tsx'

function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}

export default App
