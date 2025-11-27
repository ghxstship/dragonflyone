'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  LoadingSpinner,
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
      <Section className="min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading run of show..." />
        </Container>
      </Section>
    );
  }

  // Use live schedule data if available, otherwise use mock
  const displayCues = scheduleData ? cues : mockCues;

  const updateCueStatus = (id: string, status: CueItem['status']) => {
    setCues(cues.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <Section className="min-h-screen bg-black text-white">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b border-ink-800 pb-8">
            <H1>Run of Show</H1>
            <Body className="text-ink-400">Current Time: {currentTime}</Body>
          </Stack>

          <Stack gap={4}>
            {displayCues.map(cue => (
              <Card
                key={cue.id}
                className={`p-6 ${
                  cue.status === 'complete' ? 'bg-ink-800 opacity-60' :
                  cue.status === 'ready' ? 'bg-ink-900 border-l-4 border-white' :
                  'bg-ink-900'
                }`}
              >
                <Grid cols={6} gap={4}>
                  <Stack gap={0}>
                    <Body className="text-white font-bold text-h5-md">{cue.time}</Body>
                  </Stack>
                  <Stack gap={1} className="col-span-2">
                    <Body className="text-white font-bold">{cue.cue}</Body>
                    <Body className="text-ink-400 text-body-sm">{cue.department}</Body>
                  </Stack>
                  <Stack gap={0} className="col-span-2">
                    <Body className="text-ink-300 text-body-sm">{cue.notes}</Body>
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
                      <Body className="text-white font-bold">DONE</Body>
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
    </Section>
  );
}
