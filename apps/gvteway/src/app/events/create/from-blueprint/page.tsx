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
  Input,
} from '@ghxstship/ui';
import {
  Sparkles,
  Palette,
  Music,
  Utensils,
  Eye,
  Hand,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';

import {
  DEMO_BLUEPRINTS,
  type DemoBlueprint as Blueprint,
} from '@/lib/demo-data';

const mockBlueprints = DEMO_BLUEPRINTS;

export default function CreateFromBlueprintPage() {
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [step, setStep] = useState<'select' | 'customize' | 'review'>('select');
  const [eventDetails, setEventDetails] = useState({
    name: '',
    startDate: '',
    endDate: '',
    venue: '',
    capacity: '',
    ticketPrice: '',
  });

  const handleSelectBlueprint = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setEventDetails((prev) => ({
      ...prev,
      name: blueprint.name,
    }));
    setStep('customize');
  };

  const handleCreateEvent = () => {
    // In production, this would call the API
    alert('Event created successfully! Redirecting to event dashboard...');
  };

  return (
    <GvtewayAppLayout variant="creator-auth">
      <Stack gap={8}>
        <SectionHeader
          kicker="Events"
          title="Create from Blueprint"
          description="Convert an Experience Generator blueprint into a live event"
          colorScheme="on-dark"
        />

        {/* Progress Steps */}
        <Card inverted>
          <CardBody>
            <Stack direction="horizontal" className="items-center justify-center" gap={4}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Stack
                  className={`flex size-8 items-center justify-center rounded-full border-2 ${
                    step === 'select' ? 'border-primary bg-ink-800 text-white' : 'border-ink-600 text-on-dark-muted'
                  }`}
                >
                  {step !== 'select' ? <Check size={16} /> : '1'}
                </Stack>
                <Body className={step === 'select' ? 'text-white' : 'text-on-dark-muted'}>
                  Select Blueprint
                </Body>
              </Stack>
              <ChevronRight size={20} className="text-on-dark-muted" />
              <Stack direction="horizontal" gap={2} className="items-center">
                <Stack
                  className={`flex size-8 items-center justify-center rounded-full border-2 ${
                    step === 'customize' ? 'border-primary bg-ink-800 text-white' : 'border-ink-600 text-on-dark-muted'
                  }`}
                >
                  {step === 'review' ? <Check size={16} /> : '2'}
                </Stack>
                <Body className={step === 'customize' ? 'text-white' : 'text-on-dark-muted'}>
                  Customize Event
                </Body>
              </Stack>
              <ChevronRight size={20} className="text-on-dark-muted" />
              <Stack direction="horizontal" gap={2} className="items-center">
                <Stack
                  className={`flex size-8 items-center justify-center rounded-full border-2 ${
                    step === 'review' ? 'border-primary bg-ink-800 text-white' : 'border-ink-600 text-on-dark-muted'
                  }`}
                >
                  3
                </Stack>
                <Body className={step === 'review' ? 'text-white' : 'text-on-dark-muted'}>
                  Review & Create
                </Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        {/* Step 1: Select Blueprint */}
        {step === 'select' && (
          <Stack gap={4}>
            <H3 className="text-white">Select a Blueprint</H3>
            <Grid cols={2} gap={4}>
              {mockBlueprints.map((blueprint) => (
                <Card
                  key={blueprint.id}
                  className="cursor-pointer border-2 border-ink-700 transition-colors hover:border-primary"
                  onClick={() => handleSelectBlueprint(blueprint)}
                >
                  <CardBody>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Sparkles size={20} className="text-primary" />
                            <H3 className="text-white">{blueprint.name}</H3>
                          </Stack>
                          <Badge variant="info">{blueprint.experienceType}</Badge>
                        </Stack>
                      </Stack>

                      <Body className="text-on-dark-muted">{blueprint.description}</Body>

                      {/* XYZ Foundation Preview */}
                      <Stack gap={2}>
                        <Body className="text-body-sm text-white">XYZ Foundation</Body>
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2} className="items-start">
                            <Badge variant="success">X</Badge>
                            <Body className="line-clamp-1 text-body-sm text-on-dark-muted">
                              {blueprint.foundation.x}
                            </Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="items-start">
                            <Badge variant="warning">Y</Badge>
                            <Body className="line-clamp-1 text-body-sm text-on-dark-muted">
                              {blueprint.foundation.y}
                            </Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="items-start">
                            <Badge variant="info">Z</Badge>
                            <Body className="line-clamp-1 text-body-sm text-on-dark-muted">
                              {blueprint.foundation.z}
                            </Body>
                          </Stack>
                        </Stack>
                      </Stack>

                      {/* 5 Senses Preview */}
                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Eye size={14} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Sight</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Music size={14} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Sound</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Utensils size={14} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Taste</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Hand size={14} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Touch</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Palette size={14} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Smell</Body>
                        </Stack>
                      </Stack>

                      <Button variant="outline" size="sm" className="w-full">
                        <ArrowRight size={14} className="mr-1" />
                        Use This Blueprint
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        {/* Step 2: Customize Event */}
        {step === 'customize' && selectedBlueprint && (
          <Stack gap={4}>
            <Stack direction="horizontal" className="items-center justify-between">
              <H3 className="text-white">Customize Event Details</H3>
              <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
                Change Blueprint
              </Button>
            </Stack>

            <Grid cols={2} gap={6}>
              <Card inverted>
                <CardBody>
                  <Stack gap={4}>
                    <H3 className="text-white">Event Information</H3>

                    <Stack gap={2}>
                      <Body className="text-body-sm text-on-dark-muted">Event Name</Body>
                      <Input
                        id="name"
                        value={eventDetails.name}
                        onChange={(e) => setEventDetails((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter event name"
                      />
                    </Stack>

                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Body className="text-body-sm text-on-dark-muted">Start Date</Body>
                        <Input
                          id="startDate"
                          type="date"
                          value={eventDetails.startDate}
                          onChange={(e) => setEventDetails((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Body className="text-body-sm text-on-dark-muted">End Date</Body>
                        <Input
                          id="endDate"
                          type="date"
                          value={eventDetails.endDate}
                          onChange={(e) => setEventDetails((prev) => ({ ...prev, endDate: e.target.value }))}
                        />
                      </Stack>
                    </Grid>

                    <Stack gap={2}>
                      <Body className="text-body-sm text-on-dark-muted">Venue</Body>
                      <Input
                        id="venue"
                        value={eventDetails.venue}
                        onChange={(e) => setEventDetails((prev) => ({ ...prev, venue: e.target.value }))}
                        placeholder="Enter venue name or address"
                      />
                    </Stack>

                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Body className="text-body-sm text-on-dark-muted">Capacity</Body>
                        <Input
                          id="capacity"
                          type="number"
                          value={eventDetails.capacity}
                          onChange={(e) => setEventDetails((prev) => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Max attendees"
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Body className="text-body-sm text-on-dark-muted">Base Ticket Price</Body>
                        <Input
                          id="ticketPrice"
                          type="number"
                          value={eventDetails.ticketPrice}
                          onChange={(e) => setEventDetails((prev) => ({ ...prev, ticketPrice: e.target.value }))}
                          placeholder="$0.00"
                        />
                      </Stack>
                    </Grid>
                  </Stack>
                </CardBody>
              </Card>

              <Card inverted>
                <CardBody>
                  <Stack gap={4}>
                    <H3 className="text-white">Blueprint Summary</H3>

                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Experience Type</Body>
                        <Badge variant="info">{selectedBlueprint.experienceType}</Badge>
                      </Stack>

                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Journey Phases</Body>
                        <Stack direction="horizontal" gap={1} className="flex-wrap">
                          {selectedBlueprint.journeyPhases.map((phase, index) => (
                            <Badge key={index} variant="success">
                              {phase}
                            </Badge>
                          ))}
                        </Stack>
                      </Stack>

                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Experiential (X)</Body>
                        <Body className="text-white">{selectedBlueprint.foundation.x}</Body>
                      </Stack>

                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Emotional (Y)</Body>
                        <Body className="text-white">{selectedBlueprint.foundation.y}</Body>
                      </Stack>

                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Transformational (Z)</Body>
                        <Body className="text-white">{selectedBlueprint.foundation.z}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            </Grid>

            <Stack direction="horizontal" className="justify-end" gap={2}>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button variant="solid" onClick={() => setStep('review')}>
                Continue to Review
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Step 3: Review & Create */}
        {step === 'review' && selectedBlueprint && (
          <Stack gap={4}>
            <H3 className="text-white">Review & Create Event</H3>

            <Grid cols={2} gap={6}>
              <Card inverted>
                <CardBody>
                  <Stack gap={4}>
                    <H3 className="text-white">Event Details</H3>

                    <Stack gap={3}>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="text-on-dark-muted">Event Name</Body>
                        <Body className="text-white">{eventDetails.name || 'Not set'}</Body>
                      </Stack>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="text-on-dark-muted">Dates</Body>
                        <Body className="text-white">
                          {eventDetails.startDate && eventDetails.endDate
                            ? `${eventDetails.startDate} - ${eventDetails.endDate}`
                            : 'Not set'}
                        </Body>
                      </Stack>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="text-on-dark-muted">Venue</Body>
                        <Body className="text-white">{eventDetails.venue || 'Not set'}</Body>
                      </Stack>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="text-on-dark-muted">Capacity</Body>
                        <Body className="text-white">{eventDetails.capacity || 'Not set'}</Body>
                      </Stack>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="text-on-dark-muted">Base Ticket Price</Body>
                        <Body className="text-white">
                          {eventDetails.ticketPrice ? `$${eventDetails.ticketPrice}` : 'Not set'}
                        </Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>

              <Card inverted>
                <CardBody>
                  <Stack gap={4}>
                    <H3 className="text-white">What Will Be Created</H3>

                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Check size={16} className="text-success" />
                        <Body className="text-white">Event record in GVTEWAY</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Check size={16} className="text-success" />
                        <Body className="text-white">Production record in ATLVS</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Check size={16} className="text-success" />
                        <Body className="text-white">Crew workspace in COMPVSS</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Check size={16} className="text-success" />
                        <Body className="text-white">XYZ foundation data</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Check size={16} className="text-success" />
                        <Body className="text-white">5 senses experience design</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Check size={16} className="text-success" />
                        <Body className="text-white">Journey phase structure</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            </Grid>

            <Stack direction="horizontal" className="justify-end" gap={2}>
              <Button variant="outline" onClick={() => setStep('customize')}>
                Back
              </Button>
              <Button variant="solid" onClick={handleCreateEvent}>
                <Sparkles size={14} className="mr-1" />
                Create Event
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </GvtewayAppLayout>
  );
}
