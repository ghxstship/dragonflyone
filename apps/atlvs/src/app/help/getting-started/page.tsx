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
  Book, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Users, 
  Calendar, 
  DollarSign, 
  FolderOpen,
  Settings,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const onboardingSteps = [
  {
    step: 1,
    title: "Create Your Account",
    description: "Sign up and verify your email to get started with ATLVS.",
    duration: "2 min",
    completed: true,
    href: "/auth/signup",
  },
  {
    step: 2,
    title: "Set Up Your Organization",
    description: "Configure your company profile, team structure, and branding.",
    duration: "5 min",
    completed: false,
    href: "/settings/organization",
  },
  {
    step: 3,
    title: "Create Your First Production",
    description: "Start a new production project with our guided setup wizard.",
    duration: "10 min",
    completed: false,
    href: "/productions/new",
  },
  {
    step: 4,
    title: "Invite Your Team",
    description: "Add crew members and assign roles with appropriate permissions.",
    duration: "5 min",
    completed: false,
    href: "/team/invite",
  },
  {
    step: 5,
    title: "Configure Integrations",
    description: "Connect calendars, accounting software, and other tools.",
    duration: "10 min",
    completed: false,
    href: "/settings/integrations",
  },
];

const quickStartGuides = [
  {
    icon: FolderOpen,
    title: "Production Setup",
    description: "Learn how to create and configure productions with budgets, timelines, and team assignments.",
    articles: 8,
    href: "/help/docs?category=productions",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage crew, assign roles, track availability, and handle scheduling conflicts.",
    articles: 12,
    href: "/help/docs?category=team",
  },
  {
    icon: DollarSign,
    title: "Budget & Expenses",
    description: "Track budgets, manage expenses, process reimbursements, and generate financial reports.",
    articles: 10,
    href: "/help/docs?category=finance",
  },
  {
    icon: Calendar,
    title: "Scheduling",
    description: "Create schedules, manage call sheets, and coordinate complex multi-day productions.",
    articles: 9,
    href: "/help/docs?category=scheduling",
  },
  {
    icon: Shield,
    title: "Compliance & Safety",
    description: "Manage permits, insurance, safety protocols, and regulatory requirements.",
    articles: 7,
    href: "/help/docs?category=compliance",
  },
  {
    icon: Settings,
    title: "Advanced Settings",
    description: "Customize workflows, configure notifications, and set up automation rules.",
    articles: 6,
    href: "/help/docs?category=settings",
  },
];

const roleGuides = [
  {
    role: "Producer",
    description: "Full platform overview with focus on budgets, timelines, and stakeholder management.",
    icon: Zap,
    color: "primary",
  },
  {
    role: "Production Manager",
    description: "Day-to-day operations, crew coordination, and logistics management.",
    icon: Users,
    color: "secondary",
  },
  {
    role: "Finance Manager",
    description: "Budget tracking, expense approvals, vendor payments, and financial reporting.",
    icon: DollarSign,
    color: "success",
  },
  {
    role: "Crew Member",
    description: "Viewing schedules, submitting timesheets, and accessing production documents.",
    icon: Calendar,
    color: "info",
  },
];

export default function GettingStartedPage() {
  const completedSteps = onboardingSteps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedSteps / onboardingSteps.length) * 100);

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Book className="size-10 text-brand-pink" />
            </Stack>
            <Display size="lg" className="text-white">
              GETTING STARTED
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Welcome to ATLVS. Follow our step-by-step guide to set up your account, 
              create your first production, and start managing your projects like a pro.
            </Body>
            <NextLink href="#onboarding">
              <Button variant="pop" size="lg" icon={<Play />}>
                Start Setup
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Onboarding Checklist */}
      <FullBleedSection id="onboarding" background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H2 className="text-ink-950">SETUP CHECKLIST</H2>
              <Body className="text-grey-600">Complete these steps to get your account fully configured</Body>
            </Stack>

            {/* Progress Bar */}
            <Card className="border-2 border-ink-950 p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <Body className="font-weight-semibold">Your Progress</Body>
                  <Badge variant={progressPercent === 100 ? "success" : "solid"}>
                    {completedSteps} of {onboardingSteps.length} complete
                  </Badge>
                </Stack>
                <Stack className="h-3 overflow-hidden rounded-badge bg-grey-200">
                  <Stack 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </Stack>
              </Stack>
            </Card>

            {/* Steps */}
            <Stack gap={4}>
              {onboardingSteps.map((step) => (
                <Card 
                  key={step.step} 
                  className={`border-2 p-6 transition-all ${
                    step.completed 
                      ? "border-success bg-success/5" 
                      : "border-grey-200 hover:border-primary"
                  }`}
                >
                  <Stack direction="horizontal" gap={6} className="items-center">
                    <Stack 
                      className={`flex size-12 shrink-0 items-center justify-center rounded-avatar border-2 ${
                        step.completed 
                          ? "border-success bg-success text-white" 
                          : "border-grey-300 bg-grey-100 text-grey-500"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="size-6" />
                      ) : (
                        <Body className="font-weight-bold">{step.step}</Body>
                      )}
                    </Stack>
                    <Stack gap={1} className="flex-1">
                      <Body className="font-weight-semibold text-ink-950">{step.title}</Body>
                      <Body size="sm" className=" text-grey-600">{step.description}</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                        <Clock className="size-4" />
                        <Label size="xs">{step.duration}</Label>
                      </Stack>
                      <NextLink href={step.href}>
                        <Button 
                          variant={step.completed ? "outline" : "solid"} 
                          size="sm"
                        >
                          {step.completed ? "Review" : "Start"}
                        </Button>
                      </NextLink>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Quick Start Guides */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H2 className="text-ink-950">QUICK START GUIDES</H2>
              <Body className="text-grey-600">Deep dive into specific features and workflows</Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {quickStartGuides.map((guide) => (
                <NextLink key={guide.title} href={guide.href}>
                  <Card className="h-full border-2 border-ink-950 p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <Stack gap={4}>
                      <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                        <guide.icon className="size-6 text-ink-950" />
                      </Stack>
                      <H3 size="sm" className="text-ink-950">{guide.title}</H3>
                      <Body size="sm" className=" text-grey-600">{guide.description}</Body>
                      <Label size="xs" className="text-grey-500">{guide.articles} articles</Label>
                    </Stack>
                  </Card>
                </NextLink>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Role-Based Guides */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H2 className="text-white">GUIDES BY ROLE</H2>
              <Body className="text-on-dark-secondary">
                Tailored onboarding paths based on your responsibilities
              </Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              {roleGuides.map((guide) => (
                <Card 
                  key={guide.role} 
                  inverted 
                  className="border-2 border-ink-700 bg-ink-800 p-6 transition-all hover:border-brand-pink"
                >
                  <Stack gap={4} className="items-center text-center">
                    <Stack className="flex size-14 items-center justify-center rounded-avatar border-2 border-ink-600 bg-ink-700">
                      <guide.icon className="size-7 text-brand-pink" />
                    </Stack>
                    <H3 size="sm" className="text-white">{guide.role}</H3>
                    <Body size="sm" className=" text-on-dark-muted">{guide.description}</Body>
                    <NextLink href={`/help/docs?role=${guide.role.toLowerCase().replace(' ', '-')}`}>
                      <Button variant="outlineWhite" size="sm" icon={<ArrowRight />}>
                        View Guide
                      </Button>
                    </NextLink>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Need Help CTA */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <H2 className="text-ink-950">NEED PERSONALIZED HELP?</H2>
            <Body size="lg" className="text-grey-600">
              Our onboarding specialists are available to walk you through setup 
              and answer any questions about getting started with ATLVS.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo">
                <Button variant="solid" size="lg" icon={<Calendar />}>
                  Schedule Onboarding Call
                </Button>
              </NextLink>
              <NextLink href="/help">
                <Button variant="outline" size="lg" icon={<ArrowRight />}>
                  Back to Help Center
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
