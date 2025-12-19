import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
  Badge,
} from "@ghxstship/ui";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const blogData = {
  hero: {
    headline: "INSIGHTS & UPDATES",
    description: "Industry insights, product updates, and best practices for production professionals.",
  },
  featured: {
    title: "The Future of Production Management: AI and Automation",
    excerpt: "How artificial intelligence is transforming the way productions are planned, executed, and delivered.",
    author: "Sarah Chen",
    date: "December 1, 2024",
    readTime: "8 min read",
    category: "Industry Trends",
    slug: "future-of-production-management",
  },
  posts: [
    {
      title: "5 Budget Mistakes Every Production Makes (And How to Avoid Them)",
      excerpt: "Learn from the most common financial pitfalls in production and how to keep your projects on track.",
      author: "Marcus Johnson",
      date: "November 28, 2024",
      readTime: "5 min read",
      category: "Best Practices",
      slug: "budget-mistakes-to-avoid",
    },
    {
      title: "Building a Crew Database That Actually Works",
      excerpt: "Tips for organizing your crew contacts and making last-minute staffing a breeze.",
      author: "Emily Rodriguez",
      date: "November 20, 2024",
      readTime: "6 min read",
      category: "Guides",
      slug: "building-crew-database",
    },
    {
      title: "ATLVS 2.4: Mobile App Redesign",
      excerpt: "Introducing our completely redesigned mobile experience with offline support.",
      author: "ATLVS Team",
      date: "November 15, 2024",
      readTime: "3 min read",
      category: "Product Updates",
      slug: "atlvs-2-4-mobile-redesign",
    },
    {
      title: "How III Points Festival Scaled with ATLVS",
      excerpt: "A behind-the-scenes look at how one of Miami's biggest festivals manages operations.",
      author: "David Park",
      date: "November 10, 2024",
      readTime: "7 min read",
      category: "Case Studies",
      slug: "iii-points-case-study",
    },
    {
      title: "The Complete Guide to Production Insurance",
      excerpt: "Everything you need to know about protecting your production from unexpected events.",
      author: "Lisa Thompson",
      date: "November 5, 2024",
      readTime: "10 min read",
      category: "Guides",
      slug: "production-insurance-guide",
    },
    {
      title: "Integrating ATLVS with QuickBooks: A Step-by-Step Guide",
      excerpt: "Sync your financial data seamlessly between ATLVS and QuickBooks Online.",
      author: "Tech Team",
      date: "October 28, 2024",
      readTime: "4 min read",
      category: "Tutorials",
      slug: "quickbooks-integration-guide",
    },
  ],
  categories: ["All", "Industry Trends", "Best Practices", "Guides", "Product Updates", "Case Studies", "Tutorials"],
};

export default function BlogPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              BLOG
            </Label>
            <Display size="lg" className="text-white">
              {blogData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {blogData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured Post */}
      <FullBleedSection background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <NextLink href={`/blog/${blogData.featured.slug}`}>
            <Card className="border-2 border-ink-950 bg-white p-8 shadow-brand-lg transition-all hover:-translate-y-1 hover:shadow-brand-xl">
              <Grid cols={2} gap={8} className="items-center sm:grid-cols-1">
                <Stack className="flex aspect-video items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Label size="sm" className="text-grey-400">Featured Image</Label>
                </Stack>
                <Stack gap={4}>
                  <Badge variant="outline" className="w-fit border-brand-pink text-brand-pink">
                    {blogData.featured.category}
                  </Badge>
                  <H1 className="text-ink-950">{blogData.featured.title}</H1>
                  <Body size="lg" className="text-grey-600">
                    {blogData.featured.excerpt}
                  </Body>
                  <Stack direction="horizontal" gap={4} className="text-grey-500">
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <User className="size-4" />
                      <Label size="xs">{blogData.featured.author}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Calendar className="size-4" />
                      <Label size="xs">{blogData.featured.date}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Clock className="size-4" />
                      <Label size="xs">{blogData.featured.readTime}</Label>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
            </Card>
          </NextLink>
        </Container>
      </FullBleedSection>

      {/* Categories */}
      <FullBleedSection background="white" className="py-8">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack direction="horizontal" gap={3} className="flex-wrap justify-center">
            {blogData.categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className={category === "All" ? "border-ink-950 bg-ink-950 text-white" : "border-ink-950 text-ink-950"}
              >
                {category}
              </Badge>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Posts Grid */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={6} className="sm:grid-cols-1">
            {blogData.posts.map((post) => (
              <NextLink key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="border-2 border-ink-950 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Stack className="flex aspect-video items-center justify-center border-b-2 border-ink-950 bg-grey-100">
                    <Label size="xs" className="text-grey-400">Image</Label>
                  </Stack>
                  <Stack gap={3} className="p-6">
                    <Badge variant="outline" className="w-fit border-grey-300 text-grey-500">
                      {post.category}
                    </Badge>
                    <H3 size="sm" className="text-ink-950">{post.title}</H3>
                    <Body size="xs" className="text-grey-600">
                      {post.excerpt}
                    </Body>
                    <Stack direction="horizontal" gap={3} className="text-grey-400">
                      <Label size="xs">{post.date}</Label>
                      <Label size="xs">{post.readTime}</Label>
                    </Stack>
                  </Stack>
                </Card>
              </NextLink>
            ))}
          </Grid>

          <Stack className="mt-12 items-center">
            <Button variant="outline" size="lg" icon={<ArrowRight />}>
              Load More Posts
            </Button>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Newsletter */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              STAY UPDATED
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Get the latest insights and updates delivered to your inbox.
            </Body>
            <NextLink href="/settings/notifications">
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                Subscribe to Newsletter
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
