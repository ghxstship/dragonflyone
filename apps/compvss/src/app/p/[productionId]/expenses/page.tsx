'use client';

import { useState, useEffect, useCallback } from 'react';
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
  H3,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import {
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  Plus,
  Download,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';
import { log } from '@ghxstship/config';

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  vendor: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  date: string;
}

const MOCK_EXPENSES: Expense[] = [
  { id: 'EXP-001', description: 'Catering - Day 1', category: 'Catering', amount: 2500, vendor: 'Local Eats Co', submittedBy: 'PM', status: 'paid', date: '2024-11-15' },
  { id: 'EXP-002', description: 'Equipment rental - Generators', category: 'Equipment', amount: 4500, vendor: 'Power Solutions', submittedBy: 'TD', status: 'approved', date: '2024-11-14' },
  { id: 'EXP-003', description: 'Transportation - Artist shuttle', category: 'Transport', amount: 800, vendor: 'Elite Limo', submittedBy: 'Artist Liaison', status: 'pending', date: '2024-11-16' },
  { id: 'EXP-004', description: 'Supplies - Gaff tape, cables', category: 'Supplies', amount: 350, vendor: 'Stage Supply Co', submittedBy: 'Stage Manager', status: 'approved', date: '2024-11-15' },
];

export default function ProductionExpensesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', category: '', amount: '', vendor: '' });

  const fetchExpenses = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/expenses`);
      if (response.ok) {
        const data = await response.json();
        if (data.expenses && data.expenses.length > 0) {
          setExpenses(data.expenses);
        }
      }
    } catch (error) {
      log.error('Failed to fetch expenses:', error instanceof Error ? error : undefined);
    }
  }, [productionId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = expenses.filter(e => e.status === 'approved' || e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);

  const getStatusBadge = (status: Expense['status']) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
      pending: 'warning', approved: 'info', rejected: 'error', paid: 'success'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleAddExpense = () => {
    const expense: Expense = {
      id: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount) || 0,
      vendor: newExpense.vendor,
      submittedBy: 'Current User',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    setExpenses(prev => [expense, ...prev]);
    setShowAddModal(false);
    setNewExpense({ description: '', category: '', amount: '', vendor: '' });
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Expenses" description="Track and manage production expenses" colorScheme="on-dark" />
          <Stack direction="horizontal" gap={2}>
            <Button variant="outline"><Download size={16} className="mr-2" />Export</Button>
            <Button variant="solid" onClick={() => setShowAddModal(true)}><Plus size={16} className="mr-2" />Add Expense</Button>
          </Stack>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Expenses" value={`$${totalAmount.toLocaleString()}`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Pending" value={`$${pendingAmount.toLocaleString()}`} icon={<Clock size={20} />} inverted />
          <StatCard label="Approved" value={`$${approvedAmount.toLocaleString()}`} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Submissions" value={expenses.length.toString()} icon={<Receipt size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">All Expenses</H3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.id}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell className="text-right">${expense.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Expense</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))} />
            <Grid cols={2} gap={4}>
              <Select value={newExpense.category} onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}>
                <option value="">Category...</option>
                <option value="Catering">Catering</option>
                <option value="Equipment">Equipment</option>
                <option value="Transport">Transport</option>
                <option value="Supplies">Supplies</option>
                <option value="Labor">Labor</option>
                <option value="Other">Other</option>
              </Select>
              <Input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} />
            </Grid>
            <Input placeholder="Vendor" value={newExpense.vendor} onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleAddExpense}>Submit</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
