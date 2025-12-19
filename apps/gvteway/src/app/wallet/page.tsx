"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Button,
  Input,
  Badge,
  Card,
  StatCard,
  Stack,
  Grid,
  Kicker,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from "@ghxstship/ui";
import { CreditCard, Plus, Trash2, Star, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useWalletData } from "@/hooks/useWalletData";

export default function WalletPage() {
  const router = useRouter();
  const [showAddCard, setShowAddCard] = useState(false);
  const {
    paymentMethods,
    transactions,
    totalSpent,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    isUpdating,
  } = useWalletData();

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading wallet..." />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <EmptyState
          title="Error Loading Wallet"
          description="Unable to load your wallet data. Please try again."
          action={{ label: "Retry", onClick: () => window.location.reload() }}
          inverted
        />
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Payments</Kicker>
              <H2 size="lg" className="text-white">Wallet & Payment Methods</H2>
              <Body className="text-on-dark-muted">Manage your payment methods and view transaction history</Body>
            </Stack>

            {/* Stats */}
            <Grid cols={3} gap={6}>
              <StatCard
                value="$0.00"
                label="Balance"
                inverted
              />
              <StatCard
                value={`$${totalSpent.toLocaleString()}`}
                label="Total Spent"
                inverted
              />
              <StatCard
                value={transactions.length.toString()}
                label="Transactions"
                inverted
              />
            </Grid>

            {/* Payment Methods */}
            <Stack gap={6}>
              <Stack gap={2} direction="horizontal" className="items-center justify-between">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <CreditCard className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Payment Methods</H3>
                </Stack>
                <Button 
                  variant={showAddCard ? "outlineInk" : "solid"} 
                  inverted={!showAddCard}
                  onClick={() => setShowAddCard(!showAddCard)}
                  icon={showAddCard ? undefined : <Plus className="size-4" />}
                  iconPosition="left"
                >
                  {showAddCard ? "Cancel" : "Add Card"}
                </Button>
              </Stack>

              {showAddCard && (
                <Card inverted variant="elevated" className="p-6">
                  <Stack gap={4}>
                    <Input type="text" placeholder="Card Number" inverted />
                    <Grid cols={2} gap={4}>
                      <Input type="text" placeholder="MM/YY" inverted />
                      <Input type="text" placeholder="CVV" inverted />
                    </Grid>
                    <Input type="text" placeholder="Cardholder Name" inverted />
                    <Button 
                      variant="solid" 
                      inverted 
                      disabled={isUpdating}
                      onClick={async () => { 
                        await addPaymentMethod({ cardNumber: '', expiry: '', cvv: '', name: '' }); 
                        setShowAddCard(false); 
                      }}
                    >
                      {isUpdating ? 'Saving...' : 'Save Card'}
                    </Button>
                  </Stack>
                </Card>
              )}

              {paymentMethods.map((method) => (
                <Card key={method.id} inverted interactive>
                  <Stack gap={2} direction="horizontal" className="items-center justify-between">
                    <Stack gap={1}>
                      <Stack gap={3} direction="horizontal" className="items-center">
                        <CreditCard className="size-5 text-on-dark-muted" />
                        <Body className="font-display text-white">{method.type.toUpperCase()} •••• {method.last4}</Body>
                        {method.isDefault && <Badge variant="solid">Default</Badge>}
                      </Stack>
                      <Label size="xs" className="text-on-dark-disabled">Expires {method.expiry}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      {!method.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={isUpdating}
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          icon={<Star className="size-4" />}
                          iconPosition="left"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={isUpdating}
                        onClick={() => removePaymentMethod(method.id)}
                        icon={<Trash2 className="size-4" />}
                      />
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>

            {/* Transaction History */}
            <Stack gap={6}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Wallet className="size-5 text-on-dark-muted" />
                <H3 className="text-white">Transaction History</H3>
              </Stack>
              <Card inverted className="overflow-hidden p-0">
                <Table variant="dark">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} className="cursor-pointer hover:bg-ink-800" onClick={() => router.push(`/wallet/transactions/${txn.id}`)}>
                        <TableCell>
                          <Label size="xs" className="font-mono text-on-dark-muted">{txn.date}</Label>
                        </TableCell>
                        <TableCell>
                          <Body size="sm" className="text-white">{txn.description}</Body>
                        </TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={1} className="items-center">
                            {txn.type === 'refund' || txn.type === 'credit' ? (
                              <ArrowDownLeft className="size-4 text-success" />
                            ) : (
                              <ArrowUpRight className="size-4 text-on-dark-muted" />
                            )}
                            <Body size="sm" className={`font-mono ${txn.type === 'refund' || txn.type === 'credit' ? 'text-success' : 'text-white'}`}>
                              {txn.type === 'refund' || txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                            </Body>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{txn.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </Stack>
          </Stack>
    </GvtewayAppLayout>
  );
}
