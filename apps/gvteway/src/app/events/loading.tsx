import { GvtewayAppLayout } from "@/components/app-layout";
import { Stack, Grid, Container, Skeleton } from "@ghxstship/ui";

export default function EventsLoading() {
  return (
    <GvtewayAppLayout>
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

          <Grid cols={3} gap={6}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 rounded-card" />
            ))}
          </Grid>
        </Stack>
      </Container>
    </GvtewayAppLayout>
  );
}
