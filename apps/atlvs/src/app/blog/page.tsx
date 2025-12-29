"use client";

/**
 * Blog Page
 * Company blog and articles
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Calendar, User, Search, List, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

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
  { id: "1", title: "The Future of Live Event Production", excerpt: "Exploring emerging technologies and trends shaping the industry...", author: "Alex Chen", date: "2024-12-15", category: "Industry", image: "🎭", readTime: "5 min" },
  { id: "2", title: "How to Streamline Your Production Workflow", excerpt: "Best practices for managing complex productions efficiently...", author: "Sarah Williams", date: "2024-12-10", category: "Tips", image: "⚡", readTime: "8 min" },
  { id: "3", title: "Case Study: Summer Festival 2024", excerpt: "How we helped manage a 50,000 attendee festival...", author: "Michael Brown", date: "2024-12-05", category: "Case Study", image: "🎪", readTime: "10 min" },
  { id: "4", title: "Introducing New Collaboration Features", excerpt: "Real-time collaboration tools for production teams...", author: "Emily Davis", date: "2024-11-28", category: "Product", image: "🚀", readTime: "4 min" },
  { id: "5", title: "Sustainability in Event Production", excerpt: "Reducing environmental impact while delivering great experiences...", author: "Alex Chen", date: "2024-11-20", category: "Industry", image: "🌱", readTime: "7 min" },
  { id: "6", title: "Managing Remote Production Teams", excerpt: "Tips for coordinating distributed teams effectively...", author: "Sarah Williams", date: "2024-11-15", category: "Tips", image: "🌐", readTime: "6 min" },
];

const CATEGORIES = ["All", "Industry", "Tips", "Case Study", "Product"];

export default function BlogPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: posts = [], isLoading, error, refetch } = useQuery({
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

  const tabs = [
    {
      id: "articles",
      label: "Articles",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
                <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium mb-2">No Articles Found</Body>
              <Body className="text-grey-400">{search ? "Try a different search term" : "Check back soon for new content"}</Body>
            </Card>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
              {filteredPosts.map((post: BlogPost) => (
                <Card key={post.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/blog/${post.id}`)}>
                  <div className="mb-4">{post.image}</div>
                  <Badge variant="outline" className="mb-2">{post.category}</Badge>
                  <Body className="font-weight-bold mb-2">{post.title}</Body>
                  <Body className="text-grey-400 mb-4">{post.excerpt}</Body>
                  <div className="flex items-center justify-between text-grey-500">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <Body size="sm">{post.author}</Body>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <Body size="sm">{formatDate(post.date)}</Body>
                      </div>
                      <Body size="sm">{post.readTime} read</Body>
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      ),
    },
    {
      id: "popular",
      label: "Popular",
      icon: <TrendingUp className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Most Popular Articles" description="Our most-read content" />
          <div className="space-y-4 mt-4">
            {posts.slice(0, 5).map((post: BlogPost, index: number) => (
              <Card key={post.id} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/blog/${post.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="font-weight-bold text-grey-600">#{index + 1}</div>
                  <div>{post.image}</div>
                  <div className="flex-1">
                    <Body className="font-weight-medium">{post.title}</Body>
                    <Body size="sm" className="text-grey-400">{post.author} • {post.readTime} read</Body>
                  </div>
                  <Badge variant="outline">{post.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Resources",
        title: "Blog",
        description: "Insights, tips, and news from the ATLVS team",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
