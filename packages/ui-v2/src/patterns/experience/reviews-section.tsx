/**
 * Reviews Section Component
 * Display ratings, reviews, and organizer responses
 */

'use client';

import React, { useState } from 'react';
import type { Review, Rating } from './types';
import './reviews-section.css';

interface ReviewsSectionProps {
  rating: Rating;
  reviews: Review[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ReviewsSection({
  rating,
  reviews,
  onLoadMore,
  hasMore = false,
}: ReviewsSectionProps) {
  if (rating.count === 0) {
    return null;
  }

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-section__header">
        <h2 className="reviews-section__title">
          Reviews ({rating.count})
          <span className="reviews-section__badge">{rating.average.toFixed(1)} ★</span>
        </h2>
      </div>

      {/* Rating Summary */}
      <RatingSummary rating={rating} />

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="reviews-section__load-more">
          <button className="reviews-section__load-more-btn" onClick={onLoadMore}>
            Load More Reviews
          </button>
        </div>
      )}
    </section>
  );
}

interface RatingSummaryProps {
  rating: Rating;
}

function RatingSummary({ rating }: RatingSummaryProps) {
  const breakdown = rating.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = rating.count;

  return (
    <div className="rating-summary">
      {/* Overall Rating */}
      <div className="rating-summary__overall">
        <div className="rating-summary__score">{rating.average.toFixed(1)}</div>
        <div className="rating-summary__stars">
          <StarRating rating={rating.average} size="lg" />
        </div>
        <div className="rating-summary__count">{total} reviews</div>
      </div>

      {/* Rating Breakdown */}
      <div className="rating-summary__breakdown">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = breakdown[stars as keyof typeof breakdown] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={stars} className="rating-bar">
              <div className="rating-bar__label">{stars} ★</div>
              <div className="rating-bar__track">
                <div
                  className="rating-bar__fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="rating-bar__count">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Rating Categories (if available) */}
      {rating.categories && rating.categories.length > 0 && (
        <div className="rating-summary__categories">
          {rating.categories.map((category) => (
            <div key={category.name} className="rating-category">
              <div className="rating-category__name">{category.name}</div>
              <div className="rating-category__score">
                {category.score.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const contentLength = review.content.length;
  const shouldTruncate = contentLength > 300;
  const displayContent =
    shouldTruncate && !showFullContent
      ? review.content.substring(0, 300) + '...'
      : review.content;

  return (
    <div className="review-card">
      {/* Header */}
      <div className="review-card__header">
        <div className="review-card__author">
          {review.author.avatar ? (
            <img
              src={review.author.avatar}
              alt={review.author.name}
              className="review-card__avatar"
            />
          ) : (
            <div className="review-card__avatar review-card__avatar--placeholder">
              {review.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="review-card__author-info">
            <div className="review-card__author-name">{review.author.name}</div>
            <div className="review-card__date">
              {new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </div>
          </div>
        </div>
        <div className="review-card__rating-wrapper">
          <StarRating rating={review.rating} size="sm" />
          {review.verified && (
            <span className="review-card__verified">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline
                  points="22 4 12 14.01 9 11.01"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="review-card__content">
        <p className="review-card__text">{displayContent}</p>
        {shouldTruncate && (
          <button
            className="review-card__read-more"
            onClick={() => setShowFullContent(!showFullContent)}
          >
            {showFullContent ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="review-card__images">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="review-card__image"
            />
          ))}
        </div>
      )}

      {/* Host Response */}
      {review.response && (
        <div className="review-card__response">
          <div className="review-card__response-header">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Response from host</span>
          </div>
          <p className="review-card__response-text">{review.response}</p>
        </div>
      )}

      {/* Footer */}
      <div className="review-card__footer">
        <button className="review-card__helpful">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
}

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className={`star-rating star-rating--${size}`}>
      {stars.map((star) => (
        <svg
          key={star}
          className={`star-rating__star ${
            star <= rating ? 'star-rating__star--filled' : ''
          }`}
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

ReviewsSection.displayName = 'ReviewsSection';
