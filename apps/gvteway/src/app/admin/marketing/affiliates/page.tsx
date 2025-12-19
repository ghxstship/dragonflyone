'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Kicker, Spinner, ProgressBar,
} from '@ghxstship/ui';
import {
  Users, DollarSign, Eye, Trash2, UserPlus, Link2, Copy,
} from 'lucide-react';
import { useAffiliatesData, type Affiliate } from '@/hooks/useAffiliates';

function AffiliatesProgramPageContent() {
  const router = useRouter();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  
  const {
    affiliates,
    isLoading,
    error,
    createAffiliate,
    isCreating,
    updateAffiliate,
    deleteAffiliate,
    refetch,
  } = useAffiliatesData({ status: statusFilter });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    code: '',
    commission_rate: 10,
    commission_type: 'percentage' as Affiliate['commission_type'],
  });

  const totalRevenue = affiliates.reduce((sum, a) => sum + a.total_revenue, 0);
  const totalCommission = affiliates.reduce((sum, a) => sum + a.total_commission, 0);
  const totalClicks = affiliates.reduce((sum, a) => sum + a.clicks, 0);
  const totalConversions = affiliates.reduce((sum, a) => sum + a.conversions, 0);
  const avgConversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      active: 'solid',
      pending: 'outline',
      suspended: 'ghost',
      inactive: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status.toUpperCase()}</Badge>;
  };

  const handleCreate = async () => {
    try {
      await createAffiliate(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        code: '',
        commission_rate: 10,
        commission_type: 'percentage',
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleToggleStatus = async (affiliate: Affiliate) => {
    const newStatus = affiliate.status === 'active' ? 'suspended' : 'active';
    try {
      await updateAffiliate({ id: affiliate.id, status: newStatus });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this affiliate?')) {
      try {
        await deleteAffiliate(id);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const copyAffiliateLink = (code: string) => {
    navigator.clipboard.writeText(`https://gvteway.com/?ref=${code}`);
  };

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <Body className="text-muted">Loading affiliates...</Body>
          </div>
        </div>
      </GvtewayAppLayout>
    );
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <Alert variant="error">
          <Body>Failed to load affiliates: {error instanceof Error ? error.message : 'Unknown error'}</Body>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </Alert>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Marketing</Kicker>
          <H2 size="lg" className="text-white">Affiliate Program</H2>
          <Body className="text-on-dark-muted">Manage affiliate partners and track performance</Body>
        </Stack>

        <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} inverted />
          <StatCard label="Total Commission" value={`$${totalCommission.toLocaleString()}`} inverted />
          <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} inverted />
          <StatCard label="Avg Conversion" value={`${avgConversionRate}%`} inverted />
        </Grid>

        <Stack gap={4}>
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack direction="horizontal" gap={4}>
              <Input type="search" placeholder="Search affiliates..." className="w-64" inverted />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                inverted
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Stack>
            <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Affiliate
            </Button>
          </Stack>

          {affiliates.length === 0 ? (
            <Card inverted className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-on-dark-muted" />
              <H3 className="text-white mb-2">No Affiliates Yet</H3>
              <Body className="text-on-dark-muted mb-4">Start your affiliate program by adding partners</Body>
              <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
                Add Affiliate
              </Button>
            </Card>
          ) : (
            <Card inverted className="overflow-hidden">
              <Table variant="dark">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-on-dark-muted">Affiliate</TableHead>
                    <TableHead className="text-on-dark-muted">Code</TableHead>
                    <TableHead className="text-on-dark-muted">Status</TableHead>
                    <TableHead className="text-on-dark-muted">Commission</TableHead>
                    <TableHead className="text-on-dark-muted">Revenue</TableHead>
                    <TableHead className="text-on-dark-muted">Conversions</TableHead>
                    <TableHead className="text-on-dark-muted">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id} className="border-b border-ink-700">
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{affiliate.name}</Body>
                          <Label size="xs" className="text-on-dark-muted">{affiliate.email}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Badge variant="outline">{affiliate.code}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => copyAffiliateLink(affiliate.code)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                      <TableCell>
                        <Label className="font-mono text-white">
                          {affiliate.commission_type === 'percentage' ? `${affiliate.commission_rate}%` : `$${affiliate.commission_rate}`}
                        </Label>
                      </TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="font-mono text-white">${affiliate.total_revenue.toLocaleString()}</Label>
                          <Label size="xs" className="text-on-dark-disabled">
                            ${affiliate.total_commission.toLocaleString()} earned
                          </Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="font-mono text-white">{affiliate.conversions}</Label>
                          <Label size="xs" className="text-on-dark-disabled">
                            {affiliate.conversion_rate.toFixed(2)}% rate
                          </Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAffiliate(affiliate)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(affiliate)}>
                            {affiliate.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(affiliate.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Stack>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card inverted className="p-6">
            <Stack gap={4}>
              <H3 className="text-white">Top Performers</H3>
              <Stack gap={3}>
                {affiliates
                  .filter(a => a.status === 'active')
                  .sort((a, b) => b.total_revenue - a.total_revenue)
                  .slice(0, 5)
                  .map((affiliate, idx) => (
                    <Stack key={affiliate.id} gap={2}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Badge variant={idx === 0 ? 'solid' : 'outline'}>#{idx + 1}</Badge>
                          <Body className="text-white">{affiliate.name}</Body>
                        </Stack>
                        <Label className="font-mono text-white">${affiliate.total_revenue.toLocaleString()}</Label>
                      </Stack>
                      <ProgressBar value={(affiliate.total_revenue / (affiliates[0]?.total_revenue || 1)) * 100} className="h-2" />
                    </Stack>
                  ))}
                {affiliates.filter(a => a.status === 'active').length === 0 && (
                  <Body className="text-on-dark-muted text-center py-4">No active affiliates</Body>
                )}
              </Stack>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={4}>
              <H3 className="text-white">Pending Payouts</H3>
              <Stack gap={3}>
                {affiliates
                  .filter(a => a.pending_payout > 0)
                  .sort((a, b) => b.pending_payout - a.pending_payout)
                  .slice(0, 5)
                  .map((affiliate) => (
                    <Stack key={affiliate.id} direction="horizontal" className="items-center justify-between p-3 border-2 border-ink-700 rounded-card">
                      <Stack gap={0}>
                        <Body className="text-white">{affiliate.name}</Body>
                        <Label size="xs" className="text-on-dark-muted">{affiliate.code}</Label>
                      </Stack>
                      <Stack gap={0} className="text-right">
                        <Label className="font-mono text-white">${affiliate.pending_payout.toLocaleString()}</Label>
                        <Label size="xs" className="text-on-dark-muted">pending</Label>
                      </Stack>
                    </Stack>
                  ))}
                {affiliates.filter(a => a.pending_payout > 0).length === 0 && (
                  <Body className="text-on-dark-muted text-center py-4">No pending payouts</Body>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Button variant="outlineInk" onClick={() => router.push('/admin/marketing')}>
          Back to Marketing
        </Button>
      </Stack>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Add Affiliate</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Affiliate Name</Label>
              <Input
                placeholder="e.g., Sarah's Music Blog"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="e.g., partner@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Affiliate Code</Label>
              <Input
                placeholder="e.g., SARAH10"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              <Label size="xs" className="text-ink-500">This will be used in referral links</Label>
            </Stack>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Label>Commission Rate</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                />
              </Stack>
              <Stack gap={2}>
                <Label>Commission Type</Label>
                <Select
                  value={formData.commission_type}
                  onChange={(e) => setFormData({ ...formData, commission_type: e.target.value as Affiliate['commission_type'] })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </Select>
              </Stack>
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Adding...' : 'Add Affiliate'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedAffiliate} onClose={() => setSelectedAffiliate(null)}>
        <ModalHeader><H3>Affiliate Details</H3></ModalHeader>
        <ModalBody>
          {selectedAffiliate && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="font-display text-h4-md">{selectedAffiliate.name}</Body>
                <Label className="text-ink-500">{selectedAffiliate.email}</Label>
              </Stack>
              <Card className="p-4 border-2 border-ink-200">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Link2 className="w-4 h-4 text-ink-500" />
                  <Body className="font-mono text-body-sm">https://gvteway.com/?ref={selectedAffiliate.code}</Body>
                  <Button variant="ghost" size="sm" onClick={() => copyAffiliateLink(selectedAffiliate.code)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </Stack>
              </Card>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Status</Label>
                  {getStatusBadge(selectedAffiliate.status)}
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Commission</Label>
                  <Label className="font-mono">
                    {selectedAffiliate.commission_type === 'percentage' ? `${selectedAffiliate.commission_rate}%` : `$${selectedAffiliate.commission_rate}`}
                  </Label>
                </Stack>
              </Grid>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Total Revenue</Label>
                  <Label className="font-mono">${selectedAffiliate.total_revenue.toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Total Commission</Label>
                  <Label className="font-mono">${selectedAffiliate.total_commission.toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Pending Payout</Label>
                  <Label className="font-mono">${selectedAffiliate.pending_payout.toLocaleString()}</Label>
                </Stack>
              </Grid>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Clicks</Label>
                  <Label className="font-mono">{selectedAffiliate.clicks.toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Conversions</Label>
                  <Label className="font-mono">{selectedAffiliate.conversions}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Conversion Rate</Label>
                  <Label className="font-mono">{selectedAffiliate.conversion_rate.toFixed(2)}%</Label>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAffiliate(null)}>Close</Button>
          {selectedAffiliate && selectedAffiliate.pending_payout > 0 && (
            <Button variant="solid">
              <DollarSign className="w-4 h-4 mr-2" />
              Process Payout
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function AffiliatesProgramPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AffiliatesProgramPageContent />
    </Suspense>
  );
}
