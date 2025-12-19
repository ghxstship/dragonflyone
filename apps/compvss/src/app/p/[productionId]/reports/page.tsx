"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid } from "@ghxstship/ui";
import { FileText, FileCheck, Receipt, Camera, DollarSign, Plus } from "lucide-react";
import { useProject } from "../../../../hooks/useProjects";

export default function ProductionReportsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const { data: production } = useProject(productionId);

  const reportTypes = [
    { id: "daily", name: "Daily Reports", description: "End of day summaries", icon: FileText, href: `/p/${productionId}/reports/daily` },
    { id: "wrap", name: "Wrap Reports", description: "Post-production reports", icon: FileCheck, href: `/p/${productionId}/reports/wrap` },
    { id: "expenses", name: "Expenses", description: "Financial tracking", icon: Receipt, href: `/p/${productionId}/reports/expenses` },
    { id: "photos", name: "Photo Documentation", description: "Visual records", icon: Camera, href: `/p/${productionId}/reports/photos` },
    { id: "settlement", name: "Settlement", description: "Final reconciliation", icon: DollarSign, href: `/p/${productionId}/reports/settlement` },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Reports"
          description="Daily reports, wrap reports, and documentation"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          New Report
        </Button>
      </Stack>

      <Grid cols={3} gap={4}>
        {reportTypes.map((report) => (
          <Card key={report.id} variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(report.href)}>
            <CardBody>
              <Stack gap={4} className="items-center text-center">
                <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                  <report.icon size={24} className="text-primary" />
                </Box>
                <Stack gap={1}>
                  <Body className="font-weight-bold">{report.name}</Body>
                  <Body size="sm" className=" text-grey-500">{report.description}</Body>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
