"use client";

/**
 * New Invoice Page
 * Create a new invoice
 * Uses CreatePage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Button, Card, Input, Textarea, CreatePage, useToast, Box} from "@ghxstship/ui";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const toast = useToast();
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!client.trim()) newErrors.client = "Client is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    const hasValidLineItem = lineItems.some(item => item.description.trim() && item.rate > 0);
    if (!hasValidLineItem) newErrors.lineItems = "At least one line item with description and rate is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createInvoice = useMutation({
    mutationFn: async (data: { client: string; dueDate: string; notes: string; lineItems: LineItem[] }) => {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create invoice");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Invoice Created", "Invoice has been created successfully");
      router.push(`/invoices/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: "", quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const handleChange = (field: string, value: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "client") setClient(value);
    if (field === "dueDate") setDueDate(value);
    if (field === "notes") setNotes(value);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    createInvoice.mutate({ client: client.trim(), dueDate, notes: notes.trim(), lineItems });
  };

  const sections = [
    {
      id: "details",
      title: "Invoice Details",
      content: (
        <Box className="space-y-4">
          <Box>
            <Body size="sm" className="mb-1">Client *</Body>
            <Input placeholder="Select or enter client name" value={client} onChange={(e) => handleChange("client", e.target.value)} error={!!errors.client} />
            {errors.client && <Body size="sm" className="text-error mt-1">{errors.client}</Body>}
          </Box>
          <Box>
            <Body size="sm" className="mb-1">Due Date *</Body>
            <Input type="date" value={dueDate} onChange={(e) => handleChange("dueDate", e.target.value)} error={!!errors.dueDate} />
            {errors.dueDate && <Body size="sm" className="text-error mt-1">{errors.dueDate}</Body>}
          </Box>
          {errors.lineItems && <Body size="sm" className="text-error">{errors.lineItems}</Body>}
        </Box>
      ),
    },
    {
      id: "items",
      title: "Line Items",
      content: (
        <Box className="space-y-4">
          {lineItems.map((item) => (
            <Card key={item.id} className="p-4">
              <Box className="flex gap-4 items-end">
                <Box className="flex-1">
                  <Body size="sm" className="mb-1">Description</Body>
                  <Input placeholder="Item description" value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} />
                </Box>
                <Box className="w-24">
                  <Body size="sm" className="mb-1">Qty</Body>
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)} />
                </Box>
                <Box className="w-32">
                  <Body size="sm" className="mb-1">Rate</Body>
                  <Input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)} />
                </Box>
                <Box className="w-32 text-right">
                  <Body size="sm" className="mb-1">Amount</Body>
                  <Body className="font-weight-bold">${(item.quantity * item.rate).toFixed(2)}</Body>
                </Box>
                <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1}>
                  <Trash2 className="size-4" />
                </Button>
              </Box>
            </Card>
          ))}
          <Button variant="outline" onClick={addLineItem} icon={<Plus className="size-4" />} iconPosition="left">Add Line Item</Button>
          <Card className="p-4 bg-grey-800">
            <Box className="flex justify-between items-center">
              <Body className="font-weight-bold">Total</Body>
              <Body className="font-weight-bold font-weight-bold">${total.toFixed(2)}</Body>
            </Box>
          </Card>
        </Box>
      ),
    },
    {
      id: "notes",
      title: "Notes",
      content: (
        <Box>
          <Body size="sm" className="mb-1">Notes (optional)</Body>
          <Textarea rows={4} placeholder="Additional notes for the client" value={notes} onChange={(e) => handleChange("notes", e.target.value)} />
        </Box>
      ),
    },
  ];

  return (
    <CreatePage
      title="New Invoice"
      subtitle="Create a new invoice"
      breadcrumbs={[
        { label: "Invoices", href: "/invoices" },
        { label: "New Invoice" },
      ]}
      backHref="/invoices"
      backLabel="Back to Invoices"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create Invoice"
      isSubmitting={createInvoice.isPending}
      isValid={!!client && !!dueDate}
    />
  );
}
