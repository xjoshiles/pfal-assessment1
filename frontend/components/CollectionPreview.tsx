import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { CollectionType } from '@/lib/types'
import { StarRating } from '@/components/StarRating'

const CollectionPreview = ({ collection }: { collection: CollectionType }) => {
  const { id, name, description, averageRating, userId, creator, updatedAt } = collection

  return (
    <li className='item_preview group'>
      <div className='flex-between gap-2'>
        <p className='item_preview_date'>
          {formatDate(updatedAt)}
        </p>
        <div className='flex gap-1.5'>
          <Link href={`/users/${userId}`}>
            <p className='text-16-medium line-clamp-1'>{creator.username}</p>
          </Link>
        </div>
      </div>

      <div className='flex-between mt-5 gap-5'>
        <Link href={`/collections/${id}`}>
          <h3 className='text-26-semibold line-clamp-1'>{name}</h3>
        </Link>
        <StarRating rating={averageRating}/>
      </div>

      <div className='flex-between gap-5'>
        <Link href={`/collections/${id}`}>
          <p className='item_preview_desc'>
            {description}
          </p>
        </Link>
        <Link href={`/collections/${id}`}>
          <button type="submit" className="item_preview_btn">View</button>
        </Link>
      </div>
    </li>
  )
}

export default CollectionPreview 