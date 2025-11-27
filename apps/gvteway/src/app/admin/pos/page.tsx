"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../../components/navigation";
import {
  Container, H1, H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Button, Section, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online": return "text-success-400";
      case "Busy": return "text-warning-400";
      case "Offline": return "text-error-400";
      default: return "text-ink-600";
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
            <Stack gap={2}>
              <H1>Point of Sale</H1>
              <Body className="text-ink-600">Box office, concessions, and merchandise sales</Body>
            </Stack>
            <Badge variant="solid">Terminal: Box Office 1</Badge>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Today Sales" value={`$${(totalSales / 1000).toFixed(1)}K`} className="border-2 border-black" />
            <StatCard label="Transactions" value={totalTransactions} className="border-2 border-black" />
            <StatCard label="Avg Transaction" value={`$${(totalSales / totalTransactions).toFixed(0)}`} className="border-2 border-black" />
            <StatCard label="Terminals Online" value={`${onlineTerminals}/${mockTerminals.length}`} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "register"} onClick={() => setActiveTab("register")}>Register</Tab>
              <Tab active={activeTab === "terminals"} onClick={() => setActiveTab("terminals")}>Terminals</Tab>
              <Tab active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>Reports</Tab>
            </TabsList>

            <TabPanel active={activeTab === "register"}>
              <Grid cols={3} gap={6}>
                <Card className="col-span-2 border-2 border-black p-4">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={2}>
                      {categories.map(cat => (
                        <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                          {cat}
                        </Button>
                      ))}
                    </Stack>
                    <Grid cols={4} gap={3}>
                      {filteredItems.map(item => (
                        <Card key={item.id} className="p-3 border border-ink-200 cursor-pointer hover:border-black transition-all" onClick={() => addToCart(item)}>
                          <Stack gap={1}>
                            <Body className="font-bold text-body-sm">{item.name}</Body>
                            <Label className="text-ink-600">${item.price}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>
                </Card>

                <Card className="border-2 border-black p-4">
                  <Stack gap={4}>
                    <H3>CURRENT ORDER</H3>
                    {cart.length === 0 ? (
                      <Body className="text-ink-500 text-center py-8">No items in cart</Body>
                    ) : (
                      <Stack gap={2}>
                        {cart.map(item => (
                          <Card key={item.id} className="p-2 border border-ink-200">
                            <Stack direction="horizontal" className="justify-between items-center">
                              <Stack gap={0}>
                                <Label className="font-bold">{item.name}</Label>
                                <Label size="xs" className="text-ink-500">x{item.quantity}</Label>
                              </Stack>
                              <Stack direction="horizontal" gap={2} className="items-center">
                                <Label>${item.price * item.quantity}</Label>
                                <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>×</Button>
                              </Stack>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    )}
                    <Card className="p-3 bg-ink-100 border-t-2 border-black">
                      <Stack direction="horizontal" className="justify-between">
                        <H3>TOTAL</H3>
                        <H3>${cartTotal.toFixed(2)}</H3>
                      </Stack>
                    </Card>
                    <Grid cols={2} gap={2}>
                      <Button variant="outline" onClick={() => setCart([])}>Clear</Button>
                      <Button variant="solid" disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)}>Pay</Button>
                    </Grid>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "terminals"}>
              <Grid cols={3} gap={4}>
                {mockTerminals.map(terminal => (
                  <Card key={terminal.id} className="border-2 border-black p-4">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-bold">{terminal.name}</Body>
                          <Label size="xs" className="text-ink-500">{terminal.location}</Label>
                        </Stack>
                        <Label className={getStatusColor(terminal.status)}>{terminal.status}</Label>
                      </Stack>
                      <Badge variant="outline">{terminal.type}</Badge>
                      <Grid cols={2} gap={2}>
                        <Stack gap={0}>
                          <Label size="xs" className="text-ink-500">Sales</Label>
                          <Label className="font-mono">${terminal.todaySales.toLocaleString()}</Label>
                        </Stack>
                        <Stack gap={0}>
                          <Label size="xs" className="text-ink-500">Transactions</Label>
                          <Label className="font-mono">{terminal.transactionCount}</Label>
                        </Stack>
                      </Grid>
                      {terminal.lastTransaction && (
                        <Label size="xs" className="text-ink-600">Last: {terminal.lastTransaction}</Label>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "reports"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={4}>
                  <H3>SALES BY CATEGORY</H3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Items Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Tickets</TableCell>
                        <TableCell>191</TableCell>
                        <TableCell>$27,680</TableCell>
                        <TableCell>68%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Concessions</TableCell>
                        <TableCell>312</TableCell>
                        <TableCell>$4,890</TableCell>
                        <TableCell>12%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Merchandise</TableCell>
                        <TableCell>67</TableCell>
                        <TableCell>$8,170</TableCell>
                        <TableCell>20%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/admin")}>Back to Admin</Button>
        </Stack>
      </Container>

      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <ModalHeader><H3>PAYMENT</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card className="p-4 bg-ink-100">
              <Stack direction="horizontal" className="justify-between">
                <Body>Total Due</Body>
                <H2>${cartTotal.toFixed(2)}</H2>
              </Stack>
            </Card>
            <Stack gap={2}>
              <Label>Payment Method</Label>
              <Grid cols={2} gap={2}>
                {["Card", "Cash", "Apple Pay", "Gift Card"].map(method => (
                  <Card key={method} className={`p-3 border-2 cursor-pointer ${paymentMethod === method ? "border-black" : "border-ink-200"}`} onClick={() => setPaymentMethod(method)}>
                    <Label className="text-center">{method}</Label>
                  </Card>
                ))}
              </Grid>
            </Stack>
            {paymentMethod === "Cash" && (
              <Stack gap={2}>
                <Label>Amount Tendered</Label>
                <Input type="number" placeholder="0.00" className="text-right text-h6-md" />
              </Stack>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowPaymentModal(false); setCart([]); }}>Complete Sale</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
