'use client';

import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  Body,
} from '@ghxstship/ui';

/**
 * Stage Management Page
 * Manages stage configurations, layouts, and technical requirements
 */
export default function StageManagementPage() {
  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container>
        <H1>Stage Management</H1>
        <Body>Manage stage configurations, layouts, and technical requirements for productions.</Body>
      </Container>
    </Section>
  );
}