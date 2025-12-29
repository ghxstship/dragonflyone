"use client";

/**
 * GVTEWAY Wallet Page
 * Manage payment methods and view transaction history
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  History,
} from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useNotifications,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { useWalletData, type PaymentMethod, type Transaction } from "@/hooks/useWalletData";

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
};

export default function WalletPage() {
  const { addNotification } = useNotifications();
  const {
    paymentMethods,
    transactions,
    totalSpent,
    totalRefunds,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    isUpdating,
    refetchPaymentMethods,
  } = useWalletData();

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddCard = async () => {
    if (!newCard.name || !newCard.cardNumber || !newCard.expiry || !newCard.cvv) {
      addNotification({ type: "error", title: "Error", message: "Please fill in all fields" });
      return;
    }
    try {
      await addPaymentMethod(newCard);
      addNotification({ type: "success", title: "Success", message: "Payment method added" });
      setShowAddCard(false);
      setNewCard({ name: "", cardNumber: "", expiry: "", cvv: "" });
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to add payment method" });
    }
  };

  const handleRemoveCard = async (id: string) => {
    try {
      await removePaymentMethod(id);
      addNotification({ type: "success", title: "Removed", message: "Payment method removed" });
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to remove payment method" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      addNotification({ type: "success", title: "Updated", message: "Default payment method updated" });
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to update default" });
    }
  };

  const headerActions = (
    <Button
      variant="outline"
      icon={<Plus className="size-4" />}
      iconPosition="left"
      onClick={() => setShowAddCard(!showAddCard)}
    >
      Add Card
    </Button>
  );

  const tabs = [
    {
      id: "payment-methods",
      label: "Payment Methods",
      icon: <CreditCard className="size-4" />,
      content: (
        <>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Payment Methods" value={paymentMethods.length.toString()} />
            <StatCard label="Total Spent" value={formatCurrency(totalSpent)} />
            <StatCard label="Total Refunds" value={formatCurrency(totalRefunds)} />
          </Grid>

          {showAddCard && (
            <Section border className="mb-6">
              <SectionHeader title="Add New Card" />
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mb-4">
                <div className="space-y-2">
                  <Body size="sm" className="text-grey-400">Cardholder Name</Body>
                  <Input
                    id="cardName"
                    placeholder="John Smith"
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Body size="sm" className="text-grey-400">Card Number</Body>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Body size="sm" className="text-grey-400">Expiry Date</Body>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Body size="sm" className="text-grey-400">CVV</Body>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  />
                </div>
              </Grid>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowAddCard(false)}>
                  Cancel
                </Button>
                <Button variant="solid" onClick={handleAddCard} disabled={isUpdating}>
                  Add Card
                </Button>
              </div>
            </Section>
          )}

          <Section>
            <SectionHeader title="Your Cards" description="Manage your saved payment methods" />
            {paymentMethods.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="size-12 text-grey-600 mx-auto mb-4" />
                <Body className="font-weight-medium text-white mb-2">No Payment Methods</Body>
                <Body className="text-grey-400 mb-4">Add a payment method to make purchases</Body>
                <Button variant="solid" onClick={() => setShowAddCard(true)}>
                  Add Card
                </Button>
              </div>
            ) : (
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                {paymentMethods.map((method: PaymentMethod) => (
                  <Card key={method.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="size-8 text-grey-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Body className="font-weight-medium text-white capitalize">{method.type}</Body>
                            {method.isDefault && (
                              <Badge variant="success">
                                <Star className="size-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <Body size="sm" className="text-grey-400">
                            **** {method.last4} | Expires {method.expiry}
                          </Body>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                            disabled={isUpdating}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCard(method.id)}
                          disabled={isUpdating}
                          icon={<Trash2 className="size-4 text-error" />}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </Grid>
            )}
          </Section>
        </>
      ),
    },
    {
      id: "transactions",
      label: "Transaction History",
      icon: <History className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Transaction History" description="View your past transactions" />
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium text-white mb-2">No Transactions</Body>
              <Body className="text-grey-400">Your transaction history will appear here</Body>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: Transaction) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Body size="sm">{formatDate(tx.date)}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="font-weight-medium">{tx.description}</Body>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "refund" ? "info" : "outline"}>
                          {tx.type === "purchase" && <ArrowUpRight className="size-3" />}
                          {tx.type === "refund" && <ArrowDownLeft className="size-3" />}
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[tx.status] || "outline"}>
                          {tx.status === "completed" && <CheckCircle className="size-3" />}
                          {tx.status === "pending" && <Clock className="size-3" />}
                          {tx.status === "failed" && <XCircle className="size-3" />}
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Body size="sm" className={tx.type === "refund" ? "text-success" : ""}>
                          {tx.type === "refund" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </Body>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Account",
        title: "Wallet",
        description: "Manage payment methods and view transactions",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetchPaymentMethods}
      tabs={tabs}
      actions={headerActions}
      backButton={{
        label: "Account",
        href: "/account",
      }}
    />
  );
}
