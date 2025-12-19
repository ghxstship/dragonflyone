'use client';

import { useState } from 'react';
import { ArrowLeft, Star, Plus, MessageSquare, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { useVendorReviews, useCreateVendorReview } from '@/hooks/useVendorPerformance';
import { useVendorProfile } from '@/hooks/useVendorProfiles';

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function VendorReviewsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [showForm, setShowForm] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const { data: vendorData } = useVendorProfile(id);
  const { data: reviewsData, isLoading, error } = useVendorReviews(id);
  const createMutation = useCreateVendorReview();

  const [formData, setFormData] = useState({
    overall_rating: 5,
    category_ratings: {
      quality: 5,
      timeliness: 5,
      communication: 5,
      value: 5,
    } as Record<string, number>,
    review_text: '',
    would_recommend: true,
  });

  const vendor = vendorData?.vendor;
  const reviews = reviewsData?.reviews || [];

  const filteredReviews = ratingFilter
    ? reviews.filter((r) => r.overall_rating === ratingFilter)
    : reviews;

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      vendorId: id,
      input: {
        organization_id: 'current',
        overall_rating: formData.overall_rating,
        category_ratings: formData.category_ratings,
        review_text: formData.review_text || undefined,
        would_recommend: formData.would_recommend,
      },
    });
    setShowForm(false);
    setFormData({
      overall_rating: 5,
      category_ratings: { quality: 5, timeliness: 5, communication: 5, value: 5 },
      review_text: '',
      would_recommend: true,
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load reviews. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href={`/vendors/${id}`}
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">
              Reviews for {vendor?.name || 'Vendor'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {renderStars(Math.round(averageRating), 'md')}
              <span className="text-body-sm text-muted-foreground">
                {averageRating.toFixed(1)} average ({reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Write Review
        </button>
      </div>

      {showForm && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Write a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                  <label className="block text-body-xs font-weight-medium text-muted-foreground mb-1">Overall</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setFormData({ ...formData, overall_rating: star })} className="p-0.5">
                        <Star className={`h-5 w-5 ${star <= formData.overall_rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                {['quality', 'timeliness', 'communication', 'value'].map((key) => (
                  <div key={key}>
                    <label className="block text-body-xs font-weight-medium text-muted-foreground mb-1 capitalize">{key}</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setFormData({ ...formData, category_ratings: { ...formData.category_ratings, [key]: star } })} className="p-0.5">
                          <Star className={`h-5 w-5 ${star <= (formData.category_ratings[key] || 0) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Your Review
              </label>
              <textarea
                rows={4}
                placeholder="Share your experience working with this vendor..."
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-body-sm font-weight-medium text-foreground">Would you recommend this vendor?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, would_recommend: true })}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-button border-2 text-body-sm ${
                    formData.would_recommend
                      ? 'border-success bg-success/10 text-success'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, would_recommend: false })}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-button border-2 text-body-sm ${
                    !formData.would_recommend
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  No
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-body-sm text-muted-foreground">Filter by rating:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRatingFilter(null)}
            className={`px-3 py-1 rounded-button text-body-sm ${
              ratingFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'border-2 border-border hover:bg-muted'
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setRatingFilter(rating)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-button text-body-sm ${
                ratingFilter === rating
                  ? 'bg-primary text-primary-foreground'
                  : 'border-2 border-border hover:bg-muted'
              }`}
            >
              {rating} <Star className="h-3 w-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No reviews yet
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Be the first to review this vendor.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Write Review
          </button>
        </div>
      )}

      {filteredReviews.length > 0 && (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.overall_rating)}
                    <span className="text-body-sm font-weight-medium">
                      {RATING_LABELS[review.overall_rating - 1]}
                    </span>
                  </div>
                  <p className="text-body-xs text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {review.would_recommend !== undefined && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-badge text-body-xs ${
                    review.would_recommend
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {review.would_recommend ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                    {review.would_recommend ? 'Recommends' : 'Does not recommend'}
                  </span>
                )}
              </div>
              {review.review_text && (
                <p className="text-body-sm text-foreground mb-4">{review.review_text}</p>
              )}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                {review.category_ratings && Object.entries(review.category_ratings).map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-body-xs text-muted-foreground capitalize">{label}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-body-sm font-weight-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
