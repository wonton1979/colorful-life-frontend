import { useState } from 'react'
import { Link } from 'react-router-dom'

function MenuIcon() {
  return <svg aria-hidden="true" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
}

function UserIcon() {
  return <svg aria-hidden="true" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.1-5.2 7-5.2s6.3 1.8 7 5.2" /></svg>
}

function CartIcon() {
  return <svg aria-hidden="true" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5h2l1.6 10.2a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 2-1.7L20 8H7" /><circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></svg>
}

function SearchIcon() {
  return <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
}

function ChevronDown() {
  return <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid min-h-24 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-1 sm:px-6 lg:grid-cols-[minmax(180px,1fr)_auto_minmax(240px,1fr)] lg:gap-8 lg:px-8">
        <button className="rounded-sm p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 lg:hidden" type="button" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <MenuIcon />
        </button>
        <Link className="col-start-2 justify-self-center shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700 lg:col-start-1 lg:justify-self-start" to="/">
          <img className="h-16 w-auto max-w-[160px] object-contain sm:h-[5.5rem] sm:max-w-[194px] lg:h-24" src="/images/branding/build-and-bloom-logo.png" alt="Build & Bloom by Colorful Life" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex" aria-label="Primary navigation">
          <Link className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700" to="/catalogue">Shop</Link>
          <button className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700" type="button">Themes <ChevronDown /></button>
          <button className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700" type="button">New Arrivals</button>
          <button className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700" type="button">Deals</button>
          <button className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700" type="button">About Us</button>
        </nav>
        <div className="col-start-3 flex items-center justify-self-end gap-3 lg:col-start-3">
          <label className="relative hidden items-center lg:flex">
            <input className="w-44 rounded-full border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm outline-none placeholder:text-slate-500 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 sm:w-56" type="search" placeholder="Search sets, themes..." readOnly aria-label="Search sets and themes" />
            <span className="pointer-events-none absolute right-3 flex items-center"><SearchIcon /></span>
          </label>
          <button className="rounded-sm p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" aria-label="Account"><UserIcon /></button>
          <button className="rounded-sm p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" aria-label="Cart"><CartIcon /></button>
        </div>
        <label className="relative col-span-3 row-start-2 flex items-center lg:hidden">
          <input className="w-full rounded-full border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm outline-none placeholder:text-slate-500 focus:border-slate-700 focus:ring-2 focus:ring-slate-200" type="search" placeholder="Search sets, themes..." readOnly aria-label="Search sets and themes" />
          <span className="pointer-events-none absolute right-3 flex items-center"><SearchIcon /></span>
        </label>
        {menuOpen && (
          <nav id="mobile-primary-navigation" className="col-span-3 row-start-3 flex flex-col gap-1 border-t border-slate-100 py-3 text-sm font-medium lg:hidden" aria-label="Mobile primary navigation">
            <Link className="rounded-sm px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to="/catalogue">Shop</Link>
            <button className="inline-flex items-center gap-1 rounded-sm px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button">Themes <ChevronDown /></button>
            <button className="rounded-sm px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button">New Arrivals</button>
            <button className="rounded-sm px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button">Deals</button>
            <button className="rounded-sm px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button">About Us</button>
          </nav>
        )}
      </div>
    </header>
  )
}
