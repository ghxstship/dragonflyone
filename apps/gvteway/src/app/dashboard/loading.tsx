import { GvtewayAppLayout } from "@/components/app-layout";
import { Stack, Grid, Container, Skeleton } from "@ghxstship/ui";

export default function DashboardLoading() {
  return (
    <GvtewayAppLayout>
      <Container className="py-8">
        <Stack gap={8}>
          {/* Header skeleton */}
          <Stack gap={4}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </Stack>

          {/* Stats grid skeleton */}
          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-card" />
            ))}
          </Grid>

          {/* Content skeleton */}
          <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-card" />
            <Skeleton className="h-64 rounded-card" />
          </Grid>

          {/* Table skeleton */}
          <Skeleton className="h-96 rounded-card" />
        </Stack>
      </Container>
    </GvtewayAppLayout>
  );
}
