import { CompvssAppLayout } from "@/components/app-layout";
import { Stack, Grid, Container, Skeleton } from "@ghxstship/ui";

export default function CrewLoading() {
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
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </Stack>

          <Grid cols={4} gap={6}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-48 rounded-card" />
            ))}
          </Grid>
        </Stack>
      </Container>
    </CompvssAppLayout>
  );
}
