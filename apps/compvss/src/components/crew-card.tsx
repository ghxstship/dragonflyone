import { Badge, H3, Body, Label, Stack, Article } from "@ghxstship/ui";

interface CrewCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    department: string;
    availability: string;
    rating: number;
  };
}

export function CrewCard({ member }: CrewCardProps) {
  return (
    <Article variant="bordered" className="p-6">
      <Stack direction="horizontal" className="items-start justify-between">
        <Stack>
          <Label className="font-mono text-mono-xs uppercase tracking-label text-on-light-muted">{member.id}</Label>
          <H3 className="mt-1 font-display text-h5-md text-white">{member.name}</H3>
          <Body className="mt-1 text-on-dark-secondary">{member.role}</Body>
        </Stack>
        <Stack className="text-right">
          <Stack direction="horizontal" className="items-center gap-1">
            <Body className="font-display text-h5-md text-white">{member.rating}</Body>
            <Body className="text-on-light-muted">★</Body>
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="horizontal" className="mt-4 items-center justify-between">
        <Body size="sm" className="text-on-light-muted">{member.department}</Body>
        <Badge variant={member.availability === "Available" ? "solid" : "outline"}>
          {member.availability}
        </Badge>
      </Stack>
    </Article>
  );
}
