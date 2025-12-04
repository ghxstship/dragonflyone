"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { FileText, Plus } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionInvoicesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const invoices = [
    { id: "INV-001", vendor: "Audio Rentals Inc", amount: 5000, dueDate: "2025-06-20", status: "pending" },
    { id: "INV-002", vendor: "Lighting Solutions", amount: 4500, dueDate: "2025-06-18", status: "paid" },
    { id: "INV-003", vendor: "Catering Co", amount: 2500, dueDate: "2025-06-25", status: "pending" },
    { id: "INV-004", vendor: "Security Services", amount: 3000, dueDate: "2025-06-22", status: "overdue" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    paid: "success", pending: "warning", overdue: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Invoices"
          description="Manage vendor invoices and payments"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {invoices.map((invoice, index) => (
              <div key={invoice.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < invoices.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <FileText size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{invoice.id}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{invoice.vendor} · Due {invoice.dueDate}</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Body className="font-weight-bold text-white">${invoice.amount.toLocaleString()}</Body>
                  <Badge variant={statusColors[invoice.status]}>{invoice.status.toUpperCase()}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
