import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from './api.ts'
import type { ProductListing } from './types.ts'

type ProductDetailState =
  | { status: 'loading' }
  | { status: 'success'; data: ProductListing }
  | { status: 'not-found' }
  | { status: 'error' }

function getProductId(value: string | undefined) {
  if (value === undefined) return undefined
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function ProductDetailPage() {
  const { id: routeId } = useParams()
  const id = getProductId(routeId)
  const [state, setState] = useState<ProductDetailState>(() => (
    id === undefined ? { status: 'not-found' } : { status: 'loading' }
  ))

  useEffect(() => {
    if (id === undefined) return

    let cancelled = false
    getProductById(id)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({ status: axios.isAxiosError(error) && error.response?.status === 404 ? 'not-found' : 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const pageClassName = 'mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8'
  if (id === undefined) return <div className={pageClassName}><p>Product not found.</p></div>
  if (state.status === 'loading') return <div className={pageClassName}><p>Loading product...</p></div>
  if (state.status === 'not-found') return <div className={pageClassName}><p>Product not found.</p></div>
  if (state.status === 'error') return <div className={pageClassName}><p>Unable to load product.</p></div>

  const { data } = state
  const { legoProduct } = data
  return (
    <div className={`${pageClassName} `}>
      <Link className="inline-block cursor-pointer rounded-sm text-sm font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to="/catalogue">Back to catalogue</Link>
      <article className="grid gap-8 lg:grid-cols-2">
        <section className="grid gap-4 self-start sm:grid-cols-2" aria-label="Product images">
          {data.listingImages.length > 0
            ? data.listingImages.map((image) => <div className="overflow-hidden rounded-lg bg-slate-100" key={image.id}><img className="aspect-square h-auto w-full object-contain" src={image.url} alt={image.altText ?? legoProduct.title} /></div>)
            : <div className="overflow-hidden rounded-lg bg-slate-100"><img className="aspect-square h-auto w-full object-contain" src="/images/no-product-image.svg" alt="No product image available" /></div>}
        </section>
        <section className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight">{legoProduct.title}</h1>
            <p>Set {legoProduct.setNumber}</p>
            <p>Theme: {legoProduct.theme}</p>
          </header>
          <section className="space-y-2" aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-lg font-semibold">Description</h2>
            <p>{legoProduct.description ?? 'No description available.'}</p>
          </section>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="font-medium">Age recommendation</dt><dd>{legoProduct.ageRecommendation}</dd></div>
            <div><dt className="font-medium">Piece count</dt><dd>{legoProduct.pieceCount}</dd></div>
            <div><dt className="font-medium">Condition</dt><dd>{data.condition}</dd></div>
            <div><dt className="font-medium">Current stock</dt><dd>{data.currentStock}</dd></div>
          </dl>
          <section className="space-y-1" aria-label="Price">
            {data.salePrice !== null
              ? <><p className="text-sm text-slate-500 line-through">Original price: {data.originalPrice}</p><p className="text-xl font-semibold">Sale price: {data.salePrice}</p></>
              : <p className="text-xl font-semibold">Price: {data.originalPrice}</p>}
          </section>
        </section>
      </article>
    </div>
  )
}
