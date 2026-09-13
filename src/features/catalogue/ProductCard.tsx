import { Link } from 'react-router-dom'
import type { ProductListing } from './types.ts'

type ProductCardProps = {
  listing: ProductListing
}

export function ProductCard({ listing }: ProductCardProps) {
  const thumbnail = listing.listingImages[0]
  const detailPath = `/catalogue/${listing.id}`

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <Link className="block cursor-pointer overflow-hidden rounded-md bg-slate-100" to={detailPath}>
        {thumbnail
          ? <img className="aspect-square h-auto w-full object-contain" src={thumbnail.url} alt={thumbnail.altText ?? listing.legoProduct.title} />
          : <img className="aspect-square h-auto w-full object-contain" src="/images/no-product-image.svg" alt="No product image available" />}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="text-lg font-semibold leading-tight"><Link className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to={detailPath}>{listing.legoProduct.title}</Link></h2>
        <p className="text-sm text-slate-600">Set {listing.legoProduct.setNumber}</p>
        <p className="text-sm text-slate-600">Theme: {listing.legoProduct.theme}</p>
        <p className="text-sm text-slate-600">Condition: {listing.condition}</p>
      </div>
      {listing.salePrice !== null
        ? <p className="text-sm"><span className="mr-2 text-slate-500 line-through">Original price: {listing.originalPrice}</span><span className="font-semibold">Sale price: {listing.salePrice}</span></p>
        : <p className="text-sm font-semibold">Price: {listing.originalPrice}</p>}
    </li>
  )
}
