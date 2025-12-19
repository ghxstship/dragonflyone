'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Textarea,
} from '@ghxstship/ui';
import {
  FileText,
  Music,
  Speaker,
  Lightbulb,
  Save,
  Upload,
  CheckCircle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

interface RiderSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  status: 'approved' | 'pending' | 'needs_update';
  lastUpdated: string;
}

export default function MyRiderPage() {
  const [riderSections, setRiderSections] = useState<RiderSection[]>([
    {
      id: 'technical',
      title: 'Technical Rider',
      icon: <Speaker size={20} />,
      content: `AUDIO REQUIREMENTS:
- FOH Console: Yamaha CL5 or equivalent
- Monitor Console: Yamaha PM5D or equivalent
- Main PA: L-Acoustics K1/K2 or equivalent
- Monitors: 8x wedges, 4x side fills
- IEM: 6x wireless IEM systems

STAGE REQUIREMENTS:
- Minimum stage size: 40ft x 30ft
- Drum riser: 8ft x 8ft x 2ft
- Keyboard riser: 8ft x 4ft x 1ft`,
      status: 'approved',
      lastUpdated: '2024-11-01',
    },
    {
      id: 'backline',
      title: 'Backline Requirements',
      icon: <Music size={20} />,
      content: `DRUMS:
- DW Collector's Series or equivalent
- Cymbals: Zildjian A Custom

BASS:
- Ampeg SVT Classic head
- Ampeg 8x10 cabinet

KEYBOARDS:
- Nord Stage 3 88
- Hammond B3 with Leslie

GUITARS:
- 2x Fender Twin Reverb
- 1x Marshall JCM800`,
      status: 'approved',
      lastUpdated: '2024-10-15',
    },
    {
      id: 'lighting',
      title: 'Lighting Requirements',
      icon: <Lightbulb size={20} />,
      content: `LIGHTING:
- Full front wash in warm white
- Side lighting for depth
- Back lighting with color options
- Haze machine required
- Follow spot for lead vocalist

PREFERENCES:
- No strobe effects
- Warm color palette preferred
- Smooth transitions between songs`,
      status: 'pending',
      lastUpdated: '2024-12-01',
    },
  ]);

  const handleContentChange = (id: string, newContent: string) => {
    setRiderSections(prev =>
      prev.map(section =>
        section.id === id
          ? { ...section, content: newContent, status: 'needs_update' as const }
          : section
      )
    );
  };

  const handleSave = (id: string) => {
    setRiderSections(prev =>
      prev.map(section =>
        section.id === id
          ? { ...section, status: 'pending' as const, lastUpdated: new Date().toISOString().split('T')[0] }
          : section
      )
    );
  };

  const getStatusBadge = (status: RiderSection['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'needs_update':
        return <Badge variant="info">Unsaved Changes</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Artist Portal"
          title="My Rider"
          description="Manage your technical, backline, and lighting requirements"
          colorScheme="on-dark"
        />

        <Stack gap={6}>
          {riderSections.map(section => (
            <Card key={section.id} inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Stack className="flex size-10 items-center justify-center rounded-card bg-ink-800">
                        {section.icon}
                      </Stack>
                      <Stack gap={0}>
                        <H3 className="text-white">{section.title}</H3>
                        <Body size="sm" className=" text-on-dark-muted">
                          Last updated: {new Date(section.lastUpdated).toLocaleDateString()}
                        </Body>
                      </Stack>
                    </Stack>
                    {getStatusBadge(section.status)}
                  </Stack>

                  <Textarea
                    value={section.content}
                    onChange={(e) => handleContentChange(section.id, e.target.value)}
                    rows={12}
                    className="font-mono"
                  />

                  <Stack direction="horizontal" gap={2}>
                    <Button
                      variant="solid"
                      onClick={() => handleSave(section.id)}
                      disabled={section.status === 'approved'}
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline">
                      <Upload size={16} className="mr-2" />
                      Upload PDF
                    </Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Rider Documents</H3>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                <Stack
                  direction="horizontal"
                  className="items-center justify-between rounded-card border-2 border-ink-700 p-4"
                >
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <FileText size={20} className="text-primary" />
                    <Stack gap={0}>
                      <Body className="text-white">Technical_Rider_2024.pdf</Body>
                      <Body size="sm" className=" text-on-dark-muted">Uploaded Nov 1, 2024</Body>
                    </Stack>
                  </Stack>
                  <CheckCircle size={16} className="text-success" />
                </Stack>
                <Stack
                  direction="horizontal"
                  className="items-center justify-between rounded-card border-2 border-ink-700 p-4"
                >
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <FileText size={20} className="text-primary" />
                    <Stack gap={0}>
                      <Body className="text-white">Stage_Plot.pdf</Body>
                      <Body size="sm" className=" text-on-dark-muted">Uploaded Oct 15, 2024</Body>
                    </Stack>
                  </Stack>
                  <CheckCircle size={16} className="text-success" />
                </Stack>
                <Stack
                  direction="horizontal"
                  className="items-center justify-between rounded-card border-2 border-ink-700 p-4"
                >
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <FileText size={20} className="text-primary" />
                    <Stack gap={0}>
                      <Body className="text-white">Input_List.pdf</Body>
                      <Body size="sm" className=" text-on-dark-muted">Uploaded Oct 15, 2024</Body>
                    </Stack>
                  </Stack>
                  <CheckCircle size={16} className="text-success" />
                </Stack>
              </Grid>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
