import { Outlet } from 'react-router-dom'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

export function AppShell() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
