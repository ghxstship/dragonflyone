'use client';

import { CompvssAppLayout } from '../../components/app-layout';
import {
  Container,
  Body,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

/**
 * Stage Management Page
 * Manages stage configurations, layouts, and technical requirements
 */
export default function StageManagementPage() {
  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Stage Management"
        subtitle="Manage stage configurations, layouts, and technical requirements for productions."
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Stage Management' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Body className="mt-8">Coming soon: Stage plot designer, equipment layouts, and technical specifications.</Body>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}