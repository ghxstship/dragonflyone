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
  Input,
  FullBleedSection,
} from "@ghxstship/ui";
import { Play, Calendar, Users, Clock, Check, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const benefits = [
  "30-minute personalized walkthrough",
  "See features relevant to your tools",
  "Get tier recommendation based on your stack",
  "No commitment required",
];

const stats = [
  { icon: Clock, value: "30 min", label: "Average Demo Length" },
  { icon: Users, value: "2,400+", label: "Teams Using GHXSTSHIP" },
  { icon: Calendar, value: "24 hrs", label: "Response Time" },
];

const toolCategories = [
  { label: "CRM", options: ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Other", "None"] },
  { label: "Finance", options: ["QuickBooks", "Xero", "NetSuite", "FreshBooks", "Other", "None"] },
  { label: "Ticketing", options: ["Eventbrite", "DICE", "Ticketmaster", "Universe", "See Tickets", "Other", "None"] },
  { label: "Crews", options: ["ConnectTeam", "Deputy", "When I Work", "Sling", "7shifts", "Other", "None"] },
  { label: "PM", options: ["Monday", "Asana", "Basecamp", "Notion", "Airtable", "Other", "None"] },
];

export default function DemoPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center sm:grid-cols-1">
            <Stack gap={8}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Play className="size-6 text-brand-pink" />
                <Label size="xs" className="text-brand-pink">THE INDUSTRY STANDARD</Label>
              </Stack>
              <Display size="lg" className="text-white">SEE WHY INDUSTRY LEADERS CHOOSE GHXSTSHIP</Display>
              <Body size="lg" className="text-on-dark-secondary">
                30 minutes. Personalized. Tell us what you use—we&apos;ll show you why the leaders switched.
              </Body>
              <Stack gap={3}>
                {benefits.map((benefit) => (
                  <Stack key={benefit} direction="horizontal" gap={3} className="items-center">
                    <Check className="size-4 text-brand-pink" />
                    <Label size="sm" className="text-on-dark-secondary">{benefit}</Label>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            {/* Demo Video Placeholder */}
            <Card inverted className="aspect-video border-2 border-ink-800 bg-ink-900">
              <Stack className="flex h-full items-center justify-center">
                <Stack gap={4} className="items-center text-center">
                  <Stack className="flex size-16 items-center justify-center rounded-avatar border-2 border-brand-pink bg-ink-800">
                    <Play className="size-8 text-brand-pink" />
                  </Stack>
                  <Label size="sm" className="text-on-dark-muted">Watch Product Overview</Label>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={8} className="sm:grid-cols-1">
            {stats.map((stat) => (
              <Stack key={stat.label} className="items-center text-center">
                <stat.icon className="mb-4 size-8 text-brand-pink" />
                <Display size="md" className="text-ink-950">{stat.value}</Display>
                <Label size="xs" className="text-grey-500">{stat.label}</Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Schedule Demo Form */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-8 shadow-lg lg:p-12">
            <Stack gap={8}>
              <Stack gap={4} className="text-center">
                <H1 className="text-ink-950">GET YOUR RECOMMENDATION</H1>
                <Body className="text-grey-600">
                  Tell us what tools you currently use—we&apos;ll recommend the right tier for you.
                </Body>
              </Stack>

              <form>
                <Stack gap={6}>
                  <Grid cols={2} gap={6} className="sm:grid-cols-1">
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-950">FIRST NAME</Label>
                      <Input placeholder="John" className="border-2 border-ink-950" />
                    </Stack>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-950">LAST NAME</Label>
                      <Input placeholder="Doe" className="border-2 border-ink-950" />
                    </Stack>
                  </Grid>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">WORK EMAIL</Label>
                    <Input type="email" placeholder="john@company.com" className="border-2 border-ink-950" />
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">COMPANY</Label>
                    <Input placeholder="Your Company" className="border-2 border-ink-950" />
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">TEAM SIZE</Label>
                    <select className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-pink">
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 people</option>
                      <option value="11-50">11-50 people</option>
                      <option value="51-200">51-200 people</option>
                      <option value="201+">201+ people</option>
                    </select>
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">WHICH VERTICAL?</Label>
                    <select className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-pink">
                      <option value="">Select a vertical</option>
                      <option value="productions">Productions (concerts, festivals, tours)</option>
                      <option value="activations">Activations (brand events, corporate)</option>
                      <option value="installations">Installations (seasonal, immersive)</option>
                      <option value="destinations">Destinations (venues, resorts, attractions)</option>
                    </select>
                  </Stack>

                  {/* Tool Stack Section */}
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label size="xs" className="text-brand-pink">WHAT TOOLS DO YOU CURRENTLY USE?</Label>
                      <Body size="xs" className="text-grey-500">This helps us recommend the right tier for you.</Body>
                    </Stack>
                    
                    <Grid cols={2} gap={4} className="sm:grid-cols-1">
                      {toolCategories.map((category) => (
                        <Stack key={category.label} gap={2}>
                          <Label size="xs" className="text-grey-600">{category.label}</Label>
                          <select className="w-full border-2 border-grey-300 bg-white px-4 py-3 text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-pink">
                            <option value="">Select {category.label.toLowerCase()} tool</option>
                            {category.options.map((opt) => (
                              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                            ))}
                          </select>
                        </Stack>
                      ))}
                    </Grid>
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">WHAT&apos;S NOT WORKING?</Label>
                    <textarea 
                      className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-pink min-h-[100px]" 
                      placeholder="Tell us about your pain points. What tools aren't talking to each other? What's falling through the cracks?"
                    />
                  </Stack>

                  <Button variant="pop" size="lg" fullWidth icon={<ArrowRight />}>
                    Get My Recommendation
                  </Button>

                  <Body size="xs" className="text-center text-grey-500">
                    By submitting this form, you agree to our{" "}
                    <NextLink href="/legal/privacy" className="text-brand-pink underline">Privacy Policy</NextLink>
                  </Body>
                </Stack>
              </form>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Quick Recommendation */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500">QUICK GUIDE</Label>
              <H1 className="text-white">COMMON SCENARIOS</H1>
            </Stack>
            <Grid cols={2} gap={6} className="sm:grid-cols-1">
              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={3}>
                  <H3 size="sm" className="text-white">&ldquo;I have Salesforce + Deputy&rdquo;</H3>
                  <Body size="sm" className="text-grey-400">You just need ticketing. Try GVTEWAY ($0 + fees).</Body>
                  <NextLink href="/auth/signup?plan=gvteway"><Button variant="outline" size="sm">Start GVTEWAY</Button></NextLink>
                </Stack>
              </Card>
              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={3}>
                  <H3 size="sm" className="text-white">&ldquo;I have Eventbrite + Monday&rdquo;</H3>
                  <Body size="sm" className="text-grey-400">You just need crews. Try COMPVSS ($299/mo).</Body>
                  <NextLink href="/auth/signup?plan=compvss"><Button variant="outline" size="sm">Start COMPVSS</Button></NextLink>
                </Stack>
              </Card>
              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={3}>
                  <H3 size="sm" className="text-white">&ldquo;I have ConnectTeam + DICE&rdquo;</H3>
                  <Body size="sm" className="text-grey-400">You just need CRM/finance. Try ATLVS ($799/mo).</Body>
                  <NextLink href="/auth/signup?plan=atlvs"><Button variant="outline" size="sm">Start ATLVS</Button></NextLink>
                </Stack>
              </Card>
              <Card className="border-2 border-brand-pink bg-ink-900 p-6">
                <Stack gap={3}>
                  <H3 size="sm" className="text-white">&ldquo;I want to replace everything&rdquo;</H3>
                  <Body size="sm" className="text-grey-400">Go ENTERPRISE. Lowest fees. Full stack.</Body>
                  <NextLink href="/contact?plan=enterprise"><Button variant="pop" size="sm">Go Enterprise</Button></NextLink>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
