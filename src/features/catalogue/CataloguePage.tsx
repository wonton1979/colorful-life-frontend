import { useEffect, useState } from 'react'
import { getProducts } from './api.ts'
import type { ProductListing, ProductsResponse } from './types.ts'

type CatalogueState =
  | { status: 'loading' }
  | { status: 'success'; data: ProductsResponse }
  | { status: 'error' }

function getDisplayedPrice(listing: ProductListing) {
  return listing.salePrice ?? listing.originalPrice
}

export function CataloguePage() {
  const [state, setState] = useState<CatalogueState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    void getProducts()
      .then((data) => {
        if (isMounted) {
          setState({ status: 'success', data })
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ status: 'error' })
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (state.status === 'loading') {
    return <p>Loading catalogue...</p>
  }

  if (state.status === 'error') {
    return <p>Unable to load catalogue.</p>
  }

  if (state.data.items.length === 0) {
    return <p>Catalogue is empty.</p>
  }

  return (
    <ul>
      {state.data.items.map((listing) => (
        <li key={listing.id}>
          <h2>{listing.legoProduct.title}</h2>
          <p>Set {listing.legoProduct.setNumber}</p>
          <p>Price: {getDisplayedPrice(listing)}</p>
        </li>
      ))}
    </ul>
  )
}
