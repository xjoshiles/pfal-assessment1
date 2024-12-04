import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { FlashcardSetType } from '@/lib/types'
import { StarRating } from '@/components/StarRating'

const SetPreview = ({ set }: { set: FlashcardSetType }) => {
  const { id, name, description, averageRating, creator, updatedAt } = set

  return (
    <li className='set_preview group'>
      <div className='flex-between'>
        <p className='set_preview_date'>
          {formatDate(updatedAt)}
        </p>
        <div className='flex gap-1.5'>
          <Link href={`/users/${creator.id}`}>
            <p className='text-16-medium line-clamp-1'>{creator.username}</p>
          </Link>
        </div>
      </div>

      <div className='flex-between mt-5 gap-5'>
        <Link href={`/sets/${id}`}>
          <h3 className='text-26-semibold line-clamp-1'>{name}</h3>
        </Link>
        <StarRating rating={averageRating}/>
      </div>

      <div className='flex-between gap-5'>
        <Link href={`/sets/${id}`}>
          <p className='set_preview_desc'>
            {description}
          </p>
        </Link>
        <Link href={`/sets/${id}`}>
          <button type="submit" className="set_preview_btn">View</button>
        </Link>
      </div>
    </li>
  )
}

export default SetPreview