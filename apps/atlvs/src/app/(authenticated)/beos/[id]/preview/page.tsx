'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Printer, Download, Building2, Clock, Users, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  Button,
  H1,
  H2,
  H3,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

interface BEO {
  id: string;
  beo_number: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  status: string;
  space: {
    name: string;
    setup_type: string;
  };
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  sections: {
    timeline: Array<{
      time: string;
      description: string;
      department?: string;
    }>;
    room_setup: {
      layout: string;
      notes?: string;
    };
    catering: {
      menu_items: Array<{
        name: string;
        quantity: number;
        dietary_notes?: string;
      }>;
      dietary_requirements?: string[];
    };
    av_requirements: Array<{
      item: string;
      quantity: number;
      notes?: string;
    }>;
    notes?: string;
  };
  organization: {
    name: string;
    logo_url?: string;
  };
}

export default function BEOPreviewPage() {
  const params = useParams();
  const beoId = params.id as string;

  const { data: beo, isLoading, error } = useQuery({
    queryKey: ['beo', beoId],
    queryFn: async () => {
      const response = await fetch(`/api/beos/${beoId}`);
      if (!response.ok) throw new Error('Failed to fetch BEO');
      return response.json() as Promise<BEO>;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading BEO...</div>
      </div>
    );
  }

  if (error || !beo) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load BEO</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href={`/beos/${beoId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Print Preview</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              BEO #{beo.beo_number}
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Print</Text>
          </Button>
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} iconPosition="left">
            PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border-2 border-border rounded-card p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-border">
          <div>
            {beo.organization.logo_url ? (
              <Image src={beo.organization.logo_url} alt={beo.organization.name} width={48} height={48} className="h-12 w-auto mb-4" />
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <Text className="text-h3-md font-weight-bold text-foreground">{beo.organization.name}</Text>
              </div>
            )}
            <H2 className="text-h2-md font-weight-bold text-foreground">{beo.event_name}</H2>
            <Body className="text-body-md text-muted-foreground">BEO #{beo.beo_number}</Body>
          </div>
          <div className="text-right">
            <Text className={`px-3 py-1 rounded-avatar text-body-sm font-weight-medium ${
              beo.status === 'approved' ? 'bg-success-100 text-success-800' :
              beo.status === 'draft' ? 'bg-info-50 text-info-700' :
              'bg-warning-100 text-warning-800'
            }`}>
              {beo.status.charAt(0).toUpperCase() + beo.status.slice(1)}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <H3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Event Details</H3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-md text-foreground">{formatDate(beo.event_date)}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-md text-foreground">{beo.start_time} - {beo.end_time}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-md text-foreground">{beo.guest_count} guests</Text>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-md text-foreground">{beo.space.name} ({beo.space.setup_type})</Text>
              </div>
            </div>
          </div>
          <div>
            <H3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Client Contact</H3>
            <Body className="text-body-md font-weight-medium text-foreground">
              {beo.contact.first_name} {beo.contact.last_name}
            </Body>
            <Body className="text-body-sm text-muted-foreground">{beo.contact.email}</Body>
            {beo.contact.phone && <Body className="text-body-sm text-muted-foreground">{beo.contact.phone}</Body>}
          </div>
        </div>

        <div className="mb-8">
          <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">Event Timeline</H3>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="text-left">
                <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-24">Time</TableHead>
                <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Activity</TableHead>
                <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-32">Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {beo.sections.timeline.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2 text-body-md text-foreground font-weight-medium">{item.time}</TableCell>
                  <TableCell className="py-2 text-body-md text-foreground">{item.description}</TableCell>
                  <TableCell className="py-2 text-body-sm text-muted-foreground">{item.department || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {beo.sections.catering.menu_items.length > 0 && (
          <div className="mb-8">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">Catering</H3>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="text-left">
                  <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Item</TableHead>
                  <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-24">Qty</TableHead>
                  <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Dietary Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {beo.sections.catering.menu_items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-2 text-body-md text-foreground">{item.name}</TableCell>
                    <TableCell className="py-2 text-body-md text-foreground">{item.quantity}</TableCell>
                    <TableCell className="py-2 text-body-sm text-muted-foreground">{item.dietary_notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {beo.sections.catering.dietary_requirements && beo.sections.catering.dietary_requirements.length > 0 && (
              <div className="mt-4 p-3 bg-warning-50 border-2 border-warning-200 rounded-card">
                <Body className="text-body-sm font-weight-semibold text-warning-800">Dietary Requirements:</Body>
                <Body className="text-body-sm text-warning-700">{beo.sections.catering.dietary_requirements.join(', ')}</Body>
              </div>
            )}
          </div>
        )}

        {beo.sections.av_requirements.length > 0 && (
          <div className="mb-8">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">AV Requirements</H3>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="text-left">
                  <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Equipment</TableHead>
                  <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-24">Qty</TableHead>
                  <TableHead className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {beo.sections.av_requirements.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-2 text-body-md text-foreground">{item.item}</TableCell>
                    <TableCell className="py-2 text-body-md text-foreground">{item.quantity}</TableCell>
                    <TableCell className="py-2 text-body-sm text-muted-foreground">{item.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {beo.sections.notes && (
          <div className="mb-8">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">Additional Notes</H3>
            <Body className="text-body-md text-foreground whitespace-pre-wrap">{beo.sections.notes}</Body>
          </div>
        )}
      </div>
    </div>
  );
}
