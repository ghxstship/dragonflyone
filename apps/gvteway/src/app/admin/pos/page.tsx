"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input,
  Button, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Kicker,
} from "@ghxstship/ui";

interface POSTerminal {
  id: string;
  name: string;
  location: string;
  type: "Box Office" | "Concession" | "Merch" | "Mobile";
  status: "Online" | "Offline" | "Busy";
  lastTransaction?: string;
  todaySales: number;
  transactionCount: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const mockTerminals: POSTerminal[] = [
  { id: "POS-001", name: "Box Office 1", location: "Main Entrance", type: "Box Office", status: "Online", lastTransaction: "2 min ago", todaySales: 12450, transactionCount: 89 },
  { id: "POS-002", name: "Box Office 2", location: "Main Entrance", type: "Box Office", status: "Busy", lastTransaction: "Just now", todaySales: 15230, transactionCount: 102 },
  { id: "POS-003", name: "Concession A", location: "Section A", type: "Concession", status: "Online", lastTransaction: "5 min ago", todaySales: 3420, transactionCount: 156 },
  { id: "POS-004", name: "Merch Booth", location: "Main Concourse", type: "Merch", status: "Online", lastTransaction: "1 min ago", todaySales: 8750, transactionCount: 67 },
  { id: "POS-005", name: "Mobile 1", location: "Roaming", type: "Mobile", status: "Offline", todaySales: 890, transactionCount: 12 },
];

const menuItems = [
  { id: "M-001", name: "GA Ticket", price: 75, category: "Tickets" },
  { id: "M-002", name: "VIP Ticket", price: 150, category: "Tickets" },
  { id: "M-003", name: "Beer", price: 12, category: "Drinks" },
  { id: "M-004", name: "Soda", price: 5, category: "Drinks" },
  { id: "M-005", name: "Hot Dog", price: 8, category: "Food" },
  { id: "M-006", name: "Pizza Slice", price: 10, category: "Food" },
  { id: "M-007", name: "Event T-Shirt", price: 35, category: "Merch" },
  { id: "M-008", name: "Poster", price: 25, category: "Merch" },
];

export default function POSPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("register");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const totalSales = mockTerminals.reduce((sum, t) => sum + t.todaySales, 0);
  const totalTransactions = mockTerminals.reduce((sum, t) => sum + t.transactionCount, 0);
  const onlineTerminals = mockTerminals.filter(t => t.status !== "Offline").length;

  const addToCart = (item: typeof menuItems[0]) => {
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

  // Status color helper - now using Badge variants instead
  const _getStatusColor = (status: string) => {
    switch (status) {
      case "Online": return "text-success-400";
      case "Busy": return "text-warning-400";
      case "Offline": return "text-error-400";
      default: return "text-ink-600";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Admin</Kicker>
                <H2 size="lg" className="text-white">Point of Sale</H2>
                <Body className="text-on-dark-muted">Box office, concessions, and merchandise sales</Body>
              </Stack>
              <Badge variant="solid">Terminal: Box Office 1</Badge>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Today Sales" value={`$${(totalSales / 1000).toFixed(1)}K`} inverted />
              <StatCard label="Transactions" value={totalTransactions.toString()} inverted />
              <StatCard label="Avg Transaction" value={`$${(totalSales / totalTransactions).toFixed(0)}`} inverted />
              <StatCard label="Terminals Online" value={`${onlineTerminals}/${mockTerminals.length}`} inverted />
            </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "register"} onClick={() => setActiveTab("register")}>Register</Tab>
              <Tab active={activeTab === "terminals"} onClick={() => setActiveTab("terminals")}>Terminals</Tab>
              <Tab active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>Reports</Tab>
            </TabsList>

            <TabPanel active={activeTab === "register"}>
              <Grid cols={3} gap={6}>
                <Card inverted variant="elevated" className="col-span-2 p-4">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={2}>
                      {categories.map(cat => (
                        <Button key={cat} variant={selectedCategory === cat ? "solid" : "outlineInk"} size="sm" inverted={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                          {cat}
                        </Button>
                      ))}
                    </Stack>
                    <Grid cols={4} gap={3}>
                      {filteredItems.map(item => (
                        <Card key={item.id} inverted interactive onClick={() => addToCart(item)}>
                          <Stack gap={1}>
                            <Body className="font-display text-white">{item.name}</Body>
                            <Label size="xs" className="text-on-dark-muted">${item.price}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
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
                    <Grid cols={2} gap={2}>
                      <Button variant="outlineInk" onClick={() => setCart([])}>Clear</Button>
                      <Button variant="solid" inverted disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)}>Pay</Button>
                    </Grid>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "terminals"}>
              <Grid cols={3} gap={4}>
                {mockTerminals.map(terminal => (
                  <Card key={terminal.id} inverted>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{terminal.name}</Body>
                          <Label size="xs" className="text-on-dark-disabled">{terminal.location}</Label>
                        </Stack>
                        <Badge variant={terminal.status === "Online" ? "solid" : terminal.status === "Busy" ? "outline" : "ghost"}>
                          {terminal.status}
                        </Badge>
                      </Stack>
                      <Badge variant="outline">{terminal.type}</Badge>
                      <Grid cols={2} gap={2}>
                        <Stack gap={0}>
                          <Label size="xs" className="text-on-dark-disabled">Sales</Label>
                          <Label className="font-mono text-white">${terminal.todaySales.toLocaleString()}</Label>
                        </Stack>
                        <Stack gap={0}>
                          <Label size="xs" className="text-on-dark-disabled">Transactions</Label>
                          <Label className="font-mono text-white">{terminal.transactionCount}</Label>
                        </Stack>
                      </Grid>
                      {terminal.lastTransaction && (
                        <Label size="xs" className="text-on-dark-muted">Last: {terminal.lastTransaction}</Label>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "reports"}>
              <Card inverted className="overflow-hidden p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Sales by Category</H3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-ink-900">
                        <TableHead className="text-on-dark-muted">Category</TableHead>
                        <TableHead className="text-on-dark-muted">Items Sold</TableHead>
                        <TableHead className="text-on-dark-muted">Revenue</TableHead>
                        <TableHead className="text-on-dark-muted">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-ink-700">
                        <TableCell><Body className="text-white">Tickets</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">191</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">$27,680</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">68%</Body></TableCell>
                      </TableRow>
                      <TableRow className="border-b border-ink-700">
                        <TableCell><Body className="text-white">Concessions</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">312</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">$4,890</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">12%</Body></TableCell>
                      </TableRow>
                      <TableRow className="border-b border-ink-700">
                        <TableCell><Body className="text-white">Merchandise</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">67</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">$8,170</Body></TableCell>
                        <TableCell><Body className="font-mono text-white">20%</Body></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
              <Grid cols={2} gap={2}>
                {["Card", "Cash", "Apple Pay", "Gift Card"].map(method => (
                  <Card 
                    key={method} 
                    interactive
                    variant={paymentMethod === method ? "elevated" : "default"}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <Label className="text-center">{method}</Label>
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
          <Button variant="solid" onClick={() => { setShowPaymentModal(false); setCart([]); }}>Complete Sale</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}
