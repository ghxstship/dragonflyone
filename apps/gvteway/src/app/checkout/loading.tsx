// Layout provided by route group
import { Stack, Grid, Container, Skeleton } from "@ghxstship/ui";

export default function CheckoutLoading() {
  return (
    <>
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={4}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-80" />
          </Stack>

          <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
            <Stack gap={4}>
              <Skeleton className="h-64 rounded-card" />
              <Skeleton className="h-48 rounded-card" />
            </Stack>
            <Skeleton className="h-96 rounded-card" />
          </Grid>
        </Stack>
      </Container>
    </>
  );
}
