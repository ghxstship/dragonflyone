'use client';

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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import {
  useMyInvoices,
  type Invoice,
} from '../../hooks/useMyInvoices';
import {
  DollarSign,
  FileText,
  Download,
  Send,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';



export default function MyInvoicesPage() {
  const { data: invoices = [] } = useMyInvoices();

  const totalPending = invoices
    .filter(i => i.status === 'submitted' || i.status === 'approved')
    .reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="info">Draft</Badge>;
      case 'submitted':
        return <Badge variant="warning">Submitted</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'overdue':
        return <Badge variant="error">Overdue</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Vendor Portal"
          title="My Invoices"
          description="Submit and track your invoices"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Pending Payment"
            value={`$${totalPending.toLocaleString()}`}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Paid (YTD)"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="Overdue"
            value={overdueCount.toString()}
            icon={<DollarSign size={20} />}
            inverted
          />
          <StatCard
            label="Total Invoices"
            value={invoices.length.toString()}
            icon={<FileText size={20} />}
            inverted
          />
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Invoices</H3>
                <Button variant="solid">
                  <Plus size={16} className="mr-2" />
                  New Invoice
                </Button>
              </Stack>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Production</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.production}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={1}>
                          <Button variant="ghost" size="sm">
                            <Download size={14} />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button variant="ghost" size="sm">
                              <Send size={14} />
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
