import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

  if (id === undefined) return <p>Product not found.</p>
  if (state.status === 'loading') return <p>Loading product...</p>
  if (state.status === 'not-found') return <p>Product not found.</p>
  if (state.status === 'error') return <p>Unable to load product.</p>

  const { data } = state
  const { legoProduct } = data
  return (
    <article>
      <h1>{legoProduct.title}</h1>
      <p>Set {legoProduct.setNumber}</p>
      <p>Theme: {legoProduct.theme}</p>
      <p>Description: {legoProduct.description ?? 'No description available.'}</p>
      <p>Age recommendation: {legoProduct.ageRecommendation}</p>
      <p>Piece count: {legoProduct.pieceCount}</p>
      <p>Condition: {data.condition}</p>
      <p>Current stock: {data.currentStock}</p>
      {data.salePrice !== null
        ? <p>Original price: {data.originalPrice}; Sale price: {data.salePrice}</p>
        : <p>Price: {data.originalPrice}</p>}
      {data.listingImages.length > 0
        ? data.listingImages.map((image) => <img key={image.id} src={image.url} alt={image.altText ?? legoProduct.title} />)
        : <img src="/images/no-product-image.svg" alt="No product image available" />}
    </article>
  )
}
