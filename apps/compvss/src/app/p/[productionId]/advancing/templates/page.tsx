'use client';

import { useParams, useRouter } from 'next/navigation';
import { SectionHeader, Stack, Button } from '@ghxstship/ui';
import { ArrowLeft } from 'lucide-react';
import { TemplateBrowser } from '@/components/advancing/template-browser';

export default function AdvancingTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params.productionId as string;

  const handleSelectTemplate = (advanceId: string) => {
    router.push(`/p/${productionId}/advancing/${advanceId}`);
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker="Advancing"
          title="Templates"
          description="Browse and use reusable templates for quick advance creation"
          colorScheme="on-light"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/advancing`)}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Advancing
          </Button>
        </Stack>
      </Stack>

      <TemplateBrowser
        onSelectTemplate={handleSelectTemplate}
        projectId={productionId}
      />
    </Stack>
  );
}
