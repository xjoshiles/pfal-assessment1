import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { CollectionType } from '@/lib/types'
import { StarRating } from '@/components/StarRating'
import { useUserContext } from '@/context/UserContext'

const CollectionPreview = ({
  collection,
  onDeleteCollection
}: {
  collection: CollectionType,
  onDeleteCollection: (id: number) => void  // on prefix convention for props
}) => {
  const { id, name, description, userId, averageRating, creator, updatedAt } = collection
  const user = useUserContext()

  // Modal and deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null) // Reference to the modal content

  // Close modal if user clicks outside of it
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowDeleteModal(false)
    }
  }

  return (
    <li className="item_preview group overflow-x-auto scrollbar-hidden">
      <div className="flex-between gap-2">
        <p className="item_preview_date">
          {formatDate(updatedAt)}
        </p>
        {creator && (
          <div className="flex gap-1.5">
            <Link href={`/users/${creator.id}`} passHref tabIndex={-1}>
              <p className="text-16-medium line-clamp-1">{creator.username}</p>
            </Link>
          </div>
        )}
      </div>

      <div className="flex-between mt-5 gap-5">
        <Link href={`/collections/${id}`} passHref tabIndex={-1}>
          <h3 className="text-26-semibold line-clamp-1">{name}</h3>
        </Link>
        <StarRating rating={averageRating} />
      </div>

      <div className="flex-between gap-5">
        <Link href={`/collections/${id}`} passHref tabIndex={-1}>
          <p className="item_preview_desc">{description}</p>
        </Link>

        {/* Action Buttons */}
        <div className="flex-between gap-2">
          <Link href={`/collections/${id}`} passHref tabIndex={-1}>
            <button type="submit" className="item_preview_btn text-sm">View</button>
          </Link>

          {/* Conditionally render the Edit and Delete buttons
          if the current user is the creator or an admin */}
          {(user.id === userId || user.admin) && (
            <>
              <Link href={`/collections/${id}/edit`} passHref tabIndex={-1}>
                <button type="submit" className="item_edit_btn text-sm">Edit</button>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(true)
                  document.addEventListener('mousedown', handleOutsideClick)
                }}
                className="item_delete_btn text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal for collection deletion */}
      {showDeleteModal && (
        <div role="dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
          >
            <h2 className="text-lg font-bold text-red-600">Delete Collection</h2>
            <p className="text-sm text-gray-600">
              Are you sure? This action can't be reversed, and any reviews for this collection will be deleted. Any flashcard sets within it will remain.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  document.removeEventListener('mousedown', handleOutsideClick)
                }}
                className="w-full form-button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCollection(id)
                  setShowDeleteModal(false)
                  document.removeEventListener('mousedown', handleOutsideClick)
                }}
                className="w-full form-button-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

export default CollectionPreview