'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Layout provided by route group
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
  useCues,
  useUpdateCueStatus,
  type CueItem,
} from '../../hooks/useRunOfShow';

export default function RunOfShowPage() {
  const router = useRouter();
  const { data: scheduleData, isLoading } = useSchedule();
  const { data: cues = [] } = useCues();
  const updateCueStatusMutation = useUpdateCueStatus();
  const [currentTime] = useState('19:58');

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading run of show..." />
          </Container>
        </MainContent>
      </>
    );
  }

  // Use live schedule data if available, show cues when schedule is loaded
  const displayCues = scheduleData ? cues : cues;

  const updateCueStatus = (id: string, status: CueItem['status']) => {
    updateCueStatusMutation.mutate({ id, status });
  };

  return (
    <>
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
                  <Grid cols={6} gap={4} className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    <Stack gap={0}>
                      <Body className="font-display">{cue.time}</Body>
                    </Stack>
                    <Stack gap={1} className="col-span-2">
                      <Body className="font-display">{cue.cue}</Body>
                      <Body size="sm" className="">{cue.department}</Body>
                    </Stack>
                    <Stack gap={0} className="col-span-2">
                      <Body size="sm" className="">{cue.notes}</Body>
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
    </>
  );
}
