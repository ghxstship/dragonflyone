"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3 } from "@ghxstship/ui";
import { AlertTriangle, Phone, MapPin, Shield } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function EmergencyPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Emergency" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Emergency Info" description="Safety information and emergency contacts" colorScheme="on-dark" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Phone size={20} className="text-error" />
                <Body className="font-weight-bold text-white">Emergency: 911</Body>
              </Stack>
              <Body className="text-on-dark-muted">For life-threatening emergencies</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Shield size={20} className="text-primary" />
                <Body className="font-weight-bold text-white">Event Security</Body>
              </Stack>
              <Body className="text-on-dark-muted">Contact security staff for assistance</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <AlertTriangle size={20} className="text-warning" />
                <Body className="font-weight-bold text-white">First Aid</Body>
              </Stack>
              <Body className="text-on-dark-muted">Medical stations located near main entrance</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <MapPin size={20} className="text-secondary" />
                <Body className="font-weight-bold text-white">Meeting Point</Body>
              </Stack>
              <Body className="text-on-dark-muted">Emergency assembly area at main gate</Body>
            </Stack>
          </CardBody>
        </Card>
      </div>
    </Stack>
  );
}
