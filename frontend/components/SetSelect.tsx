import { formatDate } from '@/lib/utils'
import React from 'react'
import { FlashcardSetType } from '@/lib/types'
import { StarRating } from '@/components/StarRating'

const SetSelect = ({
  set,
  isSelected = false,
  onRemove
}: {
  set: FlashcardSetType,
  isSelected?: boolean,
  onRemove?: () => void // Optional remove callback
}) => {
  const { name, description, averageRating, creator, updatedAt } = set

  return (
    <div
      className={`${isSelected ? 'item_preview_selected' : 'item_preview_select'}`}
    >
      <div className='flex-between gap-2'>
        <p className={`${isSelected ? 'item_preview_date_selected' : 'item_preview_date'}`}>
          {formatDate(updatedAt)}
        </p>
        <div className='flex gap-1.5'>
          <p className='text-16-medium line-clamp-1'>{creator.username}</p>
        </div>
      </div>

      <div className='flex-between mt-5 gap-5 text-overflow-clip'>
        <h3 className='text-26-semibold line-clamp-1'>{name}</h3>
        <StarRating rating={averageRating} />
      </div>

      <div className='flex-between gap-5'>
        <p className='item_preview_desc'>
          {description}
        </p>
        {onRemove && (
          <button
            onClick={onRemove}
            className="form-button-disable-round"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export default SetSelect