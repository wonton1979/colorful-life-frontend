import { useEffect, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from './api.ts'
import type { ProductListing, ProductsResponse } from './types.ts'
import type { GetProductsParams } from './types.ts'

type CatalogueState =
  | { status: 'loading' }
  | { status: 'success'; data: ProductsResponse }
  | { status: 'error' }

function getDisplayedPrice(listing: ProductListing) {
  return listing.salePrice ?? listing.originalPrice
}

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

  useEffect(() => {
    let cancelled = false

    getProducts(query)
        .then((data) => {
          if (!cancelled) {
            setState({ status: 'success', data })
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

    setQuery((current) => ({ ...current, page: nextPage }))
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>Search <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
        <label>Theme <input value={filters.theme} onChange={(event) => setFilters({ ...filters, theme: event.target.value })} /></label>
        <label>Minimum price <input value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} /></label>
        <label>Maximum price <input value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} /></label>
        <button type="submit">Apply</button>
      </form>
      {validationMessage && <p role="alert">{validationMessage}</p>}
      {state.status === 'loading' && <p>Loading catalogue...</p>}
      {state.status === 'error' && <p>Unable to load catalogue.</p>}
      {state.status === 'success' && state.data.items.length === 0 && <p>Catalogue is empty.</p>}
      {state.status === 'success' && state.data.items.length > 0 && <ul>
        {state.data.items.map((listing) => {
          const thumbnail = listing.listingImages[0]
          return <li key={listing.id}>
            <Link to={`/catalogue/${listing.id}`}>
              {thumbnail
                ? <img src={thumbnail.url} alt={thumbnail.altText ?? listing.legoProduct.title} />
                : <img src="/images/no-product-image.svg" alt="No product image available" />}
            </Link>
            <h2><Link to={`/catalogue/${listing.id}`}>{listing.legoProduct.title}</Link></h2>
            <p>Set {listing.legoProduct.setNumber}</p><p>Price: {getDisplayedPrice(listing)}</p>
          </li>
        })}
      </ul>}
      {state.status === 'success' && <nav aria-label="Catalogue pagination">
        <button type="button" onClick={() => handlePageChange(-1)} disabled={state.data.pagination.page <= 1}>Previous</button>
        <span>Page {state.data.pagination.page} of {state.data.pagination.totalPages}</span>
        <button type="button" onClick={() => handlePageChange(1)} disabled={state.data.pagination.totalPages === 0 || state.data.pagination.page >= state.data.pagination.totalPages}>Next</button>
      </nav>}
    </>
  )
}
