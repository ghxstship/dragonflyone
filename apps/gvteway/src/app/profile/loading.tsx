import { GvtewayAppLayout } from "@/components/app-layout";
import { Stack, Grid, Container, Skeleton } from "@ghxstship/ui";

export default function ProfileLoading() {
  return (
    <GvtewayAppLayout>
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" gap={6} className="items-center">
            <Skeleton className="h-24 w-24 rounded-avatar" />
            <Stack gap={2}>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </Stack>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-card" />
            ))}
          </Grid>

          <Skeleton className="h-96 rounded-card" />
        </Stack>
      </Container>
    </GvtewayAppLayout>
  );
}
