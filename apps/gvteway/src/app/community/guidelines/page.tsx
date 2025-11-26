'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
} from '@ghxstship/ui';

const GUIDELINES = [
  {
    id: 'respect',
    title: 'Be Respectful',
    icon: '🤝',
    description: 'Treat all community members with respect and kindness.',
    rules: [
      'No harassment, bullying, or personal attacks',
      'Respect different opinions and perspectives',
      'Use inclusive and welcoming language',
      'Be patient with new members',
    ],
  },
  {
    id: 'authentic',
    title: 'Be Authentic',
    icon: '✨',
    description: 'Share genuine experiences and honest opinions.',
    rules: [
      'Write honest reviews based on real experiences',
      'Don\'t post fake or misleading content',
      'Disclose any conflicts of interest',
      'Don\'t impersonate others',
    ],
  },
  {
    id: 'safe',
    title: 'Keep It Safe',
    icon: '🛡️',
    description: 'Help maintain a safe environment for everyone.',
    rules: [
      'No sharing of personal information without consent',
      'Report suspicious or harmful behavior',
      'Don\'t share illegal content',
      'Protect minors and vulnerable individuals',
    ],
  },
  {
    id: 'relevant',
    title: 'Stay Relevant',
    icon: '🎯',
    description: 'Keep discussions focused and on-topic.',
    rules: [
      'Post content relevant to events and experiences',
      'No spam or excessive self-promotion',
      'Use appropriate channels for different topics',
      'Avoid off-topic discussions in event chats',
    ],
  },
  {
    id: 'legal',
    title: 'Follow the Law',
    icon: '⚖️',
    description: 'Comply with all applicable laws and regulations.',
    rules: [
      'No ticket scalping or fraud',
      'Respect intellectual property rights',
      'Don\'t promote illegal activities',
      'Follow venue and event rules',
    ],
  },
];

const CONTENT_POLICY = [
  {
    category: 'Prohibited Content',
    items: [
      'Hate speech or discrimination',
      'Explicit sexual content',
      'Graphic violence',
      'Illegal activities',
      'Spam or scams',
      'Malware or phishing',
    ],
  },
  {
    category: 'Restricted Content',
    items: [
      'Spoilers (must be marked)',
      'Promotional content (limited)',
      'External links (moderated)',
      'Political discussions',
    ],
  },
];

const ENFORCEMENT = [
  { level: 'Warning', description: 'First-time minor violations', action: 'Written warning' },
  { level: 'Temporary Mute', description: 'Repeated minor violations', action: '24-72 hour mute' },
  { level: 'Temporary Ban', description: 'Serious violations', action: '7-30 day ban' },
  { level: 'Permanent Ban', description: 'Severe or repeated violations', action: 'Account termination' },
];

export default function CommunityGuidelinesPage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('respect');

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Community Guidelines</H1>
          <Body className="text-grey-600">
            Our standards for a positive community experience
          </Body>
        </Stack>

        <Card className="p-6 mb-8 bg-black text-white">
          <Stack direction="horizontal" gap={4} className="items-center">
            <Body className="text-4xl">📜</Body>
            <Stack>
              <H3 className="text-white">Our Community Promise</H3>
              <Body className="text-grey-300">
                We&apos;re committed to creating a welcoming, inclusive, and safe space for all fans 
                to connect, share experiences, and celebrate their love for live events.
              </Body>
            </Stack>
          </Stack>
        </Card>

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <H2>COMMUNITY STANDARDS</H2>
            
            {GUIDELINES.map(guideline => (
              <Card
                key={guideline.id}
                className={`p-6 cursor-pointer transition-all ${
                  expandedSection === guideline.id ? 'border-2 border-black' : ''
                }`}
                onClick={() => setExpandedSection(
                  expandedSection === guideline.id ? null : guideline.id
                )}
              >
                <Stack direction="horizontal" gap={4} className="items-start">
                  <Body className="text-3xl">{guideline.icon}</Body>
                  <Stack className="flex-1">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <H3>{guideline.title}</H3>
                      <Body className="text-grey-400">
                        {expandedSection === guideline.id ? '−' : '+'}
                      </Body>
                    </Stack>
                    <Body className="text-grey-600">{guideline.description}</Body>
                    
                    {expandedSection === guideline.id && (
                      <Stack className="mt-4 pt-4 border-t border-grey-200" gap={2}>
                        {guideline.rules.map((rule, index) => (
                          <Stack key={index} direction="horizontal" gap={2}>
                            <Body className="text-success-500">✓</Body>
                            <Body>{rule}</Body>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))}

            <Card className="p-6 mt-4">
              <H2 className="mb-6">CONTENT POLICY</H2>
              <Grid cols={2} gap={6}>
                {CONTENT_POLICY.map(policy => (
                  <Stack key={policy.category}>
                    <H3 className="mb-3">{policy.category}</H3>
                    <Stack gap={2}>
                      {policy.items.map((item, index) => (
                        <Stack key={index} direction="horizontal" gap={2}>
                          <Body className={policy.category === 'Prohibited Content' ? 'text-error-500' : 'text-warning-500'}>
                            {policy.category === 'Prohibited Content' ? '✕' : '⚠'}
                          </Body>
                          <Body>{item}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Grid>
            </Card>

            <Card className="p-6">
              <H2 className="mb-6">ENFORCEMENT</H2>
              <Stack gap={4}>
                {ENFORCEMENT.map((level, index) => (
                  <Stack
                    key={level.level}
                    direction="horizontal"
                    className="items-center py-3 border-b border-grey-100 last:border-0"
                  >
                    <Stack className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Body className="text-sm font-bold">{index + 1}</Body>
                    </Stack>
                    <Stack className="flex-1 ml-4">
                      <Body className="font-bold">{level.level}</Body>
                      <Body className="text-sm text-grey-600">{level.description}</Body>
                    </Stack>
                    <Badge variant="outline">{level.action}</Badge>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6 bg-grey-50">
              <H3 className="mb-4">NEED HELP?</H3>
              <Stack gap={4}>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/support/chat')}
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/settings/privacy')}
                >
                  Report a User
                </Button>
              </Stack>
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">QUICK LINKS</H3>
              <Stack gap={2}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/terms')}
                >
                  Terms of Service
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/privacy')}
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/community')}
                >
                  Community Forums
                </Button>
              </Stack>
            </Card>

            <Card className="p-6 bg-warning-50">
              <H3 className="mb-4">REPORT VIOLATIONS</H3>
              <Body className="text-sm text-grey-600 mb-4">
                See something that violates our guidelines? Let us know.
              </Body>
              <Button
                variant="solid"
                className="w-full"
                onClick={() => router.push('/settings/privacy')}
              >
                Report Content
              </Button>
            </Card>
          </Stack>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
