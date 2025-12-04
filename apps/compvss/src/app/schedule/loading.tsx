import { CompvssAppLayout } from "@/components/app-layout";
import { Stack, Container, Skeleton } from "@ghxstship/ui";

export default function ScheduleLoading() {
  return (
    <CompvssAppLayout>
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={4}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-80" />
          </Stack>

          <Stack direction="horizontal" gap={4}>
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </Stack>

          <Skeleton className="h-96 rounded-card" />
        </Stack>
      </Container>
    </CompvssAppLayout>
  );
}
