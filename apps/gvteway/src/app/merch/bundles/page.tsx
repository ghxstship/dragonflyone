'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  Kicker,
} from '@ghxstship/ui';

interface BundleProduct {
  id: string;
  name: string;
  type: 'ticket' | 'merch' | 'parking' | 'upgrade' | 'experience';
  price: number;
  image?: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: BundleProduct[];
  original_price: number;
  bundle_price: number;
  savings_percent: number;
  available_quantity: number;
  sold_count: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  event_id?: string;
  event_name?: string;
}

interface CrossSellRecommendation {
  id: string;
  trigger_product_id: string;
  trigger_product_name: string;
  recommended_product_id: string;
  recommended_product_name: string;
  recommended_product_price: number;
  discount_percent?: number;
  conversion_rate: number;
  is_active: boolean;
}

const mockBundles: Bundle[] = [
  { id: 'BND-001', name: 'VIP Experience Package', description: 'VIP ticket + exclusive merch + premium parking', products: [{ id: 'P1', name: 'VIP Ticket', type: 'ticket', price: 250 }, { id: 'P2', name: 'Tour T-Shirt', type: 'merch', price: 45 }, { id: 'P3', name: 'Premium Parking', type: 'parking', price: 35 }], original_price: 330, bundle_price: 280, savings_percent: 15, available_quantity: 100, sold_count: 67, is_active: true, event_name: 'Summer Fest 2024' },
  { id: 'BND-002', name: 'Fan Starter Pack', description: 'GA ticket + poster + drink voucher', products: [{ id: 'P4', name: 'GA Ticket', type: 'ticket', price: 75 }, { id: 'P5', name: 'Event Poster', type: 'merch', price: 25 }, { id: 'P6', name: 'Drink Voucher', type: 'experience', price: 15 }], original_price: 115, bundle_price: 95, savings_percent: 17, available_quantity: 500, sold_count: 312, is_active: true, event_name: 'Summer Fest 2024' },
  { id: 'BND-003', name: 'Merch Bundle', description: 'T-shirt + hoodie + cap at special price', products: [{ id: 'P7', name: 'Tour T-Shirt', type: 'merch', price: 45 }, { id: 'P8', name: 'Tour Hoodie', type: 'merch', price: 85 }, { id: 'P9', name: 'Snapback Cap', type: 'merch', price: 35 }], original_price: 165, bundle_price: 130, savings_percent: 21, available_quantity: 200, sold_count: 89, is_active: true },
  { id: 'BND-004', name: 'Ultimate Fan Package', description: 'Meet & greet + VIP ticket + signed merch', products: [{ id: 'P10', name: 'Meet & Greet', type: 'experience', price: 500 }, { id: 'P11', name: 'VIP Ticket', type: 'ticket', price: 250 }, { id: 'P12', name: 'Signed Poster', type: 'merch', price: 100 }], original_price: 850, bundle_price: 699, savings_percent: 18, available_quantity: 25, sold_count: 18, is_active: true, event_name: 'Summer Fest 2024' },
];

const mockCrossSells: CrossSellRecommendation[] = [
  { id: 'CS-001', trigger_product_id: 'TKT-001', trigger_product_name: 'GA Ticket', recommended_product_id: 'PRK-001', recommended_product_name: 'Event Parking', recommended_product_price: 25, discount_percent: 10, conversion_rate: 34.5, is_active: true },
  { id: 'CS-002', trigger_product_id: 'TKT-001', trigger_product_name: 'GA Ticket', recommended_product_id: 'MRC-001', recommended_product_name: 'Tour T-Shirt', recommended_product_price: 45, conversion_rate: 22.3, is_active: true },
  { id: 'CS-003', trigger_product_id: 'TKT-002', trigger_product_name: 'VIP Ticket', recommended_product_id: 'EXP-001', recommended_product_name: 'Backstage Tour', recommended_product_price: 150, discount_percent: 15, conversion_rate: 18.7, is_active: true },
  { id: 'CS-004', trigger_product_id: 'MRC-001', trigger_product_name: 'Tour T-Shirt', recommended_product_id: 'MRC-002', recommended_product_name: 'Tour Hoodie', recommended_product_price: 85, discount_percent: 5, conversion_rate: 28.1, is_active: true },
];

export default function BundlesPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>(mockBundles);
  const [crossSells, setCrossSells] = useState<CrossSellRecommendation[]>(mockCrossSells);
  const [activeTab, setActiveTab] = useState('bundles');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleBundle = (bundleId: string) => {
    setBundles(bundles.map(b =>
      b.id === bundleId ? { ...b, is_active: !b.is_active } : b
    ));
  };

  const handleToggleCrossSell = (csId: string) => {
    setCrossSells(crossSells.map(cs =>
      cs.id === csId ? { ...cs, is_active: !cs.is_active } : cs
    ));
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      ticket: 'bg-info-500 text-white',
      merch: 'bg-purple-500 text-white',
      parking: 'bg-success-500 text-white',
      upgrade: 'bg-warning-500 text-white',
      experience: 'bg-pink-500 text-white',
    };
    return <Badge className={colors[type] || ''}>{type}</Badge>;
  };

  const totalBundleRevenue = bundles.reduce((sum, b) => sum + (b.bundle_price * b.sold_count), 0);
  const avgSavings = Math.round(bundles.reduce((sum, b) => sum + b.savings_percent, 0) / bundles.length);
  const activeBundles = bundles.filter(b => b.is_active).length;

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-start justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Merch</Kicker>
                <H2 size="lg" className="text-white">Bundles & Cross-Sells</H2>
                <Body className="text-on-dark-muted">Create product bundles and cross-sell recommendations</Body>
              </Stack>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>
              Create Bundle
            </Button>
          </Stack>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Active Bundles" value={activeBundles} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={`$${(totalBundleRevenue / 1000).toFixed(0)}K`} className="border-2 border-black" />
            <StatCard label="Avg Savings" value={`${avgSavings}%`} className="border-2 border-black" />
            <StatCard label="Cross-Sells" value={crossSells.filter(cs => cs.is_active).length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'bundles'} onClick={() => setActiveTab('bundles')}>
                Product Bundles
              </Tab>
              <Tab active={activeTab === 'crosssells'} onClick={() => setActiveTab('crosssells')}>
                Cross-Sell Rules
              </Tab>
              <Tab active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
                Analytics
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'bundles' && (
            <Grid cols={2} gap={6}>
              {bundles.map(bundle => (
                <Card key={bundle.id} className={`border-2 p-6 ${bundle.is_active ? 'border-black' : 'border-ink-200 opacity-60'}`}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Body className="font-bold text-h6-md">{bundle.name}</Body>
                        {bundle.event_name && (
                          <Badge variant="outline">{bundle.event_name}</Badge>
                        )}
                      </Stack>
                      <Badge className={bundle.is_active ? 'bg-success-500 text-white' : 'bg-ink-500 text-white'}>
                        {bundle.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Stack>

                    <Body className="text-ink-600">{bundle.description}</Body>

                    <Stack gap={2}>
                      <Label className="text-ink-500">Included Items</Label>
                      <Stack gap={1}>
                        {bundle.products.map(product => (
                          <Stack key={product.id} direction="horizontal" className="justify-between items-center">
                            <Stack direction="horizontal" gap={2}>
                              {getTypeBadge(product.type)}
                              <Body>{product.name}</Body>
                            </Stack>
                            <Label className="text-ink-600">${product.price}</Label>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>

                    <Card className="p-4 bg-ink-50 border">
                      <Grid cols={3} gap={4}>
                        <Stack gap={1}>
                          <Label className="text-ink-500">Original</Label>
                          <Body className="line-through text-ink-600">${bundle.original_price}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label className="text-ink-500">Bundle Price</Label>
                          <Body className="font-bold text-h6-md text-success-600">${bundle.bundle_price}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label className="text-ink-500">Savings</Label>
                          <Badge className="bg-success-500 text-white">{bundle.savings_percent}% OFF</Badge>
                        </Stack>
                      </Grid>
                    </Card>

                    <Stack direction="horizontal" className="justify-between items-center">
                      <Label className="text-ink-500">
                        {bundle.sold_count} sold / {bundle.available_quantity} available
                      </Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedBundle(bundle)}>
                          Edit
                        </Button>
                        <Button
                          variant={bundle.is_active ? 'outline' : 'solid'}
                          size="sm"
                          onClick={() => handleToggleBundle(bundle.id)}
                        >
                          {bundle.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          {activeTab === 'crosssells' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <H3>Cross-Sell Recommendations</H3>
                <Button variant="outline">Add Rule</Button>
              </Stack>

              {crossSells.map(cs => (
                <Card key={cs.id} className={`p-4 border-2 ${cs.is_active ? 'border-black' : 'border-ink-200 opacity-60'}`}>
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Label className="text-ink-500">When buying</Label>
                      <Body className="font-bold">{cs.trigger_product_name}</Body>
                    </Stack>
                    <Stack className="items-center">
                      <Body className="text-h5-md">→</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Recommend</Label>
                      <Body className="font-bold">{cs.recommended_product_name}</Body>
                      <Label className="text-ink-600">${cs.recommended_product_price}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Discount</Label>
                      {cs.discount_percent ? (
                        <Badge className="bg-success-500 text-white">{cs.discount_percent}% OFF</Badge>
                      ) : (
                        <Label className="text-ink-600">None</Label>
                      )}
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Conversion</Label>
                      <Body className="font-bold">{cs.conversion_rate}%</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="justify-end">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button
                        variant={cs.is_active ? 'outline' : 'solid'}
                        size="sm"
                        onClick={() => handleToggleCrossSell(cs.id)}
                      >
                        {cs.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>
          )}

          {activeTab === 'analytics' && (
            <Grid cols={2} gap={6}>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Bundle Performance</H3>
                  <Stack gap={2}>
                    {bundles.map(bundle => (
                      <Stack key={bundle.id} direction="horizontal" className="justify-between">
                        <Body>{bundle.name}</Body>
                        <Stack direction="horizontal" gap={4}>
                          <Label className="text-ink-500">{bundle.sold_count} sold</Label>
                          <Body className="font-bold">${(bundle.bundle_price * bundle.sold_count).toLocaleString()}</Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Cross-Sell Performance</H3>
                  <Stack gap={2}>
                    {crossSells.sort((a, b) => b.conversion_rate - a.conversion_rate).map(cs => (
                      <Stack key={cs.id} direction="horizontal" className="justify-between">
                        <Body>{cs.recommended_product_name}</Body>
                        <Stack direction="horizontal" gap={4}>
                          <Badge variant="outline">{cs.conversion_rate}%</Badge>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Revenue Impact</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Bundle Revenue</Body>
                      <Body className="font-bold text-success-600">${totalBundleRevenue.toLocaleString()}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Cross-Sell Revenue</Body>
                      <Body className="font-bold text-success-600">$24,500</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Avg Order Value Lift</Body>
                      <Body className="font-bold">+23%</Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Top Combinations</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Ticket + Parking</Body>
                      <Badge className="bg-success-500 text-white">45% attach rate</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Ticket + T-Shirt</Body>
                      <Badge className="bg-success-500 text-white">32% attach rate</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>VIP + Meet & Greet</Body>
                      <Badge className="bg-success-500 text-white">28% attach rate</Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          )}

          <Button variant="outlineInk" onClick={() => router.push('/merch')}>
            Back to Merch
          </Button>
          </Stack>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Bundle</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Field label="Bundle Name">
              <Input placeholder="e.g., VIP Experience Package" />
            </Field>
            <Field label="Description">
              <Textarea placeholder="Describe what's included..." rows={2} />
            </Field>
            <Field label="Event (Optional)">
              <Select>
                <option value="">All Events</option>
                <option value="EVT-001">Summer Fest 2024</option>
                <option value="EVT-002">Fall Concert</option>
              </Select>
            </Field>
            <Stack gap={2}>
              <Label>Products to Include</Label>
              <Body className="text-ink-500 text-body-sm">Select products to add to this bundle</Body>
              <Button variant="outline" size="sm">Add Product</Button>
            </Stack>
            <Grid cols={2} gap={4}>
              <Field label="Bundle Price">
                <Input type="number" placeholder="0.00" />
              </Field>
              <Field label="Available Quantity">
                <Input type="number" placeholder="100" />
              </Field>
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowCreateModal(false); setSuccess('Bundle created'); }}>
            Create Bundle
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedBundle} onClose={() => setSelectedBundle(null)}>
        <ModalHeader><H3>Edit Bundle</H3></ModalHeader>
        <ModalBody>
          {selectedBundle && (
            <Stack gap={4}>
              <Field label="Bundle Name">
                <Input defaultValue={selectedBundle.name} />
              </Field>
              <Field label="Description">
                <Textarea defaultValue={selectedBundle.description} rows={2} />
              </Field>
              <Stack gap={2}>
                <Label>Included Products</Label>
                {selectedBundle.products.map(product => (
                  <Card key={product.id} className="p-2 border">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={2}>
                        {getTypeBadge(product.type)}
                        <Body>{product.name}</Body>
                      </Stack>
                      <Label>${product.price}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Grid cols={2} gap={4}>
                <Field label="Bundle Price">
                  <Input type="number" defaultValue={selectedBundle.bundle_price} />
                </Field>
                <Field label="Available Quantity">
                  <Input type="number" defaultValue={selectedBundle.available_quantity} />
                </Field>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedBundle(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setSelectedBundle(null); setSuccess('Bundle updated'); }}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}
