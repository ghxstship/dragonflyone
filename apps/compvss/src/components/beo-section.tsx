"use client";

import { Clock, Users, Utensils, Volume2, Settings, AlertCircle } from "lucide-react";
import {
  Stack,
  Body,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Grid,
} from "@ghxstship/ui";

export interface BEOSectionData {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
}

interface BEOSectionProps {
  section: BEOSectionData;
  variant?: "full" | "compact";
  showHeader?: boolean;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  event_details: <Users className="size-4" />,
  client_info: <Users className="size-4" />,
  venue_info: <Settings className="size-4" />,
  timeline: <Clock className="size-4" />,
  catering: <Utensils className="size-4" />,
  av_requirements: <Volume2 className="size-4" />,
  setup_requirements: <Settings className="size-4" />,
  notes: <AlertCircle className="size-4" />,
};

export function BEOSection({ section, variant = "full", showHeader = true }: BEOSectionProps) {
  const content = section.content as Record<string, unknown>;

  const renderContent = () => {
    switch (section.type) {
      case "event_details":
        return (
          <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
            <DetailItem label="Event Name" value={content.name as string} />
            <DetailItem label="Date" value={content.date as string} />
            <DetailItem label="Time" value={`${content.start_time || ""} - ${content.end_time || ""}`} />
            <DetailItem label="Guest Count" value={content.guest_count?.toString() || "TBD"} />
            <DetailItem label="Event Type" value={content.event_type as string} />
          </Grid>
        );

      case "client_info":
        return (
          <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
            <DetailItem label="Company/Name" value={content.name as string} />
            <DetailItem label="Contact" value={content.contact as string} />
            <DetailItem label="Email" value={content.email as string} />
            <DetailItem label="Phone" value={content.phone as string} />
          </Grid>
        );

      case "venue_info":
        return (
          <Stack gap={4}>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <DetailItem label="Venue" value={content.name as string} />
              <DetailItem label="Address" value={content.address as string} />
            </Grid>
            {Array.isArray(content.spaces) && content.spaces.length > 0 && (
              <Stack gap={2}>
                <Body size="sm" className="text-grey-400 font-weight-medium">Spaces</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {(content.spaces as Array<{ name: string; setup: string }>).map((space, i) => (
                    <Badge key={i} variant="outline">
                      {space.name} ({space.setup})
                    </Badge>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        );

      case "timeline":
        const items = content.items as Array<{ time: string; description: string; department?: string }> || [];
        return items.length > 0 ? (
          <Stack gap={2}>
            {items.map((item, i) => (
              <Stack key={i} direction="horizontal" gap={4} className="items-start py-2 border-b border-ink-800 last:border-0">
                <Body className="text-primary font-mono text-body-sm min-w-[60px]">{item.time}</Body>
                <Body size="sm" className="text-grey-300 flex-1">{item.description}</Body>
                {item.department && (
                  <Badge variant="ghost" className="text-mono-xs">{item.department}</Badge>
                )}
              </Stack>
            ))}
          </Stack>
        ) : (
          <Body size="sm" className="text-grey-500">No timeline items</Body>
        );

      case "catering":
        return (
          <Stack gap={4}>
            {Array.isArray(content.menu_items) && content.menu_items.length > 0 && (
              <Stack gap={2}>
                <Body size="sm" className="text-grey-400 font-weight-medium">Menu Items</Body>
                <Stack gap={1}>
                  {(content.menu_items as string[]).map((item, i) => (
                    <Body key={i} size="sm" className="text-grey-300">- {item}</Body>
                  ))}
                </Stack>
              </Stack>
            )}
            {Array.isArray(content.dietary_requirements) && content.dietary_requirements.length > 0 && (
              <Stack gap={2}>
                <Body size="sm" className="text-grey-400 font-weight-medium">Dietary Requirements</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {(content.dietary_requirements as string[]).map((req, i) => (
                    <Badge key={i} variant="outline" className="text-warning">{req}</Badge>
                  ))}
                </Stack>
              </Stack>
            )}
            {(!content.menu_items || (content.menu_items as string[]).length === 0) && (
              <Body size="sm" className="text-grey-500">No catering details</Body>
            )}
          </Stack>
        );

      case "av_requirements":
      case "setup_requirements":
        const reqItems = content.items as string[] || [];
        return reqItems.length > 0 ? (
          <Stack gap={1}>
            {reqItems.map((item, i) => (
              <Body key={i} size="sm" className="text-grey-300">- {item}</Body>
            ))}
          </Stack>
        ) : (
          <Body size="sm" className="text-grey-500">No requirements listed</Body>
        );

      case "notes":
        return (
          <Body size="sm" className="text-grey-300 whitespace-pre-wrap">
            {(content.text as string) || "No notes"}
          </Body>
        );

      default:
        return (
          <Body size="sm" className="text-grey-500">
            Unknown section type: {section.type}
          </Body>
        );
    }
  };

  if (variant === "compact") {
    return (
      <Stack gap={2}>
        {showHeader && (
          <Stack direction="horizontal" gap={2} className="items-center">
            {SECTION_ICONS[section.type]}
            <Body size="sm" className="font-weight-medium text-grey-300">{section.title}</Body>
          </Stack>
        )}
        {renderContent()}
      </Stack>
    );
  }

  return (
    <Card inverted className="border-2 border-ink-800">
      {showHeader && (
        <CardHeader>
          <Stack direction="horizontal" gap={3} className="items-center">
            {SECTION_ICONS[section.type]}
            <Body className="font-weight-medium text-white">{section.title}</Body>
          </Stack>
        </CardHeader>
      )}
      <CardBody>
        {renderContent()}
      </CardBody>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <Stack gap={1}>
      <Body size="sm" className="text-grey-500">{label}</Body>
      <Body size="sm" className="text-grey-300">{value || "N/A"}</Body>
    </Stack>
  );
}

export default BEOSection;
