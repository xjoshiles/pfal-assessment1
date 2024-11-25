const Star = ({ fillPercentage }: { fillPercentage: number }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="inline-block">
    <defs>
      <linearGradient id={`star-gradient-${fillPercentage}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset={`${fillPercentage}%`} stopColor="gold" />
        <stop offset={`${fillPercentage}%`} stopColor="lightgray" />
      </linearGradient>
    </defs>
    <path
      fill={`url(#star-gradient-${fillPercentage})`}
      d="M12 2l2.39 7.26h7.61l-6.13 4.48 2.39 7.26-6.13-4.48-6.13 4.48 2.39-7.26-6.13-4.48h7.61L12 2z"
    />
  </svg>
)

export const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const fractionalStar = rating % 1
  const emptyStars = 5 - Math.ceil(rating)

  return (
    <div className="flex items-center">
      {Array.from({ length: fullStars }, (_, i) => (
        <Star key={`full-${i}`} fillPercentage={100} />
      ))}
      {fractionalStar > 0 && <Star fillPercentage={fractionalStar * 100} />}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star key={`empty-${i}`} fillPercentage={0} />
      ))}
      <span className="text-gray-700 font-medium ml-2">
        {rating}
      </span>
    </div>
  )
}
