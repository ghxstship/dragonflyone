"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Spinner } from "@ghxstship/ui";
import { Star, Plus, Users } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventReviewsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading reviews..." />
      </Stack>
    );
  }

  const reviews = [
    { id: "1", user: "Alex J.", rating: 5, comment: "Amazing experience! The sound quality was incredible.", date: "2 days ago" },
    { id: "2", user: "Sam W.", rating: 4, comment: "Great event, but the lines were a bit long.", date: "3 days ago" },
    { id: "3", user: "Jordan L.", rating: 5, comment: "Best concert I have been to this year!", date: "1 week ago" },
  ];

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={event?.name || "Event"}
          title="Reviews"
          description="What attendees are saying"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Write Review
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack direction="horizontal" gap={8} className="items-center">
            <Stack gap={1} className="items-center">
              <Body className="text-h1-desktop font-weight-bold text-white">{averageRating.toFixed(1)}</Body>
              <Stack direction="horizontal" gap={1}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className={star <= averageRating ? "fill-warning text-warning" : "text-on-dark-muted"} />
                ))}
              </Stack>
              <Body size="sm" className=" text-on-dark-muted">{reviews.length} reviews</Body>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Stack gap={4}>
        {reviews.map((review) => (
          <Card key={review.id} variant="elevated" inverted>
            <CardBody>
              <Stack gap={3}>
                <Stack direction="horizontal" gap={3} className="items-center justify-between">
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Box className="flex size-10 items-center justify-center rounded-avatar bg-ink-800">
                      <Users size={16} className="text-on-dark-muted" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">{review.user}</Body>
                      <Body size="sm" className=" text-on-dark-muted">{review.date}</Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={1}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= review.rating ? "fill-warning text-warning" : "text-on-dark-muted"} />
                    ))}
                  </Stack>
                </Stack>
                <Body className="text-on-dark-muted">{review.comment}</Body>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
