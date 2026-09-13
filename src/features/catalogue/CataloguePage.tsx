import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { getProducts } from './api.ts'
import { ProductCard } from './ProductCard.tsx'
import type { ProductsResponse } from './types.ts'
import type { GetProductsParams } from './types.ts'

type CatalogueState =
  | { status: 'loading' }
  | { status: 'success'; data: ProductsResponse }
  | { status: 'error' }

type CatalogueFilters = {
  q: string
  theme: string
  minPrice: string
  maxPrice: string
}

const initialFilters: CatalogueFilters = { q: '', theme: '', minPrice: '', maxPrice: '' }

export function CataloguePage() {
  const [state, setState] = useState<CatalogueState>({ status: 'loading' })
  const [query, setQuery] = useState<GetProductsParams>({ page: 1, pageSize: 20 })
  const [filters, setFilters] = useState<CatalogueFilters>(initialFilters)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const shouldScrollToResults = useRef(false)

  useEffect(() => {
    let cancelled = false

    getProducts(query)
        .then((data) => {
          if (!cancelled) {
            setState({ status: 'success', data })
            if (shouldScrollToResults.current) {
              shouldScrollToResults.current = false
              resultsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
            }
          }
        })
        .catch(() => {
          if (!cancelled) {
            setState({ status: 'error' })
          }
        })

    return () => {
      cancelled = true
    }
  }, [query])

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage(null)

    const min = filters.minPrice.trim()
    const max = filters.maxPrice.trim()
    const minPrice = min === '' ? undefined : Number(min)
    const maxPrice = max === '' ? undefined : Number(max)

    if ((min !== '' && (minPrice === undefined || !Number.isFinite(minPrice) || minPrice < 0)) ||
        (max !== '' && (maxPrice === undefined || !Number.isFinite(maxPrice) || maxPrice < 0))) {
      setValidationMessage('Prices must be valid, non-negative numbers.')
      return
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setValidationMessage('Minimum price cannot be greater than maximum price.')
      return
    }

    const params: GetProductsParams = { page: 1, pageSize: 20 }
    const q = filters.q.trim()
    const theme = filters.theme.trim()
    if (q) params.q = q
    if (theme) params.theme = theme
    if (minPrice !== undefined) params.minPrice = minPrice
    if (maxPrice !== undefined) params.maxPrice = maxPrice
    setQuery(params)
  }

  function handlePageChange(direction: -1 | 1) {
    if (state.status !== 'success') return

    const { page, totalPages } = state.data.pagination
    const nextPage = page + direction
    if (nextPage < 1 || nextPage > totalPages) return

    shouldScrollToResults.current = true
    setQuery((current) => ({ ...current, page: nextPage }))
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <form className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium">Search <input className="rounded-md border border-slate-300 px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
        <label className="flex flex-col gap-1 text-sm font-medium">Theme <input className="rounded-md border border-slate-300 px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" value={filters.theme} onChange={(event) => setFilters({ ...filters, theme: event.target.value })} /></label>
        <label className="flex flex-col gap-1 text-sm font-medium">Minimum price <input className="rounded-md border border-slate-300 px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} /></label>
        <label className="flex flex-col gap-1 text-sm font-medium">Maximum price <input className="rounded-md border border-slate-300 px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} /></label>
        <button className="cursor-pointer rounded-md border border-slate-700 bg-slate-700 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="submit">Apply</button>
      </form>
      {validationMessage && <p role="alert">{validationMessage}</p>}
      <section ref={resultsRef} aria-label="Catalogue results" className="space-y-6">
        {state.status === 'loading' && <p>Loading catalogue...</p>}
        {state.status === 'error' && <p>Unable to load catalogue.</p>}
        {state.status === 'success' && state.data.items.length === 0 && <p>Catalogue is empty.</p>}
        {state.status === 'success' && state.data.items.length > 0 && <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {state.data.items.map((listing) => <ProductCard key={listing.id} listing={listing} />)}
        </ul>}
        {state.status === 'success' && <nav className="flex items-center justify-center gap-4" aria-label="Catalogue pagination">
          <button className="cursor-pointer rounded-md border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => handlePageChange(-1)} disabled={state.data.pagination.page <= 1}>Previous</button>
          <span aria-live="polite">Page {state.data.pagination.page} of {state.data.pagination.totalPages}</span>
          <button className="cursor-pointer rounded-md border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => handlePageChange(1)} disabled={state.data.pagination.totalPages === 0 || state.data.pagination.page >= state.data.pagination.totalPages}>Next</button>
        </nav>}
      </section>
    </div>
  )
}
