'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Kicker,
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
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Community Guidelines</H2>
              <Body className="text-on-dark-muted">
                Our standards for a positive community experience
              </Body>
            </Stack>

        <Card inverted variant="elevated" className="p-6">
          <Stack direction="horizontal" gap={4} className="items-center">
            <Body className="text-h3-md">📜</Body>
            <Stack>
              <H3 className="text-white">Our Community Promise</H3>
              <Body className="text-on-dark-muted">
                We&apos;re committed to creating a welcoming, inclusive, and safe space for all fans 
                to connect, share experiences, and celebrate their love for live events.
              </Body>
            </Stack>
          </Stack>
        </Card>

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <H2 className="text-white">Community Standards</H2>
            
            {GUIDELINES.map(guideline => (
              <Card
                key={guideline.id}
                inverted
                interactive
                className={`cursor-pointer p-6 ${
                  expandedSection === guideline.id ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => setExpandedSection(
                  expandedSection === guideline.id ? null : guideline.id
                )}
              >
                <Stack direction="horizontal" gap={4} className="items-start">
                  <Body className="text-h4-md">{guideline.icon}</Body>
                  <Stack className="flex-1">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <H3 className="text-white">{guideline.title}</H3>
                      <Body className="text-on-dark-muted">
                        {expandedSection === guideline.id ? '−' : '+'}
                      </Body>
                    </Stack>
                    <Body className="text-on-dark-muted">{guideline.description}</Body>
                    
                    {expandedSection === guideline.id && (
                      <Stack className="mt-4 border-t border-ink-700 pt-4" gap={2}>
                        {guideline.rules.map((rule, index) => (
                          <Stack key={index} direction="horizontal" gap={2}>
                            <Body className="text-success-400">✓</Body>
                            <Body className="text-on-dark-muted">{rule}</Body>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))}

            <Card inverted className="mt-4 p-6">
              <H2 className="mb-6 text-white">Content Policy</H2>
              <Grid cols={2} gap={6}>
                {CONTENT_POLICY.map(policy => (
                  <Stack key={policy.category}>
                    <H3 className="mb-3 text-white">{policy.category}</H3>
                    <Stack gap={2}>
                      {policy.items.map((item, index) => (
                        <Stack key={index} direction="horizontal" gap={2}>
                          <Body className={policy.category === 'Prohibited Content' ? 'text-error-400' : 'text-warning-400'}>
                            {policy.category === 'Prohibited Content' ? '✕' : '⚠'}
                          </Body>
                          <Body className="text-on-dark-muted">{item}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Grid>
            </Card>

            <Card inverted className="p-6">
              <H2 className="mb-6 text-white">Enforcement</H2>
              <Stack gap={4}>
                {ENFORCEMENT.map((level, index) => (
                  <Stack
                    key={level.level}
                    direction="horizontal"
                    className="items-center border-b border-ink-700 py-3 last:border-0"
                  >
                    <Stack className="flex size-8 shrink-0 items-center justify-center rounded-avatar bg-white text-black">
                      <Body className="font-display">{index + 1}</Body>
                    </Stack>
                    <Stack className="ml-4 flex-1">
                      <Body className="font-display text-white">{level.level}</Body>
                      <Body size="sm" className="text-on-dark-muted">{level.description}</Body>
                    </Stack>
                    <Badge variant="outline">{level.action}</Badge>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card inverted variant="elevated" className="p-6">
              <H3 className="mb-4 text-white">Need Help?</H3>
              <Stack gap={4}>
                <Button
                  variant="outlineInk"
                  fullWidth
                  onClick={() => router.push('/support/chat')}
                >
                  Contact Support
                </Button>
                <Button
                  variant="outlineInk"
                  fullWidth
                  onClick={() => router.push('/settings/privacy')}
                >
                  Report a User
                </Button>
              </Stack>
            </Card>

            <Card inverted className="p-6">
              <H3 className="mb-4 text-white">Quick Links</H3>
              <Stack gap={2}>
                <Button
                  variant="ghost"
                  fullWidth
                  className="justify-start"
                  onClick={() => router.push('/terms')}
                >
                  Terms of Service
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  className="justify-start"
                  onClick={() => router.push('/privacy')}
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  className="justify-start"
                  onClick={() => router.push('/community')}
                >
                  Community Forums
                </Button>
              </Stack>
            </Card>

            <Card inverted variant="elevated" className="p-6">
              <H3 className="mb-4 text-white">Report Violations</H3>
              <Body size="sm" className="mb-4 text-on-dark-muted">
                See something that violates our guidelines? Let us know.
              </Body>
              <Button
                variant="solid"
                inverted
                fullWidth
                onClick={() => router.push('/settings/privacy')}
              >
                Report Content
              </Button>
            </Card>
          </Stack>
        </Grid>
          </Stack>
    </GvtewayAppLayout>
  );
}
