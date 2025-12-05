'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Checkbox,
  ProgressBar,
} from '@ghxstship/ui';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Lock,
  Archive,
} from 'lucide-react';

interface CloseChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  category: 'financial' | 'contracts' | 'reports' | 'assets';
}

const CLOSE_CHECKLIST: CloseChecklistItem[] = [
  { id: 'invoices-paid', label: 'All Invoices Paid', description: 'Verify all vendor invoices are paid', completed: false, category: 'financial' },
  { id: 'receivables-collected', label: 'Receivables Collected', description: 'All sponsor and ticket revenue collected', completed: false, category: 'financial' },
  { id: 'expense-reports', label: 'Expense Reports Submitted', description: 'All team expense reports processed', completed: false, category: 'financial' },
  { id: 'contracts-closed', label: 'Contracts Closed', description: 'All vendor and talent contracts finalized', completed: false, category: 'contracts' },
  { id: 'sponsor-deliverables', label: 'Sponsor Deliverables Complete', description: 'All sponsor obligations fulfilled', completed: false, category: 'contracts' },
  { id: 'daily-reports', label: 'Daily Reports Complete', description: 'All daily production reports submitted', completed: false, category: 'reports' },
  { id: 'wrap-report', label: 'Wrap Report Generated', description: 'Final wrap report created and approved', completed: false, category: 'reports' },
  { id: 'incident-reports', label: 'Incident Reports Filed', description: 'All incidents documented and closed', completed: false, category: 'reports' },
  { id: 'assets-returned', label: 'Assets Returned', description: 'All rented/borrowed assets returned', completed: false, category: 'assets' },
  { id: 'inventory-reconciled', label: 'Inventory Reconciled', description: 'Asset inventory verified and updated', completed: false, category: 'assets' },
];

export default function ProductionClosePage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const [checklist, setChecklist] = useState(CLOSE_CHECKLIST);
  const [isClosing, setIsClosing] = useState(false);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const canClose = completedCount === totalCount;

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleClose = async () => {
    if (!canClose) return;
    setIsClosing(true);
    try {
      await fetch(`/api/productions/${productionId}/close`, {
        method: 'POST',
      });
      router.push(`/p/${productionId}/overview`);
    } catch (_error) {
      // Handle error
    } finally {
      setIsClosing(false);
    }
  };

  const categoryIcons = {
    financial: DollarSign,
    contracts: FileText,
    reports: FileText,
    assets: Package,
  };

  const groupedChecklist = {
    financial: checklist.filter(i => i.category === 'financial'),
    contracts: checklist.filter(i => i.category === 'contracts'),
    reports: checklist.filter(i => i.category === 'reports'),
    assets: checklist.filter(i => i.category === 'assets'),
  };

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker="Production"
        title="Close Production"
        description="Complete all checklist items to close and archive this production"
        colorScheme="on-dark"
      />

      <Grid cols={4} gap={4}>
        <StatCard
          label="Checklist Progress"
          value={`${completedCount}/${totalCount}`}
          icon={<CheckCircle size={20} />}
          inverted
        />
        <StatCard
          label="Completion"
          value={`${progress}%`}
          icon={<ProgressBar value={progress} />}
          inverted
        />
        <StatCard
          label="Status"
          value={canClose ? 'Ready' : 'Incomplete'}
          icon={canClose ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          inverted
        />
        <StatCard
          label="Action"
          value={canClose ? 'Close Now' : 'Complete Items'}
          icon={<Lock size={20} />}
          inverted
        />
      </Grid>

      <Grid cols={2} gap={6}>
        {Object.entries(groupedChecklist).map(([category, items]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const categoryCompleted = items.filter(i => i.completed).length;
          return (
            <Card key={category} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Icon size={20} />
                      <H3 className="capitalize text-white">{category}</H3>
                    </Stack>
                    <Badge variant={categoryCompleted === items.length ? 'success' : 'warning'}>
                      {categoryCompleted}/{items.length}
                    </Badge>
                  </Stack>
                  <Stack gap={3}>
                    {items.map(item => (
                      <Stack
                        key={item.id}
                        direction="horizontal"
                        gap={3}
                        className="cursor-pointer items-start rounded border-2 border-ink-700 p-3 transition-colors hover:bg-ink-800"
                        onClick={() => toggleItem(item.id)}
                      >
                        <Checkbox
                          checked={item.completed}
                          onChange={() => toggleItem(item.id)}
                        />
                        <Stack gap={1}>
                          <Body className={item.completed ? 'text-on-dark-muted line-through' : 'text-white'}>
                            {item.label}
                          </Body>
                          <Body className="text-body-sm text-on-dark-muted">
                            {item.description}
                          </Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          );
        })}
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack direction="horizontal" className="items-center justify-between">
            <Stack gap={1}>
              <H3 className="text-white">Close Production</H3>
              <Body className="text-on-dark-muted">
                {canClose 
                  ? 'All checklist items complete. You can now close this production.'
                  : `Complete ${totalCount - completedCount} remaining items to close this production.`
                }
              </Body>
            </Stack>
            <Button
              variant="solid"
              disabled={!canClose || isClosing}
              onClick={handleClose}
            >
              <Archive size={16} className="mr-2" />
              {isClosing ? 'Closing...' : 'Close & Archive'}
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
