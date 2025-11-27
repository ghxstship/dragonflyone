import { Badge, H3, Body, Label, ProgressBar, Card, Stack, Link, Article } from "@ghxstship/ui";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    client: string;
    status: string;
    progress: number;
    health: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Article variant="bordered" className="p-spacing-6 transition-colors hover:border-white">
        <Stack direction="horizontal" className="items-start justify-between">
          <Stack>
            <H3 className="text-white">{project.name}</H3>
            <Body className="mt-spacing-1 text-body-sm text-ink-400">{project.client}</Body>
          </Stack>
          <Badge
            variant={project.health === "On Track" ? "solid" : "outline"}
          >
            {project.health}
          </Badge>
        </Stack>
        <Stack className="mt-spacing-4">
          <ProgressBar value={project.progress} variant="inverse" />
        </Stack>
        <Label className="mt-spacing-2 text-mono-xs text-ink-500">{project.progress}% complete</Label>
      </Article>
    </Link>
  );
}
