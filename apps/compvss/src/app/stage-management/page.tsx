'use client';

import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  Container,
  Section,
  Body,
  PageLayout,
  SectionHeader,
} from '@ghxstship/ui';

/**
 * Stage Management Page
 * Manages stage configurations, layouts, and technical requirements
 */
export default function StageManagementPage() {
  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <SectionHeader
            kicker="COMPVSS"
            title="Stage Management"
            description="Manage stage configurations, layouts, and technical requirements for productions."
            colorScheme="on-light"
            gap="lg"
          />
          <Body className="mt-8">Coming soon: Stage plot designer, equipment layouts, and technical specifications.</Body>
        </Container>
      </Section>
    </PageLayout>
  );
}