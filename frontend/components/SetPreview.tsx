import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { FlashcardSetType } from '@/lib/types'
import { StarRating } from '@/components/StarRating'
import { useUserContext } from '@/context/UserContext'


const SetPreview = ({ set }: { set: FlashcardSetType }) => {
  const { id, name, description, averageRating, creator, updatedAt } = set
  const user = useUserContext()

  // return (
  //   <li className="item_preview group overflow-x-auto">
  //     <div className="flex justify-between items-center mb-4">
  //       <p className="item_preview_date">{formatDate(updatedAt)}</p>
  //       <Link href={`/users/${creator.id}`}>
  //         <p className="text-16-medium line-clamp-1">mmmmmmmmmmmm</p>
  //       </Link>
  //     </div>

  //     <Link href={`/sets/${id}`} className="block mb-4">
  //       <h3 className="text-26-semibold line-clamp-1">{name}</h3>
  //     </Link>

  //     <div className="flex flex-wrap items-center justify-between gap-4">
  //       <Link href={`/sets/${id}`} className="flex-1">
  //         <p className="item_preview_desc">{description}</p>
  //       </Link>

  //       <StarRating rating={averageRating} />
  //     </div>

  //     <div className="mt-4 flex flex-wrap gap-2">
  //       <Link href={`/sets/${id}`}>
  //         <button className="item_preview_btn">View</button>
  //       </Link>

  //       {user.id === creator.id && (
  //         <>
  //           <Link href={`/sets/${id}/edit`}>
  //             <button className="item_edit_btn">Edit</button>
  //           </Link>
  //           <button onClick={() => handleDelete(id)} className="item_delete_btn">
  //             Delete
  //           </button>
  //         </>
  //       )}
  //     </div>
  //   </li>

  // )

  return (
    <li className='item_preview group overflow-x-auto scrollbar-hidden'>
      <div className='flex-between gap-2'>
        <p className='item_preview_date'>
          {formatDate(updatedAt)}
        </p>
        <div className='flex gap-1.5'>
          <Link href={`/users/${creator.id}`}>
            <p className='text-16-medium line-clamp-1'>{creator.username}</p>
          </Link>
        </div>
      </div>

      <div className='flex-between mt-5 gap-5 text-overflow-clip'>
        <Link href={`/sets/${id}`}>
          <h3 className='text-26-semibold line-clamp-1'>{name}</h3>
        </Link>
        <StarRating rating={averageRating} />
      </div>

      <div className='flex-between gap-5'>
        <Link href={`/sets/${id}`}>
          <p className='item_preview_desc'>
            {description}
          </p>
        </Link>

        {/* Action Buttons */}
        <div className='flex-between gap-2'>
          <Link href={`/sets/${id}`}>
            <button type="submit" className="item_preview_btn">View</button>
          </Link>

          {/* Conditionally render the Edit and Delete
          buttons if the current user is the creator */}
          {user.id === creator.id && (
            <>
              <Link href={`/sets/${id}/edit`}>
                <button type="submit" className="item_edit_btn">Edit</button>
              </Link>
              <Link href={`/sets/${id}/edit`}>
                <button type="submit" className="item_delete_btn">Delete</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

export default SetPreview