import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Badge,
  Body,
  Card,
  CardBody,
  Container,
  Display,
  FullBleedSection,
  H2,
  H3,
  Icon,
  Label,
  Link,
  List,
  ListItem,
  Stack,
  Text,
} from '@ghxstship/ui';
import { Server, CreditCard, Mail, BarChart3, Shield, Globe } from "lucide-react";

export const runtime = "edge";

const subProcessors = [
  {
    name: "Supabase Inc.",
    category: "Infrastructure",
    icon: Server,
    description: "Database hosting, authentication, real-time subscriptions",
    dataProcessed: ["User accounts", "Application data", "Authentication tokens"],
    location: "United States",
    dpaStatus: "Executed",
    certifications: ["SOC 2 Type II", "GDPR Compliant"],
    website: "https://supabase.com",
    privacyPolicy: "https://supabase.com/privacy",
  },
  {
    name: "Vercel Inc.",
    category: "Infrastructure",
    icon: Globe,
    description: "Website hosting, CDN, edge functions",
    dataProcessed: ["Request logs", "IP addresses", "Usage analytics"],
    location: "Global (US HQ)",
    dpaStatus: "Executed",
    certifications: ["SOC 2 Type II", "GDPR Compliant"],
    website: "https://vercel.com",
    privacyPolicy: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Cloudflare Inc.",
    category: "Infrastructure",
    icon: Shield,
    description: "CDN, DDoS protection, DNS, Web Application Firewall",
    dataProcessed: ["IP addresses", "Request headers", "Traffic data"],
    location: "Global (US HQ)",
    dpaStatus: "Executed",
    certifications: ["SOC 2 Type II", "ISO 27001", "GDPR Compliant"],
    website: "https://cloudflare.com",
    privacyPolicy: "https://cloudflare.com/privacypolicy",
  },
  {
    name: "Stripe Inc.",
    category: "Payments",
    icon: CreditCard,
    description: "Payment processing, billing, fraud prevention",
    dataProcessed: ["Payment card data", "Billing addresses", "Transaction history"],
    location: "United States, EU",
    dpaStatus: "Executed",
    certifications: ["PCI DSS Level 1", "SOC 2 Type II", "GDPR Compliant"],
    website: "https://stripe.com",
    privacyPolicy: "https://stripe.com/privacy",
  },
  {
    name: "Resend Inc.",
    category: "Communications",
    icon: Mail,
    description: "Transactional email delivery",
    dataProcessed: ["Email addresses", "Email content", "Delivery status"],
    location: "United States",
    dpaStatus: "Executed",
    certifications: ["GDPR Compliant"],
    website: "https://resend.com",
    privacyPolicy: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "Sentry",
    category: "Monitoring",
    icon: BarChart3,
    description: "Error tracking, performance monitoring",
    dataProcessed: ["Error logs", "Stack traces", "User context (anonymized)"],
    location: "United States",
    dpaStatus: "Executed",
    certifications: ["SOC 2 Type II", "GDPR Compliant"],
    website: "https://sentry.io",
    privacyPolicy: "https://sentry.io/privacy",
  },
];

const lastUpdated = "January 2025";

export default function SubProcessorsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={6} className="text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800 mx-auto">
              <Server className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              LEGAL
            </Label>
            <Display size="lg" className="text-white">
              SUB-PROCESSORS
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Last updated: {lastUpdated}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Introduction */}
      <FullBleedSection background="white" className="py-12 sm:py-16">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={6}>
            <Body className="text-grey-700">
              This page lists all third-party sub-processors that GHXSTSHIP Industries engages to process 
              personal data on behalf of our customers. This list is maintained in accordance with GDPR 
              Article 28 requirements and is updated whenever sub-processors are added or removed.
            </Body>
            <div className="border-2 border-primary-200 bg-primary-50 p-4 rounded-card">
              <Body className="text-grey-800">
                <strong>Notification of Changes:</strong> Customers will be notified at least 30 days before 
                any new sub-processor is engaged. Notifications are sent to the email address associated with 
                your account. You may object to new sub-processors within 14 days of notification.
              </Body>
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Sub-Processors List */}
      <FullBleedSection background="grey" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <H2 className="text-ink-950 text-center">Current Sub-Processors</H2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {subProcessors.map((processor) => {
                const Icon = processor.icon;
                return (
                  <Card key={processor.name} className="border-2 border-grey-200">
                    <CardBody>
                      <Stack gap={4}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center border-2 border-grey-200 bg-grey-100 rounded-card">
                              <Icon className="size-6 text-grey-600" />
                            </div>
                            <div>
                              <H3 className="text-ink-950">{processor.name}</H3>
                              <Label size="xs" className="text-grey-500">{processor.category}</Label>
                            </div>
                          </div>
                          <Badge variant="success">DPA {processor.dpaStatus}</Badge>
                        </div>

                        <Body size="sm" className="text-grey-700">
                          {processor.description}
                        </Body>

                        <div>
                          <Label size="xs" className="text-grey-500 mb-2 block">DATA PROCESSED</Label>
                          <div className="flex flex-wrap gap-1">
                            {processor.dataProcessed.map((data) => (
                              <Text key={data} className="px-2 py-0.5 bg-grey-100 text-grey-700 rounded-badge text-body-xs">
                                {data}
                              </Text>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-grey-200">
                          <div>
                            <Label size="xs" className="text-grey-500">LOCATION</Label>
                            <Body size="sm" className="text-grey-800">{processor.location}</Body>
                          </div>
                          <div className="flex gap-1">
                            {processor.certifications.slice(0, 2).map((cert) => (
                              <Text key={cert} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-badge text-body-xs">
                                {cert}
                              </Text>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4 text-body-xs">
                          <Link 
                            href={processor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 underline"
                          >
                            Website
                          </Link>
                          <Link 
                            href={processor.privacyPolicy} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 underline"
                          >
                            Privacy Policy
                          </Link>
                        </div>
                      </Stack>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* International Transfers */}
      <FullBleedSection background="white" className="py-12 sm:py-16">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={6}>
            <H2 className="text-ink-950">International Data Transfers</H2>
            <Body className="text-grey-700">
              All sub-processors located outside the European Economic Area (EEA) have executed Standard 
              Contractual Clauses (SCCs) with GHXSTSHIP Industries. Where applicable, supplementary measures 
              have been implemented to ensure adequate protection of personal data.
            </Body>
            <Body className="text-grey-700">
              Transfer Impact Assessments (TIAs) have been conducted for all US-based sub-processors, 
              considering the legal framework in the destination country, access by public authorities, 
              and technical and organizational measures in place.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Objection Process */}
      <FullBleedSection background="grey" className="py-12 sm:py-16">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={6}>
            <H2 className="text-ink-950">Objection Process</H2>
            <Body className="text-grey-700">
              Customers may object to the use of a new sub-processor within 14 days of receiving notification. 
              To object:
            </Body>
            <List className="list-decimal list-inside text-grey-700 space-y-2 ml-4">
              <ListItem>Email <Link href="mailto:privacy@ghxstship.com" className="text-primary-600 underline">privacy@ghxstship.com</Link> with subject &quot;Sub-Processor Objection&quot;</ListItem>
              <ListItem>Include your account details and specific concerns</ListItem>
              <ListItem>We will work with you to address concerns or provide alternatives</ListItem>
            </List>
            <Body className="text-grey-700">
              If we cannot resolve the objection, you may terminate the affected services without penalty.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Contact */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={6} className="text-center">
            <H2 className="text-white">Questions?</H2>
            <Body className="text-on-dark-secondary">
              For questions about our sub-processors or to request DPA copies, contact us:
            </Body>
            <div className="flex flex-wrap gap-6 justify-center">
              <div>
                <Label size="xs" className="text-on-dark-muted">PRIVACY TEAM</Label>
                <Body className="text-white">
                  <Link href="mailto:privacy@ghxstship.com" className="underline">privacy@ghxstship.com</Link>
                </Body>
              </div>
              <div>
                <Label size="xs" className="text-on-dark-muted">DATA PROTECTION OFFICER</Label>
                <Body className="text-white">
                  <Link href="mailto:dpo@ghxstship.com" className="underline">dpo@ghxstship.com</Link>
                </Body>
              </div>
            </div>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
