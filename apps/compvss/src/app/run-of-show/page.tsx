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
  LoadingSpinner,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { useSchedule } from '@/hooks/useSchedule';

interface CueItem {
  id: string;
  time: string;
  cue: string;
  department: string;
  notes: string;
  status: 'pending' | 'ready' | 'complete';
}

const mockCues: CueItem[] = [
  { id: '1', time: '19:00', cue: 'Doors Open', department: 'FOH', notes: 'Begin guest entry', status: 'complete' },
  { id: '2', time: '19:45', cue: 'House Lights to Half', department: 'Lighting', notes: '15 min warning', status: 'complete' },
  { id: '3', time: '20:00', cue: 'Show Start - Intro Video', department: 'Video', notes: 'Q1 - Roll intro', status: 'ready' },
  { id: '4', time: '20:02', cue: 'Artist Walk On', department: 'Stage', notes: 'SR entrance', status: 'ready' },
  { id: '5', time: '20:03', cue: 'Song 1 - Opening Number', department: 'Sound', notes: 'Playback + Live', status: 'pending' },
  { id: '6', time: '20:08', cue: 'Lighting Look 2', department: 'Lighting', notes: 'Q12 - Blue wash', status: 'pending' },
];

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
            <LoadingSpinner size="lg" text="Loading run of show..." />
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
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Run of Show' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
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
