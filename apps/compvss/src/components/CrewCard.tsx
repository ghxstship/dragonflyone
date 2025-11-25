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
          <Label className="font-mono text-xs uppercase tracking-wider text-ink-500">{member.id}</Label>
          <H3 className="mt-1 font-display text-2xl text-white">{member.name}</H3>
          <Body className="mt-1 text-sm text-ink-300">{member.role}</Body>
        </Stack>
        <Stack className="text-right">
          <Stack direction="horizontal" className="items-center gap-1">
            <Body className="font-display text-2xl text-white">{member.rating}</Body>
            <Body className="text-ink-500">★</Body>
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="horizontal" className="mt-4 items-center justify-between">
        <Body className="text-sm text-ink-500">{member.department}</Body>
        <Badge variant={member.availability === "Available" ? "solid" : "outline"}>
          {member.availability}
        </Badge>
      </Stack>
    </Article>
  );
}
