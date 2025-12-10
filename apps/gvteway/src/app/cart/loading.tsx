import { GvtewayAppLayout } from "@/components/app-layout";
import { Stack, Grid, Container, Skeleton } from "@ghxstship/ui";

export default function CartLoading() {
  return (
    <GvtewayAppLayout>
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={4}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-80" />
          </Stack>

          <Grid cols={3} gap={6}>
            <Stack gap={4} className="col-span-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-card" />
              ))}
            </Stack>
            <Skeleton className="h-64 rounded-card" />
          </Grid>
        </Stack>
      </Container>
    </GvtewayAppLayout>
  );
}
