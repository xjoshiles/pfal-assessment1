'use client'

import { useState, useEffect } from 'react'
import { ReviewType } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { useUserContext } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'

const ReviewsSection = ({
  id,
  initialReviews,
  resourceType
}: {
  id: string
  initialReviews: ReviewType[],
  resourceType: 'sets' | 'collections' // Determines fetch endpoints
}) => {
  // Sort reviews by latest (createdAt in descending order) on first render
  // Note that it could be worth using [...initialReviews] in the future if
  // the parent component wants to mutate the original object in the future
  initialReviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const [reviews, setReviews] = useState(initialReviews)
  const [showReviews, setShowReviews] = useState(false)
  const [newReview, setNewReview] = useState('')
  const [rating, setRating] = useState(0)
  const [userReview, setUserReview] = useState<ReviewType | null>(null)
  const currentUser = useUserContext()
  const { showToast } = useToast()

  // Check if the current user has a review
  useEffect(() => {
    if (currentUser.id) {
      const userReview = reviews.find((review) => review.userId === currentUser.id)
      setUserReview(userReview || null)
    }
  }, [reviews, currentUser.id])

  const handleToggleReviews = () => {
    setShowReviews((prev) => !prev)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newReview) {
      showToast('Please provide a review!', 'error')
      return
    }

    if (rating === 0) {
      showToast('Please provide a rating!', 'error')
      return
    }

    // Prevent users from submitting more than one review for a set
    if (userReview) {
      showToast('You have already posted a review, please delete it before posting another', 'error')
      return
    }

    const reviewData = { rating: rating, review: newReview }
    const res = await fetch(`/api/${resourceType}/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    })

    if (res.ok) {
      const newReviewResponse = await res.json()
      setReviews((prev) => [newReviewResponse, ...prev])
      setUserReview(newReviewResponse) // Store user's review to prevent further submission
      setNewReview('')
      setRating(0)
      showToast('You successfully posted a review, thanks!', 'success')
    } else {
      const errorData = await res.json()
      showToast(errorData.message || 'An error occurred', 'error')
    }
  }

  const handleDeleteReview = async (reviewId: number, userId: number) => {
    // Only allow deletion if the current user is the review author or admin
    if (userId !== currentUser.id && !currentUser.admin) {
      showToast('You do not have permission to delete this review', 'error')
      return
    }

    const res = await fetch(
      `/api/${resourceType}/${id}/reviews/${reviewId}`, {
      method: 'DELETE'
    })

    if (res.status == 204) {
      setReviews((prev) => prev.filter((review) => review.id !== reviewId))
      setUserReview(null) // Clear the user's review state
      showToast('Review deleted!', 'success')
    } else {
      showToast('Failed to delete review', 'error')
    }
  }

  return (
    <section className="mt-8 bg-white p-6 rounded-lg shadow-md">

      {/* Show/hide reviews toggle */}
      <button
        onClick={handleToggleReviews}
        className="w-full text-left font-semibold text-blue-600 hover:underline"
      >
        {showReviews ? 'Hide Reviews' : 'Show Reviews'}
      </button>

      {showReviews && (
        <div className="mt-4">
          {/* Review submission form */}
          <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review..."
              className="form-textbox"
              required
            />
            <div className="flex items-center space-x-1 ">
              <p className="text-gray-700 mr-2 text-2xl text-lg sm:text-2xl">Your Rating:</p>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl sm:text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
            <button type="submit" className="w-full text-base sm:text-xl item_preview_btn">
              Submit Review
            </button>
          </form>

          {/* Reviews section */}
          <div className="space-y-4 mt-6">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-md bg-gray-50 flex flex-col sm:flex-row justify-between items-start">
                <div className='flex flex-col'>

                  <p className="text-gray-700">
                    <strong>{review.author.username}</strong> - {formatDate(review.createdAt)}
                  </p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-lg">
                        {i < review.rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p>{review.review}</p>

                </div>
                {/* Show a delete button on review for author or admin */}
                {review.userId === currentUser.id || currentUser.admin ? (
                  <button
                    onClick={() => handleDeleteReview(review.id, review.userId)}
                    className="item_delete_btn mt-2 sm:mt-0 text-sm"
                  >
                    Delete Review
                  </button>
                ) : null}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first!</p>}
          </div>
        </div>
      )}
    </section>
  )
}

export default ReviewsSection