import { AtlvsAppLayout } from "../../components/app-layout";
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
  Input,
  FullBleedSection,
} from "@ghxstship/ui";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export const runtime = "edge";

const contactData = {
  hero: {
    headline: "GET IN TOUCH",
    description: "Have questions about ATLVS? Our team is here to help you find the right solution for your production needs.",
  },
  options: [
    {
      icon: MessageSquare,
      title: "SALES",
      description: "Talk to our sales team about enterprise solutions and custom pricing.",
      cta: "sales@atlvs.io",
    },
    {
      icon: Mail,
      title: "SUPPORT",
      description: "Get help with your existing ATLVS account or technical questions.",
      cta: "support@atlvs.io",
    },
    {
      icon: Phone,
      title: "PHONE",
      description: "Speak directly with our team during business hours (9am-6pm PT).",
      cta: "+1 (888) 285-8700",
    },
    {
      icon: MapPin,
      title: "OFFICE",
      description: "Visit us at our headquarters in Los Angeles.",
      cta: "Los Angeles, CA",
    },
  ],
};

export default function ContactPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={6} className="text-center">
            <Display size="lg" className="text-white">
              {contactData.hero.headline}
            </Display>
            <Body size="lg" className="mx-auto max-w-2xl text-on-dark-secondary">
              {contactData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Contact Options */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={4} gap={6}>
            {contactData.options.map((option) => (
              <Card key={option.title} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <option.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">
                    {option.title}
                  </H3>
                  <Body size="sm" className="text-grey-600">
                    {option.description}
                  </Body>
                  <Label size="sm" className="text-primary">
                    {option.cta}
                  </Label>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Contact Form */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-3xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-8 shadow-lg lg:p-12">
            <Stack gap={8}>
              <Stack gap={4} className="text-center">
                <H2 className="text-ink-950">SEND US A MESSAGE</H2>
                <Body className="text-grey-600">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </Body>
              </Stack>

              <form>
                <Stack gap={6}>
                  <Grid cols={2} gap={6}>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-950">
                        FIRST NAME
                      </Label>
                      <Input placeholder="John" className="border-2 border-ink-950" />
                    </Stack>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-950">
                        LAST NAME
                      </Label>
                      <Input placeholder="Doe" className="border-2 border-ink-950" />
                    </Stack>
                  </Grid>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      EMAIL
                    </Label>
                    <Input type="email" placeholder="john@company.com" className="border-2 border-ink-950" />
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      COMPANY
                    </Label>
                    <Input placeholder="Your Company" className="border-2 border-ink-950" />
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      MESSAGE
                    </Label>
                    <textarea
                      placeholder="Tell us about your production needs..."
                      rows={5}
                      className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 placeholder:text-grey-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </Stack>

                  <Button variant="pop" size="lg" fullWidth>
                    Send Message
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
