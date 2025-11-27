'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar, Textarea,
} from '@ghxstship/ui';

interface Category {
  id: string;
  name: string;
  parentCategory?: string;
  spend: number;
  vendors: number;
  strategy: 'Strategic' | 'Leverage' | 'Bottleneck' | 'Non-Critical';
  owner: string;
  lastReview: string;
}

interface SourcingStrategy {
  id: string;
  categoryId: string;
  categoryName: string;
  objective: string;
  approach: string;
  targetSavings: number;
  status: 'Draft' | 'Active' | 'Under Review';
  initiatives: string[];
}

const mockCategories: Category[] = [
  { id: 'CAT-001', name: 'Audio Equipment', parentCategory: 'Production Equipment', spend: 1250000, vendors: 12, strategy: 'Strategic', owner: 'John Smith', lastReview: '2024-10-15' },
  { id: 'CAT-002', name: 'Lighting Equipment', parentCategory: 'Production Equipment', spend: 980000, vendors: 8, strategy: 'Strategic', owner: 'Sarah Johnson', lastReview: '2024-11-01' },
  { id: 'CAT-003', name: 'Video Equipment', parentCategory: 'Production Equipment', spend: 750000, vendors: 6, strategy: 'Leverage', owner: 'Mike Davis', lastReview: '2024-09-20' },
  { id: 'CAT-004', name: 'Staging & Rigging', parentCategory: 'Production Equipment', spend: 620000, vendors: 5, strategy: 'Bottleneck', owner: 'Emily Chen', lastReview: '2024-08-15' },
  { id: 'CAT-005', name: 'Transportation', spend: 450000, vendors: 15, strategy: 'Leverage', owner: 'Chris Brown', lastReview: '2024-10-01' },
  { id: 'CAT-006', name: 'Office Supplies', spend: 85000, vendors: 3, strategy: 'Non-Critical', owner: 'Amy Wilson', lastReview: '2024-07-01' },
];

const mockStrategies: SourcingStrategy[] = [
  { id: 'STR-001', categoryId: 'CAT-001', categoryName: 'Audio Equipment', objective: 'Consolidate vendors and negotiate volume discounts', approach: 'Preferred vendor program with 2-3 strategic partners', targetSavings: 15, status: 'Active', initiatives: ['RFP for L-Acoustics partnership', 'Volume commitment negotiation', 'Rental vs buy analysis'] },
  { id: 'STR-002', categoryId: 'CAT-002', categoryName: 'Lighting Equipment', objective: 'Reduce lead times and improve availability', approach: 'Consignment inventory with key suppliers', targetSavings: 10, status: 'Active', initiatives: ['Consignment agreement with Robe', 'Safety stock optimization'] },
];

export default function CategoryManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<SourcingStrategy | null>(null);
  const [strategyFilter, setStrategyFilter] = useState('All');

  const filteredCategories = strategyFilter === 'All' ? mockCategories : mockCategories.filter(c => c.strategy === strategyFilter);
  const totalSpend = mockCategories.reduce((sum, c) => sum + c.spend, 0);
  const strategicSpend = mockCategories.filter(c => c.strategy === 'Strategic').reduce((sum, c) => sum + c.spend, 0);

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'Strategic': return 'text-info-400';
      case 'Leverage': return 'text-success-400';
      case 'Bottleneck': return 'text-warning-400';
      case 'Non-Critical': return 'text-ink-400';
      default: return 'text-ink-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-success-400';
      case 'Draft': return 'text-ink-400';
      case 'Under Review': return 'text-warning-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Category Management</H1>
            <Label className="text-ink-400">Manage spend categories and sourcing strategies</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Categories" value={mockCategories.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Spend" value={`$${(totalSpend / 1000000).toFixed(1)}M`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Strategic Spend" value={`${Math.round(strategicSpend / totalSpend * 100)}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Strategies" value={mockStrategies.filter(s => s.status === 'Active').length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>Categories</Tab>
              <Tab active={activeTab === 'strategies'} onClick={() => setActiveTab('strategies')}>Sourcing Strategies</Tab>
              <Tab active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')}>Kraljic Matrix</Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'categories' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                  <option value="All">All Strategies</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Leverage">Leverage</option>
                  <option value="Bottleneck">Bottleneck</option>
                  <option value="Non-Critical">Non-Critical</option>
                </Select>
                <Button variant="outlineWhite">Add Category</Button>
              </Stack>

              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Category</TableHead>
                    <TableHead className="text-ink-400">Annual Spend</TableHead>
                    <TableHead className="text-ink-400">Vendors</TableHead>
                    <TableHead className="text-ink-400">Strategy</TableHead>
                    <TableHead className="text-ink-400">Owner</TableHead>
                    <TableHead className="text-ink-400">Last Review</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="text-white">{cat.name}</Label>
                          {cat.parentCategory && <Label size="xs" className="text-ink-500">{cat.parentCategory}</Label>}
                        </Stack>
                      </TableCell>
                      <TableCell><Label className="font-mono text-white">${(cat.spend / 1000).toFixed(0)}K</Label></TableCell>
                      <TableCell><Label className="font-mono text-white">{cat.vendors}</Label></TableCell>
                      <TableCell><Label className={getStrategyColor(cat.strategy)}>{cat.strategy}</Label></TableCell>
                      <TableCell><Label className="text-ink-300">{cat.owner}</Label></TableCell>
                      <TableCell><Label className="text-ink-400">{cat.lastReview}</Label></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedCategory(cat)}>Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'strategies' && (
            <Stack gap={4}>
              {mockStrategies.map((strategy) => (
                <Card key={strategy.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{strategy.categoryName}</Body>
                        <Label className={getStatusColor(strategy.status)}>{strategy.status}</Label>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Label className="font-mono text-success-400">{strategy.targetSavings}% Target Savings</Label>
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-400">Objective</Label>
                      <Body className="text-ink-300">{strategy.objective}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-400">Approach</Label>
                      <Body className="text-ink-300">{strategy.approach}</Body>
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-ink-400">Key Initiatives</Label>
                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        {strategy.initiatives.map((init, idx) => (
                          <Badge key={idx} variant="outline">{init}</Badge>
                        ))}
                      </Stack>
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => setSelectedStrategy(strategy)}>View Details</Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}

          {activeTab === 'matrix' && (
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
              <Stack gap={4}>
                <H3>Kraljic Portfolio Matrix</H3>
                <Grid cols={2} gap={4}>
                  <Card className="p-4 border-2 border-info-800 bg-info-900/20">
                    <Stack gap={2}>
                      <Label className="text-info-400 font-bold">STRATEGIC</Label>
                      <Label className="text-ink-300">High profit impact, High supply risk</Label>
                      <Stack gap={1}>
                        {mockCategories.filter(c => c.strategy === 'Strategic').map(c => (
                          <Label key={c.id} className="text-white">• {c.name}</Label>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                  <Card className="p-4 border-2 border-warning-800 bg-warning-900/20">
                    <Stack gap={2}>
                      <Label className="text-warning-400 font-bold">BOTTLENECK</Label>
                      <Label className="text-ink-300">Low profit impact, High supply risk</Label>
                      <Stack gap={1}>
                        {mockCategories.filter(c => c.strategy === 'Bottleneck').map(c => (
                          <Label key={c.id} className="text-white">• {c.name}</Label>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                  <Card className="p-4 border-2 border-success-800 bg-success-900/20">
                    <Stack gap={2}>
                      <Label className="text-success-400 font-bold">LEVERAGE</Label>
                      <Label className="text-ink-300">High profit impact, Low supply risk</Label>
                      <Stack gap={1}>
                        {mockCategories.filter(c => c.strategy === 'Leverage').map(c => (
                          <Label key={c.id} className="text-white">• {c.name}</Label>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                  <Card className="p-4 border-2 border-ink-700 bg-ink-800/50">
                    <Stack gap={2}>
                      <Label className="text-ink-400 font-bold">NON-CRITICAL</Label>
                      <Label className="text-ink-300">Low profit impact, Low supply risk</Label>
                      <Stack gap={1}>
                        {mockCategories.filter(c => c.strategy === 'Non-Critical').map(c => (
                          <Label key={c.id} className="text-white">• {c.name}</Label>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>
          )}

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/procurement')}>Back to Procurement</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedCategory} onClose={() => setSelectedCategory(null)}>
        <ModalHeader><H3>{selectedCategory?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedCategory && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCategory.strategy}</Badge>
                {selectedCategory.parentCategory && <Badge variant="outline">{selectedCategory.parentCategory}</Badge>}
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Annual Spend</Label><Label className="font-mono text-white text-xl">${selectedCategory.spend.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Active Vendors</Label><Label className="font-mono text-white text-xl">{selectedCategory.vendors}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Category Owner</Label><Label className="text-white">{selectedCategory.owner}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Last Review</Label><Label className="text-white">{selectedCategory.lastReview}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>Close</Button>
          <Button variant="solid">Edit Category</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
