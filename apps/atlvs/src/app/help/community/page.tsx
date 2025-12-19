import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H2,
  H3,
  Label,
  Container,
  Display,
  Button,
  Badge,
  FullBleedSection,
} from "@ghxstship/ui";
import { 
  MessageCircle, 
  ArrowRight, 
  Users, 
  Zap, 
  Trophy,
  MessageSquare,
  FileText,
  Calendar,
  Briefcase,
  Star,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const communityStats = [
  { icon: Users, value: "12,400+", label: "Community Members" },
  { icon: MessageSquare, value: "3,200+", label: "Discussions" },
  { icon: FileText, value: "450+", label: "Shared Templates" },
  { icon: Trophy, value: "85", label: "Expert Contributors" },
];

const forumCategories = [
  {
    id: "general",
    title: "General Discussion",
    description: "Chat about anything production-related",
    topics: 892,
    posts: 4521,
    icon: MessageCircle,
    color: "primary",
  },
  {
    id: "budgeting",
    title: "Budgeting & Finance",
    description: "Tips for managing production budgets",
    topics: 456,
    posts: 2134,
    icon: TrendingUp,
    color: "success",
  },
  {
    id: "scheduling",
    title: "Scheduling & Logistics",
    description: "Crew coordination and timeline management",
    topics: 378,
    posts: 1876,
    icon: Calendar,
    color: "warning",
  },
  {
    id: "templates",
    title: "Templates & Resources",
    description: "Share and download production templates",
    topics: 234,
    posts: 1245,
    icon: FileText,
    color: "info",
  },
  {
    id: "jobs",
    title: "Jobs & Networking",
    description: "Find opportunities and connect with pros",
    topics: 567,
    posts: 2890,
    icon: Briefcase,
    color: "secondary",
  },
  {
    id: "showcase",
    title: "Project Showcase",
    description: "Share your completed productions",
    topics: 189,
    posts: 945,
    icon: Star,
    color: "accent",
  },
];

const recentDiscussions = [
  {
    title: "Best practices for managing multi-location shoots",
    author: "Sarah M.",
    category: "Scheduling & Logistics",
    replies: 24,
    views: 456,
    timeAgo: "2 hours ago",
  },
  {
    title: "Template: Comprehensive budget breakdown for indie films",
    author: "Mike R.",
    category: "Templates & Resources",
    replies: 18,
    views: 892,
    timeAgo: "4 hours ago",
  },
  {
    title: "How do you handle last-minute crew changes?",
    author: "Jessica L.",
    category: "General Discussion",
    replies: 31,
    views: 567,
    timeAgo: "6 hours ago",
  },
  {
    title: "Looking for experienced line producer - NYC area",
    author: "David K.",
    category: "Jobs & Networking",
    replies: 12,
    views: 234,
    timeAgo: "8 hours ago",
  },
];

const upcomingEvents = [
  {
    title: "Monthly Producer Meetup",
    date: "Dec 15, 2024",
    time: "2:00 PM EST",
    type: "Virtual",
    attendees: 45,
  },
  {
    title: "Budget Management Workshop",
    date: "Dec 18, 2024",
    time: "11:00 AM EST",
    type: "Virtual",
    attendees: 78,
  },
  {
    title: "LA Production Networking",
    date: "Dec 20, 2024",
    time: "6:00 PM PST",
    type: "In-Person",
    attendees: 32,
  },
];

const topContributors = [
  { name: "Sarah Mitchell", role: "Line Producer", posts: 234, badge: "Expert" },
  { name: "Michael Chen", role: "Production Manager", posts: 189, badge: "Expert" },
  { name: "Emily Rodriguez", role: "UPM", posts: 156, badge: "Pro" },
  { name: "James Wilson", role: "Producer", posts: 142, badge: "Pro" },
];

export default function CommunityPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <MessageCircle className="size-10 text-brand-pink" />
            </Stack>
            <Display size="lg" className="text-white">
              COMMUNITY
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Connect with production professionals, share knowledge, find templates, 
              and grow your network. Join thousands of producers helping each other succeed.
            </Body>

            {/* Stats */}
            <Grid cols={4} gap={4} className="mt-4 w-full max-w-3xl sm:grid-cols-2 lg:grid-cols-4">
              {communityStats.map((stat) => (
                <Card key={stat.label} inverted className="border-2 border-ink-700 bg-ink-800 p-4 text-center">
                  <Stack gap={2} className="items-center">
                    <stat.icon className="size-5 text-brand-pink" />
                    <Body className="text-body-lg font-weight-bold text-white">{stat.value}</Body>
                    <Label size="xs" className="text-on-dark-muted">{stat.label}</Label>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <NextLink href="/auth/signup">
              <Button variant="pop" size="lg" icon={<Users />}>
                Join the Community
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Forum Categories */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4}>
              <H2 className="text-ink-950">DISCUSSION FORUMS</H2>
              <Body className="text-grey-600">Browse topics or start a new discussion</Body>
            </Stack>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              {forumCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className="border-2 border-grey-200 p-5 transition-all hover:border-primary hover:shadow-md"
                >
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Stack className="flex size-10 shrink-0 items-center justify-center rounded-card border-2 border-grey-200 bg-grey-100">
                        <category.icon className="size-5 text-grey-700" />
                      </Stack>
                      <Stack gap={1} className="flex-1">
                        <Body className="font-weight-semibold text-ink-950">{category.title}</Body>
                        <Body size="sm" className=" text-grey-600">{category.description}</Body>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="text-grey-500">
                      <Label size="xs">{category.topics} topics</Label>
                      <Label size="xs">{category.posts} posts</Label>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Recent Discussions & Sidebar */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={6} className="sm:gap-8 lg:grid-cols-3">
            {/* Recent Discussions */}
            <Stack gap={6} className="col-span-full lg:col-span-2">
              <Stack direction="horizontal" className="items-center justify-between">
                <H2 className="text-ink-950">RECENT DISCUSSIONS</H2>
                <Button variant="outline" size="sm">View All</Button>
              </Stack>

              <Card className="border-2 border-ink-950">
                <Stack gap={0}>
                  {recentDiscussions.map((discussion, idx) => (
                    <Stack 
                      key={discussion.title}
                      gap={3}
                      className={`p-4 transition-colors hover:bg-grey-50 ${
                        idx !== recentDiscussions.length - 1 ? "border-b border-grey-200" : ""
                      }`}
                    >
                      <Stack gap={2}>
                        <Body className="font-weight-semibold text-ink-950">{discussion.title}</Body>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Badge variant="outline" size="sm">{discussion.category}</Badge>
                          <Label size="xs" className="text-grey-500">by {discussion.author}</Label>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={4} className="text-grey-500">
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <MessageSquare className="size-3" />
                          <Label size="xs">{discussion.replies} replies</Label>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Users className="size-3" />
                          <Label size="xs">{discussion.views} views</Label>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Clock className="size-3" />
                          <Label size="xs">{discussion.timeAgo}</Label>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Card>

              <Button variant="solid" size="md" icon={<MessageSquare />}>
                Start a Discussion
              </Button>
            </Stack>

            {/* Sidebar */}
            <Stack gap={6}>
              {/* Upcoming Events */}
              <Stack gap={4}>
                <H3 className="text-ink-950">UPCOMING EVENTS</H3>
                <Stack gap={3}>
                  {upcomingEvents.map((event) => (
                    <Card key={event.title} className="border-2 border-grey-200 p-4">
                      <Stack gap={2}>
                        <Body className="font-weight-semibold text-ink-950">{event.title}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Calendar className="size-3 text-grey-500" />
                          <Label size="xs" className="text-grey-600">{event.date} at {event.time}</Label>
                        </Stack>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Badge 
                            variant={event.type === "Virtual" ? "info" : "success"} 
                            size="sm"
                          >
                            {event.type === "Virtual" ? <Zap className="mr-1 size-3" /> : <MapPin className="mr-1 size-3" />}
                            {event.type}
                          </Badge>
                          <Label size="xs" className="text-grey-500">{event.attendees} attending</Label>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
                <Button variant="outline" size="sm">View All Events</Button>
              </Stack>

              {/* Top Contributors */}
              <Stack gap={4}>
                <H3 className="text-ink-950">TOP CONTRIBUTORS</H3>
                <Card className="border-2 border-grey-200">
                  <Stack gap={0}>
                    {topContributors.map((contributor, idx) => (
                      <Stack 
                        key={contributor.name}
                        direction="horizontal"
                        gap={3}
                        className={`items-center p-3 ${
                          idx !== topContributors.length - 1 ? "border-b border-grey-200" : ""
                        }`}
                      >
                        <Stack className="flex size-10 items-center justify-center rounded-avatar border-2 border-grey-200 bg-grey-100">
                          <Users className="size-5 text-grey-500" />
                        </Stack>
                        <Stack gap={0} className="flex-1">
                          <Body size="sm" className=" font-weight-semibold text-ink-950">{contributor.name}</Body>
                          <Label size="xs" className="text-grey-500">{contributor.role}</Label>
                        </Stack>
                        <Badge 
                          variant={contributor.badge === "Expert" ? "warning" : "solid"} 
                          size="sm"
                        >
                          {contributor.badge}
                        </Badge>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Join CTA */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <H2 className="text-white">JOIN THE CONVERSATION</H2>
            <Body size="lg" className="text-on-dark-secondary">
              Connect with thousands of production professionals. Share your expertise, 
              learn from others, and grow your network.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<Users />}>
                  Create Free Account
                </Button>
              </NextLink>
              <NextLink href="/help">
                <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                  Help Center
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
