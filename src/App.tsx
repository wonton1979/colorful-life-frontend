import { AppRoutes } from './app/routes.tsx'
import { AuthProvider } from './features/auth/AuthContext.tsx'
import { CartProvider } from './features/cart/CartContext.tsx'

function App() {
  return <AuthProvider><CartProvider><AppRoutes /></CartProvider></AuthProvider>
}

export default App
