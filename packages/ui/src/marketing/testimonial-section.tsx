"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Card } from "../molecules/card.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { Avatar } from "../atoms/avatar.js";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "../atoms/button.js";

/**
 * TestimonialSection - Social proof through customer testimonials
 * 2026 Best Practices:
 * - Real customer quotes with attribution
 * - Company logos for credibility
 * - Optional carousel for multiple testimonials
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface Testimonial {
  id: string;
  quote: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar?: string;
  };
  companyLogo?: string;
  rating?: number;
  featured?: boolean;
}

export interface TestimonialSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Testimonials to display */
  testimonials: Testimonial[];
  /** Display variant */
  variant?: "grid" | "carousel" | "featured";
  /** Number of columns for grid variant */
  columns?: 2 | 3;
  /** Background color */
  background?: "black" | "ink" | "grey";
  /** Show company logos */
  showLogos?: boolean;
  /** Show ratings */
  showRatings?: boolean;
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={clsx(
            "size-5",
            star <= rating ? "text-accent fill-accent" : "text-on-light-muted"
          )}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  showRatings,
}: {
  testimonial: Testimonial;
  showRatings?: boolean;
}) {
  return (
    <Card className="p-4 sm:p-6 md:p-8 border-2 border-border rounded-card h-full">
      <Stack gap={6} className="h-full">
        {/* Quote Icon */}
        <Quote className="size-10 text-primary/50" />

        {/* Rating */}
        {showRatings && testimonial.rating && (
          <StarRating rating={testimonial.rating} />
        )}

        {/* Quote */}
        <Body className="text-on-dark-secondary italic flex-1 text-lg leading-relaxed">
          &ldquo;{testimonial.quote}&rdquo;
        </Body>

        {/* Author */}
        <Stack direction="horizontal" gap={4} className="items-center">
          <Avatar
            src={testimonial.author.avatar}
            initials={testimonial.author.name.split(" ").map(n => n[0]).join("")}
            alt={testimonial.author.name}
            size="md"
          />
          <Stack gap={0}>
            <Body className="text-white font-semibold">
              {testimonial.author.name}
            </Body>
            <Body size="sm" className="text-on-dark-muted">
              {testimonial.author.role}, {testimonial.author.company}
            </Body>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export const TestimonialSection = forwardRef<HTMLElement, TestimonialSectionProps>(
  function TestimonialSection(
    {
      kicker,
      title,
      description,
      testimonials,
      variant = "grid",
      columns = 3,
      background = "ink",
      showRatings = false,
      className,
    },
    ref
  ) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const bgClasses = {
      black: "bg-black text-white",
      ink: "bg-surface-inverse text-on-dark-primary",
      grey: "bg-surface-elevated text-on-dark-primary",
    };

    const colClasses = {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const featuredTestimonial = testimonials.find((t) => t.featured) || testimonials[0];

    return (
      <section
        ref={ref}
        className={clsx("py-12 sm:py-16 md:py-24 lg:py-32", bgClasses[background], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-white">{title}</H2>}
              {description && (
                <Body size="lg" className="text-on-dark-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Grid Variant */}
          {variant === "grid" && (
            <Grid cols={columns} gap={6} className={colClasses[columns]}>
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  showRatings={showRatings}
                />
              ))}
            </Grid>
          )}

          {/* Carousel Variant */}
          {variant === "carousel" && (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <div className="max-w-3xl mx-auto">
                        <TestimonialCard
                          testimonial={testimonial}
                          showRatings={showRatings}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  icon={<ChevronLeft className="size-5" />}
                  aria-label="Previous testimonial"
                />
                <div className="flex gap-2 items-center">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={clsx(
                        "size-2 rounded-full transition-colors",
                        idx === currentIndex ? "bg-primary" : "bg-muted"
                      )}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  icon={<ChevronRight className="size-5" />}
                  aria-label="Next testimonial"
                />
              </div>
            </div>
          )}

          {/* Featured Variant */}
          {variant === "featured" && featuredTestimonial && (
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 sm:p-8 md:p-10 lg:p-12 border-2 border-primary/30 rounded-card bg-gradient-to-br from-primary/10 to-transparent">
                <Stack gap={8} className="text-center items-center">
                  <Quote className="size-16 text-primary/50" />
                  
                  {showRatings && featuredTestimonial.rating && (
                    <StarRating rating={featuredTestimonial.rating} />
                  )}

                  <Body className="text-on-dark-secondary italic text-xl md:text-2xl leading-relaxed max-w-3xl">
                    &ldquo;{featuredTestimonial.quote}&rdquo;
                  </Body>

                  <Stack gap={4} className="items-center">
                    <Avatar
                      src={featuredTestimonial.author.avatar}
                      initials={featuredTestimonial.author.name.split(" ").map(n => n[0]).join("")}
                      alt={featuredTestimonial.author.name}
                      size="lg"
                    />
                    <Stack gap={0} className="text-center">
                      <Body className="text-white font-semibold text-lg">
                        {featuredTestimonial.author.name}
                      </Body>
                      <Body className="text-on-dark-muted">
                        {featuredTestimonial.author.role}, {featuredTestimonial.author.company}
                      </Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </div>
          )}
        </Container>
      </section>
    );
  }
);

export default TestimonialSection;
