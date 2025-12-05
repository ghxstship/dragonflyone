'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Input,
  Select,
  Textarea,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@ghxstship/ui';
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Plus,
  Phone,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

interface LostFoundItem {
  id: string;
  description: string;
  category: string;
  location: string;
  status: 'unclaimed' | 'claimed' | 'donated';
  foundAt: string;
  claimedBy?: string;
}

const MOCK_ITEMS: LostFoundItem[] = [
  { id: 'LF-001', description: 'Black leather wallet', category: 'Personal', location: 'Section A Row 12', status: 'claimed', foundAt: '2024-11-15 22:30', claimedBy: 'John D.' },
  { id: 'LF-002', description: 'iPhone 15 Pro - Space Black', category: 'Electronics', location: 'VIP Lounge', status: 'unclaimed', foundAt: '2024-11-15 23:15' },
  { id: 'LF-003', description: 'Blue denim jacket', category: 'Clothing', location: 'Coat Check', status: 'unclaimed', foundAt: '2024-11-16 01:00' },
  { id: 'LF-004', description: 'Car keys with BMW fob', category: 'Keys', location: 'Parking Lot B', status: 'claimed', foundAt: '2024-11-16 00:45', claimedBy: 'Sarah M.' },
];

export default function ProductionLostFoundPage() {
  const params = useParams();
  const _productionId = params?.productionId as string;
  const [items, setItems] = useState(MOCK_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({ description: '', category: '', location: '' });

  const unclaimedCount = items.filter(i => i.status === 'unclaimed').length;
  const claimedCount = items.filter(i => i.status === 'claimed').length;

  const filteredItems = items.filter(item =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    const item: LostFoundItem = {
      id: `LF-${String(items.length + 1).padStart(3, '0')}`,
      ...newItem,
      status: 'unclaimed',
      foundAt: new Date().toISOString(),
    };
    setItems(prev => [item, ...prev]);
    setShowAddModal(false);
    setNewItem({ description: '', category: '', location: '' });
  };

  const handleClaimItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'claimed' as const, claimedBy: 'Guest' } : item
    ));
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Lost & Found" description="Track and manage lost items" colorScheme="on-dark" />
          <Button variant="solid" onClick={() => setShowAddModal(true)}><Plus size={16} className="mr-2" />Log Item</Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Items" value={items.length.toString()} icon={<Package size={20} />} inverted />
          <StatCard label="Unclaimed" value={unclaimedCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Claimed" value={claimedCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Claim Rate" value={`${Math.round((claimedCount / items.length) * 100)}%`} icon={<CheckCircle size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Items</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button variant="outline"><Search size={16} /></Button>
                </Stack>
              </Stack>
              <Stack gap={2}>
                {filteredItems.map(item => (
                  <Stack key={item.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                    <Stack gap={1}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="font-weight-semibold text-white">{item.id}</Body>
                        <Badge variant={item.status === 'claimed' ? 'success' : item.status === 'donated' ? 'info' : 'warning'}>
                          {item.status}
                        </Badge>
                      </Stack>
                      <Body className="text-white">{item.description}</Body>
                      <Body className="text-body-sm text-on-dark-muted">
                        {item.category} - Found at {item.location}
                      </Body>
                    </Stack>
                    {item.status === 'unclaimed' && (
                      <Button variant="outline" size="sm" onClick={() => handleClaimItem(item.id)}>
                        <Phone size={14} className="mr-1" />Claim
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Log Lost Item</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Item description" value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} />
            <Grid cols={2} gap={4}>
              <Select value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}>
                <option value="">Category...</option>
                <option value="Personal">Personal</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Keys">Keys</option>
                <option value="Other">Other</option>
              </Select>
              <Input placeholder="Found location" value={newItem.location} onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))} />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleAddItem}>Log Item</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
