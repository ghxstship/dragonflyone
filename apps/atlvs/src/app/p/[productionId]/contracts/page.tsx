"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { FileCheck, Plus, Upload } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionContractsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const contracts = [
    { id: "1", name: "Venue Rental Agreement", party: "Central Park Events", value: 40000, status: "signed" },
    { id: "2", name: "Headliner Performance", party: "Artist Management LLC", value: 50000, status: "signed" },
    { id: "3", name: "Audio Equipment Rental", party: "Pro Audio Inc", value: 5000, status: "pending" },
    { id: "4", name: "Security Services", party: "SecureEvent Co", value: 8000, status: "draft" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    signed: "success", pending: "warning", draft: "solid", expired: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Contracts"
          description="Manage agreements and legal documents"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            New Contract
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Upload
          </Button>
        </Stack>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {contracts.map((contract, index) => (
              <div key={contract.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < contracts.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <FileCheck size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{contract.name}</Body>
                    <Body size="sm" className=" text-on-dark-muted">{contract.party} · ${contract.value.toLocaleString()}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[contract.status]}>{contract.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
