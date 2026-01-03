"use client";

/**
 * Blog Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, article grid, and newsletter signup
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Calendar, User, Search, ArrowRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge, Input, Spinner, Box} from "@ghxstship/ui";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
}

const DEMO_POSTS: BlogPost[] = [
  { id: "1", title: "The Future of Live Event Production", excerpt: "Exploring emerging technologies and trends shaping the industry, from AI-powered scheduling to sustainable event practices.", author: "Alex Chen", date: "2024-12-15", category: "Industry", image: "/blog/future-events.jpg", readTime: "5 min" },
  { id: "2", title: "How to Streamline Your Production Workflow", excerpt: "Best practices for managing complex productions efficiently, including tips from industry veterans.", author: "Sarah Williams", date: "2024-12-10", category: "Tips", image: "/blog/workflow.jpg", readTime: "8 min" },
  { id: "3", title: "Case Study: Summer Festival 2024", excerpt: "How we helped manage a 50,000 attendee festival with real-time collaboration and resource tracking.", author: "Michael Brown", date: "2024-12-05", category: "Case Study", image: "/blog/festival.jpg", readTime: "10 min" },
  { id: "4", title: "Introducing New Collaboration Features", excerpt: "Real-time collaboration tools for production teams that enable seamless communication across locations.", author: "Emily Davis", date: "2024-11-28", category: "Product", image: "/blog/collaboration.jpg", readTime: "4 min" },
  { id: "5", title: "Sustainability in Event Production", excerpt: "Reducing environmental impact while delivering great experiences through smart resource management.", author: "Alex Chen", date: "2024-11-20", category: "Industry", image: "/blog/sustainability.jpg", readTime: "7 min" },
  { id: "6", title: "Managing Remote Production Teams", excerpt: "Tips for coordinating distributed teams effectively with modern communication and project management tools.", author: "Sarah Williams", date: "2024-11-15", category: "Tips", image: "/blog/remote-teams.jpg", readTime: "6 min" },
];

const CATEGORIES = ["All", "Industry", "Tips", "Case Study", "Product"];

export default function BlogPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog");
      if (!response.ok) return DEMO_POSTS;
      const data = await response.json();
      return data.posts?.length ? data.posts : DEMO_POSTS;
    },
  });

  const filteredPosts = posts.filter((post: BlogPost) => {
    const matchesSearch = !search || post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Industry: "bg-primary/20 text-primary border-primary/30",
      Tips: "bg-success/20 text-success border-success/30",
      "Case Study": "bg-accent/20 text-accent border-accent/30",
      Product: "bg-secondary/20 text-secondary border-secondary/30",
    };
    return colors[category] || "bg-grey-800 text-on-dark-muted border-grey-700";
  };

  const featuredPost = posts[0];

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Resources"
              title="ATLVS Blog"
              description="Insights, tips, and news from the ATLVS team. Learn from industry experts and stay up to date with the latest in production management."
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "featured",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: featuredPost ? (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Featured Article</Body>
                </Stack>

                <Card
                  className="p-8 border-2 border-primary/30 rounded-card pop-card-atlvs group"
                  onClick={() => router.push(`/blog/${featuredPost.id}`)}
                >
                  <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
                    <Box className="aspect-video bg-grey-800 rounded-card overflow-hidden">
                      <Box className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <FileText className="size-16 text-on-dark-disabled" />
                      </Box>
                    </Box>
                    <Stack gap={4}>
                      <Badge className={getCategoryColor(featuredPost.category)}>{featuredPost.category}</Badge>
                      <Body className="text-white font-weight-bold text-h4-md group-hover:text-primary transition-colors">{featuredPost.title}</Body>
                      <Body className="text-on-dark-muted">{featuredPost.excerpt}</Body>
                      <Stack direction="horizontal" gap={4} className="items-center text-on-dark-disabled">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <User className="size-4" />
                          <Body size="sm">{featuredPost.author}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Calendar className="size-4" />
                          <Body size="sm">{formatDate(featuredPost.date)}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Clock className="size-4" />
                          <Body size="sm">{featuredPost.readTime} read</Body>
                        </Stack>
                      </Stack>
                      <Button variant="outline" className="w-fit group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors" icon={<ArrowRight className="size-4" />} iconPosition="right">
                        Read Article
                      </Button>
                    </Stack>
                  </Grid>
                </Card>
              </Stack>
            </Container>
          ) : null,
        },
        {
          id: "articles",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">All Articles</Body>
                  <H3 className="text-white">Latest from the Blog</H3>
                </Stack>

                {/* Search and Filters */}
                <Card className="p-4 border-2 border-grey-800 rounded-card">
                  <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
                    <Box className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                      <Input
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </Box>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {CATEGORIES.map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? "solid" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                {/* Articles Grid */}
                {isLoading ? (
                  <Stack className="items-center py-12">
                    <Spinner size="lg" />
                    <Body className="text-on-dark-muted mt-4">Loading articles...</Body>
                  </Stack>
                ) : filteredPosts.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-grey-800 rounded-card">
                    <FileText className="size-16 text-on-dark-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-medium mb-2">No Articles Found</Body>
                    <Body className="text-on-dark-muted mb-4">{search ? "Try a different search term" : "Check back soon for new content"}</Body>
                    {search && <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>}
                  </Card>
                ) : (
                  <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.slice(1).map((post: BlogPost) => (
                      <Card
                        key={post.id}
                        className="p-6 border-2 border-grey-800 rounded-card pop-card-atlvs group"
                        onClick={() => router.push(`/blog/${post.id}`)}
                      >
                        <Stack gap={4}>
                          <Box className="aspect-video bg-grey-800 rounded-card overflow-hidden">
                            <Box className="w-full h-full bg-gradient-to-br from-grey-700 to-grey-800 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                              <FileText className="size-8 text-on-dark-disabled" />
                            </Box>
                          </Box>
                          <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                          <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{post.title}</Body>
                          <Body size="sm" className="text-on-dark-muted line-clamp-2">{post.excerpt}</Body>
                          <Stack direction="horizontal" gap={4} className="items-center text-on-dark-disabled mt-auto">
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <User className="size-3" />
                              <Body size="sm">{post.author}</Body>
                            </Stack>
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <Clock className="size-3" />
                              <Body size="sm">{post.readTime}</Body>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Stay Up to Date"
              description="Subscribe to our newsletter for the latest insights, tips, and product updates delivered to your inbox."
              primaryCta={{
                label: "Subscribe",
                onClick: () => router.push("/newsletter"),
              }}
              secondaryCta={{
                label: "View All Articles",
                onClick: () => document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" }),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
