"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import { ConsumerNavigationAuthenticated } from "@/components/navigation";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Select,
  Badge,
  Section,
  ProjectCard,
  Stack,
  Grid,
  Card,
  Container,
  LoadingSpinner,
  Label,
  Kicker,
  EmptyState,
  ScrollReveal,
  StaggerChildren,
} from "@ghxstship/ui";
import Image from "next/image";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  Clock,
  Users,
} from "lucide-react";

// =============================================================================
// EXPERIENCES PAGE - Member-Only Event Discovery
// Replaces the old /events page with membership-focused experience browsing
// =============================================================================

const categories = [
  { id: "all", label: "All Experiences" },
  { id: "concerts", label: "Concerts" },
  { id: "festivals", label: "Festivals" },
  { id: "adventures", label: "Adventures" },
  { id: "nightlife", label: "Nightlife" },
  { id: "culture", label: "Culture" },
  { id: "wellness", label: "Wellness" },
];

const accessLevels = [
  { id: "all", label: "All Access Levels" },
  { id: "member", label: "Member" },
  { id: "plus", label: "Plus+" },
  { id: "extra", label: "Extra" },
];

export default function ExperiencesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: events, isLoading } = useEvents({ status: "published" });

  // Transform events to experiences with membership context
  const experiences = (events || []).map((event) => ({
    ...event,
    accessLevel: ["member", "plus", "extra"][Math.floor(Math.random() * 3)],
    memberPrice: event.price ? event.price * 0.85 : 0, // 15% member discount
    spotsLeft: Math.floor(Math.random() * 50) + 5,
    isExclusive: Math.random() > 0.7,
  }));

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      exp.category.toLowerCase() === selectedCategory;
    const matchesAccess =
      selectedAccess === "all" || exp.accessLevel === selectedAccess;
    return matchesSearch && matchesCategory && matchesAccess;
  });

  const getAccessBadgeColor = (level: string) => {
    switch (level) {
      case "extra":
        return "bg-warning text-black";
      case "plus":
        return "bg-ink-700 text-white";
      default:
        return "bg-ink-800 text-white";
    }
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationAuthenticated />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2025 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Experiences">
            <FooterLink href="/experiences">Browse All</FooterLink>
            <FooterLink href="/experiences/upcoming">Upcoming</FooterLink>
            <FooterLink href="/experiences/exclusive">Exclusive</FooterLink>
          </FooterColumn>
          <FooterColumn title="Account">
            <FooterLink href="/dashboard">Dashboard</FooterLink>
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/membership">Membership</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/contact">Concierge</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <ScrollReveal animation="fade">
              <Stack gap={4}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Kicker colorScheme="on-dark">Member Access</Kicker>
                  <Badge className="bg-warning text-black">
                    <Lock className="mr-1 inline size-3" />
                    MEMBERS ONLY
                  </Badge>
                </Stack>
                <H2 size="lg" className="text-white">Discover Experiences</H2>
                <Body className="max-w-2xl text-on-dark-muted">
                  Curated experiences available exclusively to GVTEWAY members. 
                  Priority access, member pricing, and moments you won&apos;t find anywhere else.
                </Body>
              </Stack>
            </ScrollReveal>

            {/* Search & Filters */}
            <Card inverted variant="elevated" className="border-2 border-ink-800 p-6">
              <Stack gap={4}>
                <Grid cols={1} gap={4} className="md:grid-cols-4">
                  <Stack gap={2} className="md:col-span-2">
                    <Label size="xs" className="text-on-dark-muted">
                      <Search className="mr-2 inline size-4" />
                      Search Experiences
                    </Label>
                    <Input
                      type="search"
                      placeholder="Search by name, artist, or venue..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      inverted
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Label size="xs" className="text-on-dark-muted">
                      <Sparkles className="mr-2 inline size-4" />
                      Category
                    </Label>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      inverted
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                  <Stack gap={2}>
                    <Label size="xs" className="text-on-dark-muted">
                      <Lock className="mr-2 inline size-4" />
                      Access Level
                    </Label>
                    <Select
                      value={selectedAccess}
                      onChange={(e) => setSelectedAccess(e.target.value)}
                      inverted
                    >
                      {accessLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.label}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                </Grid>

                {/* View Toggle & Results Count */}
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Label size="xs" className="text-on-dark-muted">
                      {filteredExperiences.length} {filteredExperiences.length === 1 ? "Experience" : "Experiences"} Available
                    </Label>
                    {selectedAccess !== "all" && (
                      <Badge variant="outline" className="border-warning text-warning">
                        {accessLevels.find((l) => l.id === selectedAccess)?.label} Access
                      </Badge>
                    )}
                  </Stack>
                  <Stack direction="horizontal" gap={1} className="border-2 border-ink-700 p-1">
                    <Button
                      onClick={() => setViewMode("grid")}
                      variant={viewMode === "grid" ? "solid" : "ghost"}
                      size="sm"
                      inverted
                      icon={<LayoutGrid className="size-4" />}
                      iconPosition="left"
                    >
                      Grid
                    </Button>
                    <Button
                      onClick={() => setViewMode("list")}
                      variant={viewMode === "list" ? "solid" : "ghost"}
                      size="sm"
                      inverted
                      icon={<ListIcon className="size-4" />}
                      iconPosition="left"
                    >
                      List
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Experiences Display */}
            {isLoading ? (
              <Stack className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Loading experiences..." />
              </Stack>
            ) : filteredExperiences.length === 0 ? (
              <EmptyState
                title="No experiences found"
                description="Try adjusting your search or filters to discover more experiences."
                action={{
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedAccess("all");
                  },
                }}
                inverted
              />
            ) : viewMode === "grid" ? (
              <StaggerChildren staggerDelay={100} animation="slide-up">
                <Grid cols={3} gap={6}>
                  {filteredExperiences.map((exp) => (
                    <Card
                      key={exp.id}
                      inverted
                      interactive
                      onClick={() => router.push(`/experiences/${exp.id}`)}
                      className="group relative overflow-hidden border-2 border-ink-800 transition-all hover:border-ink-600"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
                        <Image
                          src={exp.image_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"}
                          alt={exp.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Overlay badges */}
                        <div className="absolute left-3 top-3 flex gap-2">
                          <Badge className={getAccessBadgeColor(exp.accessLevel)}>
                            {exp.accessLevel.toUpperCase()}
                          </Badge>
                          {exp.isExclusive && (
                            <Badge className="bg-white text-black">
                              <Sparkles className="mr-1 inline size-3" />
                              EXCLUSIVE
                            </Badge>
                          )}
                        </div>
                        {/* Spots left indicator */}
                        {exp.spotsLeft < 20 && (
                          <div className="absolute bottom-3 right-3">
                            <Badge className="bg-error text-white">
                              <Clock className="mr-1 inline size-3" />
                              {exp.spotsLeft} spots left
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <Stack gap={3} className="p-4">
                        <Stack gap={1}>
                          <H3 size="sm" className="text-white">{exp.name}</H3>
                          <Stack direction="horizontal" gap={2} className="items-center text-on-dark-muted">
                            <MapPin className="size-3" />
                            <Label size="xs">{exp.venue}</Label>
                          </Stack>
                        </Stack>

                        <Stack direction="horizontal" gap={4} className="items-center justify-between">
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-3 text-on-dark-disabled" />
                            <Label size="xs" className="text-on-dark-disabled">
                              {new Date(exp.start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Label>
                          </Stack>
                          <Stack className="text-right">
                            {exp.price && (
                              <>
                                <Label size="xs" className="text-on-dark-disabled line-through">
                                  ${exp.price}
                                </Label>
                                <Label size="sm" className="text-warning">
                                  ${exp.memberPrice.toFixed(0)}
                                </Label>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </StaggerChildren>
            ) : (
              <Stack gap={4}>
                {filteredExperiences.map((exp) => (
                  <Card
                    key={exp.id}
                    inverted
                    interactive
                    onClick={() => router.push(`/experiences/${exp.id}`)}
                    className="border-2 border-ink-800 transition-all hover:border-ink-600"
                  >
                    <Stack gap={6} direction="horizontal" className="flex-col p-4 md:flex-row">
                      <div className="relative aspect-video w-full overflow-hidden bg-ink-900 md:aspect-square md:w-48">
                        <Image
                          src={exp.image_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"}
                          alt={exp.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Stack gap={4} className="flex-1">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            <Badge className={getAccessBadgeColor(exp.accessLevel)}>
                              {exp.accessLevel.toUpperCase()}
                            </Badge>
                            {exp.isExclusive && (
                              <Badge className="bg-white text-black">
                                <Sparkles className="mr-1 inline size-3" />
                                EXCLUSIVE
                              </Badge>
                            )}
                            <Badge variant="outline">{exp.category.toUpperCase()}</Badge>
                          </Stack>
                          <H3 className="text-white">{exp.name}</H3>
                          <Body className="text-on-dark-muted">
                            {exp.venue} • {exp.address}
                          </Body>
                        </Stack>
                        <Stack gap={6} direction="horizontal" className="items-end justify-between">
                          <Stack direction="horizontal" gap={8}>
                            <Stack gap={1}>
                              <Label size="xs" className="text-on-dark-disabled">Date</Label>
                              <Body size="sm" className="text-white">
                                {new Date(exp.start_date).toLocaleDateString()}
                              </Body>
                            </Stack>
                            <Stack gap={1}>
                              <Label size="xs" className="text-on-dark-disabled">Availability</Label>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <Users className="size-3 text-on-dark-muted" />
                                <Body size="sm" className="text-white">{exp.spotsLeft} spots</Body>
                              </Stack>
                            </Stack>
                            {exp.price && (
                              <Stack gap={1}>
                                <Label size="xs" className="text-on-dark-disabled">Member Price</Label>
                                <Body size="sm" className="text-warning">${exp.memberPrice.toFixed(0)}</Body>
                              </Stack>
                            )}
                          </Stack>
                          <Button
                            variant="solid"
                            size="sm"
                            className="bg-warning text-black hover:bg-warning/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/experiences/${exp.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
