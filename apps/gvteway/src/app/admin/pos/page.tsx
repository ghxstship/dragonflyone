"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input,
  Button, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge, EmptyState,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Kicker,
} from "@ghxstship/ui";

import { usePOSData, type POSMenuItem } from "@/hooks/usePOS";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

function POSPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'register',
    validTabs: ['register', 'terminals', 'reports'],
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null);

  const {
    terminals,
    menuItems,
    transactions,
    paymentMethods,
    isLoading,
    error,
    refetchTerminals,
    refetchMenuItems,
    refetchTransactions,
    refetchPaymentMethods,
    processSale,
    isProcessing,
  } = usePOSData();

  useEffect(() => {
    if (!selectedTerminalId && terminals.length > 0) {
      setSelectedTerminalId(terminals[0].id);
    }
  }, [terminals, selectedTerminalId]);

  const metrics = useMemo(() => {
    const totalSales = transactions.reduce((sum: number, t) => sum + (t.total || 0), 0);
    const totalTransactions = transactions.length;
    const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const terminalCount = terminals.length;
    const paymentMethodUsage = transactions.reduce<Record<string, number>>((acc, t) => {
      const method = t.payment_method || "other";
      acc[method] = (acc[method] || 0) + (t.total || 0);
      return acc;
    }, {});
    return { totalSales, totalTransactions, avgTransaction, terminalCount, paymentMethodUsage };
  }, [transactions, terminals.length]);

  const handleCompleteSale = async () => {
    if (cart.length === 0 || !paymentMethod) return;
    const normalizedMethod = paymentMethod === "Cash"
      ? "cash"
      : paymentMethod === "Apple Pay" || paymentMethod === "Gift Card"
      ? "mobile"
      : paymentMethod.toLowerCase().includes("bank") || paymentMethod.toLowerCase().includes("ach")
      ? "cash"
      : "card";
    await processSale({
      items: cart.map(item => ({ id: item.id, price: item.price, quantity: item.quantity })),
      paymentMethod: normalizedMethod,
      terminalId: selectedTerminalId || terminals[0]?.id || "unknown-terminal",
    });
    setCart([]);
    setShowPaymentModal(false);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Body className="text-on-dark-muted">Loading POS data...</Body>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Body className="text-error-500">Failed to load POS data. Please retry.</Body>
        <Button
          variant="solid"
          onClick={() => {
            refetchTerminals();
            refetchMenuItems();
            refetchTransactions();
            refetchPaymentMethods();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const totalSales = metrics.totalSales;
  const totalTransactions = metrics.totalTransactions;
  const onlineTerminals = terminals.filter(t => (t as { status?: string }).status?.toLowerCase() === "online").length;
  const avgTransaction = metrics.avgTransaction;

  const addToCart = (item: POSMenuItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const categories = ["All", ...new Set(menuItems.map(i => i.category))];
  const filteredItems = selectedCategory === "All" ? menuItems : menuItems.filter(i => i.category === selectedCategory);

  const paymentOptions = paymentMethods.length
    ? paymentMethods.map(pm => ({
        id: pm.id,
        label: `${pm.brand || pm.type || "Card"} ••••${pm.last_four || pm.last4 || "0000"}`,
        type: pm.type,
      }))
    : [
        { id: "card", label: "Card", type: "card" },
        { id: "cash", label: "Cash", type: "cash" },
        { id: "mobile", label: "Mobile", type: "mobile" },
      ];

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Admin</Kicker>
                <H2 size="lg" className="text-white">Point of Sale</H2>
                <Body className="text-on-dark-muted">Box office, concessions, and merchandise sales</Body>
              </Stack>
              <Badge variant="solid">
                Terminal: {terminals.find(t => t.id === selectedTerminalId)?.name || terminals[0]?.name || "Select a terminal"}
              </Badge>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Sales (Total)" value={`$${totalSales.toFixed(2)}`} inverted />
              <StatCard label="Transactions" value={totalTransactions.toString()} inverted />
              <StatCard label="Avg Transaction" value={totalTransactions > 0 ? `$${avgTransaction.toFixed(2)}` : "$0.00"} inverted />
              <StatCard label="Terminals Online" value={`${onlineTerminals}/${terminals.length}`} inverted />
            </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('register')} onClick={() => setActiveTab('register')}>Register</Tab>
              <Tab active={isActive('terminals')} onClick={() => setActiveTab('terminals')}>Terminals</Tab>
              <Tab active={isActive('reports')} onClick={() => setActiveTab('reports')}>Reports</Tab>
            </TabsList>

            <TabPanel active={isActive('register')}>
              <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
                <Card inverted variant="elevated" className="col-span-2 p-4">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {categories.map(cat => (
                        <Button key={cat} variant={selectedCategory === cat ? "solid" : "outlineInk"} size="sm" inverted={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                          {cat}
                        </Button>
                      ))}
                    </Stack>
                    {filteredItems.length === 0 ? (
                      <EmptyState
                        title="No menu items"
                        description="Create menu items to start selling."
                        action={{ label: "Retry fetch", onClick: () => refetchMenuItems() }}
                      />
                    ) : (
                      <Grid cols={4} gap={3} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredItems.map(item => (
                          <Card key={item.id} inverted interactive onClick={() => addToCart(item)} onKeyDown={(e) => e.key === 'Enter' && addToCart(item)} role="button" tabIndex={0} aria-label={`Add ${item.name} to cart, $${item.price}`}>
                            <Stack gap={1}>
                              <Body className="font-display text-white">{item.name}</Body>
                              <Label size="xs" className="text-on-dark-muted">${item.price}</Label>
                              <Badge variant={item.available ? "solid" : "outline"}>{item.available ? "Available" : "Unavailable"}</Badge>
                            </Stack>
                          </Card>
                        ))}
                      </Grid>
                    )}
                  </Stack>
                </Card>

                <Card inverted variant="elevated" className="p-4">
                  <Stack gap={4}>
                    <H3 className="text-white">CURRENT ORDER</H3>
                    {cart.length === 0 ? (
                      <Body className="py-8 text-center text-on-dark-muted">No items in cart</Body>
                    ) : (
                      <Stack gap={2}>
                        {cart.map(item => (
                          <Card key={item.id} inverted>
                            <Stack direction="horizontal" className="items-center justify-between">
                              <Stack gap={0}>
                                <Label className="font-display text-white">{item.name}</Label>
                                <Label size="xs" className="text-on-dark-disabled">x{item.quantity}</Label>
                              </Stack>
                              <Stack direction="horizontal" gap={2} className="items-center">
                                <Label className="text-white">${item.price * item.quantity}</Label>
                                <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>×</Button>
                              </Stack>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    )}
                    <Card inverted className="border-t-2 border-ink-600 p-3">
                      <Stack direction="horizontal" className="justify-between">
                        <H3 className="text-white">TOTAL</H3>
                        <H3 className="text-white">${cartTotal.toFixed(2)}</H3>
                      </Stack>
                    </Card>
                    <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                      <Button variant="outlineInk" onClick={() => setCart([])}>Clear</Button>
                      <Button variant="solid" inverted disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)}>Pay</Button>
                    </Grid>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('terminals')}>
              {terminals.length === 0 ? (
                <EmptyState
                  title="No terminals"
                  description="Connect POS terminals to view status and transactions."
                  action={{ label: "Retry fetch", onClick: () => refetchTerminals() }}
                />
              ) : (
                <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                  {terminals.map(terminal => {
                    const terminalTx = transactions.filter(t => t.terminal_id === terminal.id);
                    const terminalSales = terminalTx.reduce((sum, t) => sum + (t.total || 0), 0);
                    return (
                      <Card
                        key={terminal.id}
                        inverted
                        interactive
                        onClick={() => setSelectedTerminalId(terminal.id)}
                        className={selectedTerminalId === terminal.id ? "border-2 border-primary-500" : ""}
                      >
                        <Stack gap={3}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack gap={1}>
                              <Body className="font-display text-white">{terminal.name || "Terminal"}</Body>
                              <Label size="xs" className="text-on-dark-disabled">{terminal.venue_id || terminal.location || "Unassigned venue"}</Label>
                            </Stack>
                            <Badge variant={(terminal as { status?: string }).status?.toLowerCase() === "online" ? "solid" : "outline"}>
                              {(terminal as { status?: string }).status || "Unknown"}
                            </Badge>
                          </Stack>
                          <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                            <Stack gap={0}>
                              <Label size="xs" className="text-on-dark-disabled">Sales</Label>
                              <Label className="font-mono text-white">${terminalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Label>
                            </Stack>
                            <Stack gap={0}>
                              <Label size="xs" className="text-on-dark-disabled">Transactions</Label>
                              <Label className="font-mono text-white">{terminalTx.length}</Label>
                            </Stack>
                          </Grid>
                          <Label size="xs" className="text-on-dark-muted">ID: {terminal.id}</Label>
                        </Stack>
                      </Card>
                    );
                  })}
                </Grid>
              )}
            </TabPanel>

            <TabPanel active={isActive('reports')}>
              <Card inverted className="overflow-hidden p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Sales by Category</H3>
                  {transactions.length === 0 ? (
                    <EmptyState
                      title="No transactions yet"
                      description="Process a sale to see reports."
                      action={{ label: "Refresh", onClick: () => refetchTransactions() }}
                    />
                  ) : (
                    <Table variant="dark">
                      <TableHeader>
                        <TableRow className="bg-ink-900">
                          <TableHead className="text-on-dark-muted">Payment Method</TableHead>
                          <TableHead className="text-on-dark-muted">Amount</TableHead>
                          <TableHead className="text-on-dark-muted">Transactions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(metrics.paymentMethodUsage).map(([method, amount]) => {
                          const count = transactions.filter(t => (t.payment_method || "other") === method).length;
                          return (
                            <TableRow key={method} className="border-b border-ink-700">
                              <TableCell><Body className="text-white">{method}</Body></TableCell>
                              <TableCell><Body className="font-mono text-white">${amount.toFixed(2)}</Body></TableCell>
                              <TableCell><Body className="font-mono text-white">{count}</Body></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outlineInk" onClick={() => router.push("/admin")}>Back to Admin</Button>
          </Stack>

      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <ModalHeader><H3>PAYMENT</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card variant="elevated" className="p-4">
              <Stack direction="horizontal" className="justify-between">
                <Body>Total Due</Body>
                <H2>${cartTotal.toFixed(2)}</H2>
              </Stack>
            </Card>
            <Stack gap={2}>
              <Label>Payment Method</Label>
              <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                {paymentOptions.map(method => (
                  <Card
                    key={method.id}
                    interactive
                    variant={paymentMethod === method.label ? "elevated" : "default"}
                    onClick={() => setPaymentMethod(method.label)}
                  >
                    <Label className="text-center">{method.label}</Label>
                  </Card>
                ))}
              </Grid>
            </Stack>
            {paymentMethod === "Cash" && (
              <Stack gap={2}>
                <Label>Amount Tendered</Label>
                <Input type="number" placeholder="0.00" />
              </Stack>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleCompleteSale} disabled={isProcessing || cart.length === 0 || !paymentMethod}>
            {isProcessing ? "Processing..." : "Complete Sale"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <POSPageContent />
    </Suspense>
  );
}
