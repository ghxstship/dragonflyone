"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Receipt, Plus, Filter } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionExpensesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const expenses = [
    { id: "1", description: "Audio Equipment Rental", amount: 5000, category: "Production", date: "2025-06-10", status: "approved" },
    { id: "2", description: "Catering Deposit", amount: 2500, category: "Catering", date: "2025-06-08", status: "approved" },
    { id: "3", description: "Security Services", amount: 3000, category: "Security", date: "2025-06-12", status: "pending" },
    { id: "4", description: "Stage Lighting", amount: 4500, category: "Production", date: "2025-06-11", status: "approved" },
    { id: "5", description: "Marketing Materials", amount: 1200, category: "Marketing", date: "2025-06-09", status: "pending" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    approved: "success", pending: "warning", rejected: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Expenses"
          description="Track and manage production expenses"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Submit Expense
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </Stack>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {expenses.map((expense, index) => (
              <div key={expense.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < expenses.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Receipt size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{expense.description}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{expense.category} · {expense.date}</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Body className="font-weight-bold text-white">${expense.amount.toLocaleString()}</Body>
                  <Badge variant={statusColors[expense.status]}>{expense.status.toUpperCase()}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
