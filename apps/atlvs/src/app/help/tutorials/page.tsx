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
  Video, 
  ArrowRight, 
  Play, 
  Clock, 
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Zap,
  CheckCircle,
  Filter,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const tutorialCategories = [
  { id: "all", label: "All Tutorials", count: 24 },
  { id: "getting-started", label: "Getting Started", count: 6 },
  { id: "productions", label: "Productions", count: 5 },
  { id: "budgets", label: "Budgets & Finance", count: 4 },
  { id: "scheduling", label: "Scheduling", count: 4 },
  { id: "advanced", label: "Advanced", count: 5 },
];

const featuredTutorials = [
  {
    id: "1",
    title: "Complete ATLVS Walkthrough",
    description: "A comprehensive tour of all ATLVS features and how they work together.",
    duration: "15:32",
    category: "getting-started",
    thumbnail: "/tutorials/walkthrough.jpg",
    views: 12450,
    featured: true,
  },
  {
    id: "2",
    title: "Creating Your First Production",
    description: "Step-by-step guide to setting up a new production project from scratch.",
    duration: "8:45",
    category: "getting-started",
    thumbnail: "/tutorials/first-production.jpg",
    views: 8920,
    featured: true,
  },
  {
    id: "3",
    title: "Budget Management Masterclass",
    description: "Learn to track budgets, manage expenses, and generate financial reports.",
    duration: "12:18",
    category: "budgets",
    thumbnail: "/tutorials/budgets.jpg",
    views: 6780,
    featured: true,
  },
];

const allTutorials = [
  {
    id: "4",
    title: "Setting Up Your Organization",
    description: "Configure your company profile, branding, and team structure.",
    duration: "5:22",
    category: "getting-started",
    icon: Settings,
  },
  {
    id: "5",
    title: "Inviting Team Members",
    description: "Add crew members and assign appropriate roles and permissions.",
    duration: "4:15",
    category: "getting-started",
    icon: Users,
  },
  {
    id: "6",
    title: "Production Templates",
    description: "Use and customize production templates to speed up project setup.",
    duration: "6:30",
    category: "productions",
    icon: BookOpen,
  },
  {
    id: "7",
    title: "Managing Production Phases",
    description: "Organize your production into phases with milestones and deadlines.",
    duration: "7:45",
    category: "productions",
    icon: Zap,
  },
  {
    id: "8",
    title: "Expense Tracking & Approvals",
    description: "Submit, review, and approve expenses with receipt attachments.",
    duration: "6:12",
    category: "budgets",
    icon: DollarSign,
  },
  {
    id: "9",
    title: "Creating Call Sheets",
    description: "Build and distribute professional call sheets to your crew.",
    duration: "8:30",
    category: "scheduling",
    icon: Calendar,
  },
  {
    id: "10",
    title: "Crew Availability Management",
    description: "Track crew availability and handle scheduling conflicts.",
    duration: "5:45",
    category: "scheduling",
    icon: Users,
  },
  {
    id: "11",
    title: "Advanced Reporting",
    description: "Create custom reports and dashboards for stakeholders.",
    duration: "9:20",
    category: "advanced",
    icon: BookOpen,
  },
  {
    id: "12",
    title: "API & Integrations",
    description: "Connect ATLVS with your existing tools and workflows.",
    duration: "11:15",
    category: "advanced",
    icon: Settings,
  },
];

const learningPaths = [
  {
    title: "Producer Track",
    description: "Master high-level production management, budgeting, and stakeholder communication.",
    tutorials: 8,
    duration: "1h 45m",
    icon: Zap,
  },
  {
    title: "Production Manager Track",
    description: "Learn day-to-day operations, crew coordination, and logistics management.",
    tutorials: 10,
    duration: "2h 15m",
    icon: Users,
  },
  {
    title: "Finance Track",
    description: "Deep dive into budgets, expenses, vendor payments, and financial reporting.",
    tutorials: 6,
    duration: "1h 20m",
    icon: DollarSign,
  },
];

export default function TutorialsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Video className="size-10 text-brand-pink" />
            </Stack>
            <Display size="lg" className="text-white">
              VIDEO TUTORIALS
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Learn ATLVS through step-by-step video guides. From quick tips to 
              comprehensive walkthroughs, find the tutorial that fits your needs.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <Badge variant="outline" className="border-ink-600 text-on-dark-muted">
                24 Tutorials
              </Badge>
              <Badge variant="outline" className="border-ink-600 text-on-dark-muted">
                4+ Hours of Content
              </Badge>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured Tutorials */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4}>
              <H2 className="text-ink-950">FEATURED TUTORIALS</H2>
              <Body className="text-grey-600">Start with our most popular and comprehensive guides</Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {featuredTutorials.map((tutorial) => (
                <Card 
                  key={tutorial.id} 
                  className="group border-2 border-ink-950 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Video Thumbnail */}
                  <Stack className="relative aspect-video bg-ink-900">
                    <Stack className="absolute inset-0 flex items-center justify-center">
                      <Stack className="flex size-16 items-center justify-center rounded-avatar border-2 border-white/20 bg-white/10 transition-all group-hover:scale-110 group-hover:bg-brand-pink">
                        <Play className="size-8 text-white" />
                      </Stack>
                    </Stack>
                    <Badge variant="solid" className="absolute bottom-2 right-2 bg-ink-950/80">
                      {tutorial.duration}
                    </Badge>
                  </Stack>
                  <Stack gap={3} className="p-4">
                    <H3 size="sm" className="text-ink-950">{tutorial.title}</H3>
                    <Body size="sm" className=" text-grey-600">{tutorial.description}</Body>
                    <Stack direction="horizontal" gap={2} className="items-center text-grey-500">
                      <Play className="size-4" />
                      <Label size="xs">{tutorial.views.toLocaleString()} views</Label>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* All Tutorials */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <H2 className="text-ink-950">ALL TUTORIALS</H2>
                <Body className="text-grey-600">Browse our complete tutorial library</Body>
              </Stack>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="size-4 text-grey-500" />
                <Label size="sm" className="text-grey-500">Filter by category</Label>
              </Stack>
            </Stack>

            {/* Category Filters */}
            <Stack direction="horizontal" gap={2} className="flex-wrap">
              {tutorialCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={category.id === "all" ? "solid" : "outline"}
                  size="sm"
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </Stack>

            {/* Tutorial Grid */}
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              {allTutorials.map((tutorial) => (
                <Card 
                  key={tutorial.id} 
                  className="border-2 border-grey-200 p-4 transition-all hover:border-primary"
                >
                  <Stack direction="horizontal" gap={4}>
                    <Stack className="flex size-12 shrink-0 items-center justify-center rounded-card border-2 border-grey-200 bg-grey-100">
                      <tutorial.icon className="size-6 text-grey-600" />
                    </Stack>
                    <Stack gap={2} className="flex-1">
                      <Body className="font-weight-semibold text-ink-950">{tutorial.title}</Body>
                      <Body size="sm" className=" text-grey-600">{tutorial.description}</Body>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Clock className="size-3 text-grey-400" />
                        <Label size="xs" className="text-grey-500">{tutorial.duration}</Label>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Learning Paths */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H2 className="text-white">LEARNING PATHS</H2>
              <Body className="text-on-dark-secondary">
                Structured tutorial series tailored to your role
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {learningPaths.map((path) => (
                <Card 
                  key={path.title} 
                  inverted 
                  className="border-2 border-ink-700 bg-ink-800 p-6 transition-all hover:border-brand-pink"
                >
                  <Stack gap={4}>
                    <Stack className="flex size-14 items-center justify-center rounded-avatar border-2 border-ink-600 bg-ink-700">
                      <path.icon className="size-7 text-brand-pink" />
                    </Stack>
                    <H3 size="sm" className="text-white">{path.title}</H3>
                    <Body size="sm" className=" text-on-dark-muted">{path.description}</Body>
                    <Stack direction="horizontal" gap={4}>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Video className="size-4 text-on-dark-muted" />
                        <Label size="xs" className="text-on-dark-muted">{path.tutorials} tutorials</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Clock className="size-4 text-on-dark-muted" />
                        <Label size="xs" className="text-on-dark-muted">{path.duration}</Label>
                      </Stack>
                    </Stack>
                    <Button variant="outlineWhite" size="sm" icon={<Play />}>
                      Start Learning
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Progress Tracking */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-ink-950 p-8">
            <Stack direction="horizontal" gap={8} className="items-center">
              <Stack gap={4} className="flex-1">
                <H3 className="text-ink-950">TRACK YOUR PROGRESS</H3>
                <Body className="text-grey-600">
                  Sign in to track which tutorials you&apos;ve completed, save your favorites, 
                  and pick up where you left off.
                </Body>
                <Stack direction="horizontal" gap={3}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <CheckCircle className="size-4 text-success" />
                    <Label size="sm" className="text-grey-600">Track completion</Label>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <CheckCircle className="size-4 text-success" />
                    <Label size="sm" className="text-grey-600">Save favorites</Label>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <CheckCircle className="size-4 text-success" />
                    <Label size="sm" className="text-grey-600">Resume watching</Label>
                  </Stack>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={4}>
                <NextLink href="/auth/signin">
                  <Button variant="solid" size="lg">
                    Sign In
                  </Button>
                </NextLink>
                <NextLink href="/help">
                  <Button variant="outline" size="lg" icon={<ArrowRight />}>
                    Help Center
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
