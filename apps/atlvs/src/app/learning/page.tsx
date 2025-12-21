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
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Play,
  Users,
  Star,
  Trophy,
  Target,
  Briefcase,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const learningData = {
  hero: {
    headline: "ATLVS ACADEMY",
    description: "Master production management with structured learning paths, certifications, and hands-on training designed for industry professionals.",
  },
  stats: [
    { value: "5,000+", label: "Certified Users" },
    { value: "40+", label: "Courses" },
    { value: "150+", label: "Hours of Content" },
    { value: "4.9", label: "Avg. Rating" },
  ],
  certifications: [
    {
      title: "ATLVS Certified User",
      level: "Foundation",
      description: "Master the fundamentals of ATLVS for day-to-day production management.",
      duration: "8 hours",
      modules: 6,
      badge: "ACU",
      color: "border-brand-pink",
      slug: "certified-user",
    },
    {
      title: "ATLVS Certified Professional",
      level: "Advanced",
      description: "Deep dive into advanced features, integrations, and best practices.",
      duration: "16 hours",
      modules: 12,
      badge: "ACP",
      color: "border-secondary",
      slug: "certified-professional",
    },
    {
      title: "ATLVS Certified Administrator",
      level: "Expert",
      description: "Configure, customize, and manage ATLVS for enterprise deployments.",
      duration: "24 hours",
      modules: 18,
      badge: "ACA",
      color: "border-accent",
      slug: "certified-administrator",
    },
  ],
  learningPaths: [
    {
      title: "Production Coordinator",
      description: "Essential skills for coordinating productions, managing schedules, and tracking deliverables.",
      courses: 5,
      duration: "10 hours",
      skills: ["Project setup", "Timeline management", "Task tracking", "Communication"],
      icon: Target,
      slug: "production-coordinator",
    },
    {
      title: "Financial Controller",
      description: "Master budgeting, expense tracking, invoicing, and financial reporting.",
      courses: 6,
      duration: "12 hours",
      skills: ["Budget creation", "Cost tracking", "Invoice management", "Financial reports"],
      icon: Briefcase,
      slug: "financial-controller",
    },
    {
      title: "Operations Manager",
      description: "Advanced workflows for managing crew, vendors, and multi-production operations.",
      courses: 8,
      duration: "16 hours",
      skills: ["Crew scheduling", "Vendor management", "Resource allocation", "Analytics"],
      icon: Users,
      slug: "operations-manager",
    },
  ],
  popularCourses: [
    {
      title: "ATLVS Fundamentals",
      description: "Complete introduction to the ATLVS platform and core features.",
      duration: "2 hours",
      lessons: 12,
      rating: 4.9,
      students: 8450,
      category: "Getting Started",
      slug: "fundamentals",
    },
    {
      title: "Budget Management Mastery",
      description: "Build, track, and optimize production budgets like a pro.",
      duration: "3 hours",
      lessons: 18,
      rating: 4.8,
      students: 5230,
      category: "Finance",
      slug: "budget-mastery",
    },
    {
      title: "Crew Scheduling Excellence",
      description: "Create efficient schedules and manage availability at scale.",
      duration: "2.5 hours",
      lessons: 15,
      rating: 4.9,
      students: 4890,
      category: "Operations",
      slug: "crew-scheduling",
    },
    {
      title: "Contract Templates & Workflows",
      description: "Streamline agreements with templates, e-signatures, and automation.",
      duration: "2 hours",
      lessons: 10,
      rating: 4.7,
      students: 3650,
      category: "Documents",
      slug: "contract-workflows",
    },
    {
      title: "Advanced Reporting & Analytics",
      description: "Build custom dashboards and extract insights from your data.",
      duration: "2.5 hours",
      lessons: 14,
      rating: 4.8,
      students: 3120,
      category: "Analytics",
      slug: "advanced-analytics",
    },
    {
      title: "API Integration Workshop",
      description: "Connect ATLVS with your existing tools and automate workflows.",
      duration: "4 hours",
      lessons: 20,
      rating: 4.6,
      students: 1890,
      category: "Technical",
      slug: "api-integration",
    },
  ],
  benefits: [
    {
      icon: Award,
      title: "Industry-Recognized Credentials",
      description: "Certifications that demonstrate your expertise to employers and clients.",
    },
    {
      icon: BookOpen,
      title: "Self-Paced Learning",
      description: "Study on your schedule with lifetime access to all course materials.",
    },
    {
      icon: Play,
      title: "Hands-On Projects",
      description: "Apply what you learn with real-world scenarios and practical exercises.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with fellow learners and get help from certified instructors.",
    },
  ],
};

export default function LearningPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <GraduationCap className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              PROFESSIONAL DEVELOPMENT
            </Label>
            <Display size="lg" className="text-white">
              {learningData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {learningData.hero.description}
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="#certifications">
                <Button variant="pop" size="lg" icon={<Award />}>
                  Get Certified
                </Button>
              </NextLink>
              <NextLink href="#courses">
                <Button variant="outlineWhite" size="lg" icon={<BookOpen />}>
                  Browse Courses
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-8 border-b border-grey-200">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={8}>
            {learningData.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display size="md" className="text-ink-950">{stat.value}</Display>
                <Label size="xs" className="text-grey-500">{stat.label}</Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Certifications */}
      <FullBleedSection id="certifications" background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <Label size="xs" className="text-grey-500 uppercase">Certifications</Label>
            <H1 className="text-ink-950">PROVE YOUR EXPERTISE</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Earn industry-recognized certifications that validate your production management skills.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {learningData.certifications.map((cert) => (
              <Card key={cert.slug} className={`border-2 ${cert.color} bg-white p-8 shadow-brand-lg transition-all hover:-translate-y-1 hover:shadow-brand-xl`}>
                <Stack gap={6}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack className="flex size-14 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <Trophy className="size-7 text-ink-950" />
                    </Stack>
                    <Badge variant="outline" className="border-grey-300 text-grey-600">{cert.level}</Badge>
                  </Stack>
                  <Stack gap={2}>
                    <H3 className="text-ink-950">{cert.title}</H3>
                    <Body size="sm" className="text-grey-600">{cert.description}</Body>
                  </Stack>
                  <Stack gap={2} className="text-grey-500">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Clock className="size-4" />
                      <Label size="xs">{cert.duration} total</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <BookOpen className="size-4" />
                      <Label size="xs">{cert.modules} modules</Label>
                    </Stack>
                  </Stack>
                  <NextLink href={`/learning/certifications/${cert.slug}`}>
                    <Button variant="pop" size="md" fullWidth icon={<ArrowRight />}>
                      Start Certification
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Learning Paths */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <Label size="xs" className="text-brand-pink uppercase">Learning Paths</Label>
            <H1 className="text-white">ROLE-BASED TRAINING</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-on-dark-secondary">
              Curated courses designed for specific production roles and career goals.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {learningData.learningPaths.map((path) => (
              <Card key={path.slug} inverted className="border-2 border-ink-800 bg-ink-900 p-6">
                <Stack gap={5}>
                  <Stack direction="horizontal" gap={4} className="items-start">
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-700 bg-ink-800">
                      <path.icon className="size-6 text-brand-pink" />
                    </Stack>
                    <Stack gap={1} className="flex-1">
                      <H3 size="sm" className="text-white">{path.title}</H3>
                      <Stack direction="horizontal" gap={3} className="text-on-dark-muted">
                        <Label size="xs">{path.courses} courses</Label>
                        <Label size="xs">{path.duration}</Label>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Body size="sm" className="text-on-dark-muted">{path.description}</Body>
                  <Stack gap={2}>
                    <Label size="xs" className="text-grey-500">Skills you&apos;ll gain:</Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {path.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="border-ink-700 text-on-dark-muted">
                          {skill}
                        </Badge>
                      ))}
                    </Stack>
                  </Stack>
                  <NextLink href={`/learning/paths/${path.slug}`}>
                    <Button variant="outlineWhite" size="sm" fullWidth icon={<ArrowRight />}>
                      View Path
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Popular Courses */}
      <FullBleedSection id="courses" background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <Label size="xs" className="text-grey-500 uppercase">Course Catalog</Label>
            <H1 className="text-ink-950">POPULAR COURSES</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Self-paced courses covering every aspect of production management.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {learningData.popularCourses.map((course) => (
              <Card key={course.slug} className="border-2 border-ink-950 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                <Stack className="flex aspect-video items-center justify-center border-b-2 border-ink-950 bg-grey-100">
                  <Play className="size-12 text-grey-400" />
                </Stack>
                <Stack gap={3} className="p-6">
                  <Badge variant="outline" className="w-fit border-grey-300 text-grey-500">
                    {course.category}
                  </Badge>
                  <H3 size="sm" className="text-ink-950">{course.title}</H3>
                  <Body size="xs" className="text-grey-600 line-clamp-2">{course.description}</Body>
                  <Stack direction="horizontal" className="items-center justify-between text-grey-500">
                    <Stack direction="horizontal" gap={3}>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Clock className="size-4" />
                        <Label size="xs">{course.duration}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <BookOpen className="size-4" />
                        <Label size="xs">{course.lessons} lessons</Label>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center text-brand-pink">
                      <Star className="size-4 fill-current" />
                      <Label size="xs">{course.rating}</Label>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={1} className="items-center text-grey-400">
                    <Users className="size-4" />
                    <Label size="xs">{course.students.toLocaleString()} students</Label>
                  </Stack>
                  <NextLink href={`/learning/courses/${course.slug}`}>
                    <Button variant="outline" size="sm" fullWidth icon={<Play />}>
                      Start Course
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Stack className="mt-12 items-center">
            <NextLink href="/learning/courses">
              <Button variant="outline" size="lg" icon={<ArrowRight />}>
                View All Courses
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Benefits */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <H1 className="text-ink-950">WHY LEARN WITH US</H1>
          </Stack>

          <Grid cols={4} gap={6}>
            {learningData.benefits.map((benefit) => (
              <Card key={benefit.title} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <benefit.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">{benefit.title}</H3>
                  <Body size="sm" className="text-grey-600">{benefit.description}</Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              START YOUR LEARNING JOURNEY
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              All courses and certifications are included free with your ATLVS subscription.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Get Started Free
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outlineWhite" size="lg">
                  Request Demo
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
