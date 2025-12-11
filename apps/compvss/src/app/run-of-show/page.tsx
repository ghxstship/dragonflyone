'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  Container,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Spinner,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { useSchedule } from '@/hooks/useSchedule';

import {
  DEMO_CUES,
  type DemoCueItem as CueItem,
} from '../../lib/demo-data';

const mockCues = DEMO_CUES;

export default function RunOfShowPage() {
  const router = useRouter();
  const { data: scheduleData, isLoading } = useSchedule();
  const [cues, setCues] = useState(mockCues);
  const [currentTime] = useState('19:58');

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading run of show..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  // Use live schedule data if available, otherwise use mock
  const displayCues = scheduleData ? cues : mockCues;

  const updateCueStatus = (id: string, status: CueItem['status']) => {
    setCues(cues.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Run of Show"
        subtitle={`Current Time: ${currentTime}`}


        primaryAction={{ label: 'Add Cue', onClick: () => router.push('/run-of-show/cues/new') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Stack gap={4}>
              {displayCues.map(cue => (
                <Card key={cue.id}>
                  <Grid cols={6} gap={4}>
                    <Stack gap={0}>
                      <Body className="font-display">{cue.time}</Body>
                    </Stack>
                    <Stack gap={1} className="col-span-2">
                      <Body className="font-display">{cue.cue}</Body>
                      <Body className="text-body-sm">{cue.department}</Body>
                    </Stack>
                    <Stack gap={0} className="col-span-2">
                      <Body className="text-body-sm">{cue.notes}</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-end">
                      {cue.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCueStatus(cue.id, 'ready')}
                        >
                          Ready
                        </Button>
                      )}
                      {cue.status === 'ready' && (
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={() => updateCueStatus(cue.id, 'complete')}
                        >
                          GO
                        </Button>
                      )}
                      {cue.status === 'complete' && (
                        <Body className="font-display">DONE</Body>
                      )}
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>

            <Stack gap={4} direction="horizontal">
              <Button variant="solid" onClick={() => router.push('/run-of-show/cues/new')}>Add Cue</Button>
              <Button variant="outline" onClick={() => router.push('/run-of-show/export')}>Export</Button>
              <Button variant="outline" onClick={() => window.print()}>Print</Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
