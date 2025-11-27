"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  enabled: boolean;
  lastUpdated: string;
}

interface LocalizedPrice {
  eventName: string;
  basePrice: number;
  baseCurrency: string;
  localizedPrices: { currency: string; price: number }[];
}

const mockCurrencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0, enabled: true, lastUpdated: "2024-11-25" },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92, enabled: true, lastUpdated: "2024-11-25" },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79, enabled: true, lastUpdated: "2024-11-25" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.36, enabled: true, lastUpdated: "2024-11-25" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.53, enabled: true, lastUpdated: "2024-11-25" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 149.50, enabled: false, lastUpdated: "2024-11-25" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", rate: 17.25, enabled: false, lastUpdated: "2024-11-25" },
];

const mockPrices: LocalizedPrice[] = [
  { eventName: "Summer Music Festival 2025", basePrice: 150, baseCurrency: "USD", localizedPrices: [{ currency: "EUR", price: 138 }, { currency: "GBP", price: 119 }, { currency: "CAD", price: 204 }] },
  { eventName: "New Year Gala", basePrice: 250, baseCurrency: "USD", localizedPrices: [{ currency: "EUR", price: 230 }, { currency: "GBP", price: 198 }, { currency: "CAD", price: 340 }] },
];

export default function CurrencyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("currencies");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const enabledCount = mockCurrencies.filter(c => c.enabled).length;

  const formatPrice = (amount: number, symbol: string) => `${symbol}${amount.toLocaleString()}`;

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>International Currency</H1>
            <Body className="text-ink-600">Multi-currency support with localized pricing</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Currencies" value={mockCurrencies.length} className="border-2 border-black" />
            <StatCard label="Enabled" value={enabledCount} className="border-2 border-black" />
            <StatCard label="Base Currency" value="USD" className="border-2 border-black" />
            <StatCard label="Last Updated" value="Today" className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "currencies"} onClick={() => setActiveTab("currencies")}>Currencies</Tab>
              <Tab active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")}>Localized Pricing</Tab>
              <Tab active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</Tab>
            </TabsList>

            <TabPanel active={activeTab === "currencies"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Currency</Button>
                </Stack>
                <Table className="border-2 border-black">
                  <TableHeader>
                    <TableRow className="bg-black text-white">
                      <TableHead>Currency</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Exchange Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCurrencies.map((currency) => (
                      <TableRow key={currency.code}>
                        <TableCell><Label className="font-medium">{currency.name}</Label></TableCell>
                        <TableCell><Badge variant="outline">{currency.code}</Badge></TableCell>
                        <TableCell><Label className="font-mono">{currency.symbol}</Label></TableCell>
                        <TableCell><Label className="font-mono">{currency.rate.toFixed(2)}</Label></TableCell>
                        <TableCell><Label className={currency.enabled ? "text-success-600" : "text-ink-600"}>{currency.enabled ? "Enabled" : "Disabled"}</Label></TableCell>
                        <TableCell><Label className="text-ink-500">{currency.lastUpdated}</Label></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCurrency(currency)}>Edit</Button>
                            <Button variant="ghost" size="sm">{currency.enabled ? "Disable" : "Enable"}</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "pricing"}>
              <Stack gap={4}>
                {mockPrices.map((price, idx) => (
                  <Card key={idx} className="border-2 border-black p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="font-bold">{price.eventName}</Body>
                        <Stack direction="horizontal" gap={2}>
                          <Label className="text-ink-500">Base:</Label>
                          <Label className="font-mono font-bold">${price.basePrice}</Label>
                          <Badge variant="outline">{price.baseCurrency}</Badge>
                        </Stack>
                      </Stack>
                      <Grid cols={4} gap={4}>
                        {price.localizedPrices.map((lp, lpIdx) => {
                          const curr = mockCurrencies.find(c => c.code === lp.currency);
                          return (
                            <Card key={lpIdx} className="p-3 border border-ink-200 text-center">
                              <Stack gap={1}>
                                <Badge variant="outline">{lp.currency}</Badge>
                                <Label className="font-mono text-h6-md">{curr?.symbol}{lp.price}</Label>
                              </Stack>
                            </Card>
                          );
                        })}
                        <Card className="p-3 border border-dashed border-ink-300 text-center cursor-pointer">
                          <Stack gap={1}>
                            <Label className="text-h5-md">+</Label>
                            <Label className="text-ink-500">Add Price</Label>
                          </Stack>
                        </Card>
                      </Grid>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "settings"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={6}>
                  <H3>Currency Settings</H3>
                  <Grid cols={2} gap={6}>
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Label className="font-bold">Base Currency</Label>
                        <Select className="border-2 border-black">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </Select>
                      </Stack>
                      <Stack gap={2}>
                        <Label className="font-bold">Exchange Rate Source</Label>
                        <Select className="border-2 border-black">
                          <option value="auto">Automatic (Daily Update)</option>
                          <option value="manual">Manual Entry</option>
                          <option value="fixed">Fixed Rates</option>
                        </Select>
                      </Stack>
                      <Stack gap={2}>
                        <Label className="font-bold">Rounding</Label>
                        <Select className="border-2 border-black">
                          <option value="nearest">Nearest Whole Number</option>
                          <option value="up">Round Up</option>
                          <option value="down">Round Down</option>
                          <option value="none">No Rounding</option>
                        </Select>
                      </Stack>
                    </Stack>
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Label className="font-bold">Display Options</Label>
                        <Stack gap={1}>
                          {["Show currency selector on checkout", "Auto-detect visitor currency", "Show prices in local currency on event pages", "Include currency conversion disclaimer"].map((opt, idx) => (
                            <Stack key={idx} direction="horizontal" gap={2}>
                              <Input type="checkbox" defaultChecked={idx < 3} className="w-4 h-4" />
                              <Label>{opt}</Label>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Button variant="solid">Save Settings</Button>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/checkout")}>Back to Checkout</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedCurrency} onClose={() => setSelectedCurrency(null)}>
        <ModalHeader><H3>Edit Currency</H3></ModalHeader>
        <ModalBody>
          {selectedCurrency && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCurrency.code}</Badge>
                <Label className="font-bold">{selectedCurrency.name}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Symbol</Label>
                  <Input defaultValue={selectedCurrency.symbol} className="border-2 border-black" />
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Exchange Rate (to USD)</Label>
                  <Input type="number" step="0.01" defaultValue={selectedCurrency.rate} className="border-2 border-black" />
                </Stack>
              </Grid>
              <Stack direction="horizontal" gap={2}>
                <Input type="checkbox" defaultChecked={selectedCurrency.enabled} className="w-4 h-4" />
                <Label>Enabled for checkout</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCurrency(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedCurrency(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Currency</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Currency...</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="SEK">SEK - Swedish Krona</option>
              <option value="NOK">NOK - Norwegian Krone</option>
              <option value="DKK">DKK - Danish Krone</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="HKD">HKD - Hong Kong Dollar</option>
            </Select>
            <Input type="number" step="0.01" placeholder="Exchange Rate" className="border-2 border-black" />
            <Stack direction="horizontal" gap={2}>
              <Input type="checkbox" defaultChecked className="w-4 h-4" />
              <Label>Enable immediately</Label>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Currency</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
