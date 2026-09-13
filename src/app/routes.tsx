import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell.tsx'
import { CataloguePage } from '../features/catalogue/CataloguePage.tsx'
import { ProductDetailPage } from '../features/catalogue/ProductDetailPage.tsx'
import { HomePage } from '../pages/HomePage.tsx'
import { NotFoundPage } from '../pages/NotFoundPage.tsx'
import { LoginPage } from '../features/auth/LoginPage.tsx'
import { RegisterPage } from '../features/auth/RegisterPage.tsx'
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="catalogue/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
