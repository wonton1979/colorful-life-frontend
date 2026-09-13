import { Link } from 'react-router-dom'
import { useState } from 'react'

const shopItems = ['New Arrivals', 'Deals']
const customerServiceItems = ['Delivery Information', 'Returns & Refunds', 'FAQs', 'Contact Us']
const aboutItems = ['Our Story', 'Why Shop With Us', 'Reviews']

function PresentationItem({ children }: { children: string }) {
  return <span className="block py-1 text-sm text-slate-600">{children}</span>
}

function MobileSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="border-t border-amber-200">
      <h2 id={`${id}-heading`}>
        <button className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((current) => !current)}>
          {title}
          <span aria-hidden="true" className="text-lg font-normal">{open ? '−' : '+'}</span>
        </button>
      </h2>
      {open && <div id={id} className="pb-4" role="region" aria-labelledby={`${id}-heading`}>{children}</div>}
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-amber-200 bg-amber-50/60 text-slate-800">
      <div className="mx-auto hidden max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid lg:grid-cols-[1.4fr_1fr_1.3fr_1fr] lg:px-8">
        <div>
          <img className="h-auto w-48 max-w-full object-contain" src="/images/branding/build-and-bloom-footer-dog.png" alt="Build & Bloom by Colorful Life" />
          <p className="mt-5 text-sm text-slate-600">© 2026 Colorful Life Ltd. All rights reserved.</p>
        </div>
        <nav aria-label="Footer shop navigation">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Shop</h2>
          <ul className="mt-4 space-y-1">
            <li><Link className="block cursor-pointer rounded-sm py-1 text-sm text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to="/catalogue">All Sets</Link></li>
            {shopItems.map((item) => <li key={item}><PresentationItem>{item}</PresentationItem></li>)}
          </ul>
        </nav>
        <nav aria-label="Footer customer service navigation">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Customer Service</h2>
          <ul className="mt-4 space-y-1">
            {customerServiceItems.map((item) => <li key={item}><PresentationItem>{item}</PresentationItem></li>)}
          </ul>
        </nav>
        <nav aria-label="Footer about navigation">
          <h2 className="text-sm font-semibold uppercase tracking-wide">About</h2>
          <ul className="mt-4 space-y-1">
            {aboutItems.map((item) => <li key={item}><PresentationItem>{item}</PresentationItem></li>)}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:hidden">
        <div className="flex flex-col items-center pb-6 text-center">
          <img className="h-auto w-56 max-w-full object-contain" src="/images/branding/build-and-bloom-footer-dog.png" alt="Build & Bloom by Colorful Life" />
          <p className="mt-4 max-w-xs text-sm text-slate-600">© 2026 Colorful Life Ltd. All rights reserved.</p>
        </div>
        <div>
          <MobileSection id="mobile-footer-shop" title="Shop">
            <ul className="space-y-1">
              <li><Link className="block cursor-pointer rounded-sm py-1 text-sm text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to="/catalogue">All Sets</Link></li>
              {shopItems.map((item) => <li key={item}><PresentationItem>{item}</PresentationItem></li>)}
            </ul>
          </MobileSection>
          <MobileSection id="mobile-footer-customer-service" title="Customer Service">
            <ul className="space-y-1">{customerServiceItems.map((item) => <li key={item}><PresentationItem>{item}</PresentationItem></li>)}</ul>
          </MobileSection>
          <MobileSection id="mobile-footer-about" title="About">
            <ul className="space-y-1">{aboutItems.map((item) => <li key={item}><PresentationItem>{item}</PresentationItem></li>)}</ul>
          </MobileSection>
        </div>
      </div>
    </footer>
  )
}
