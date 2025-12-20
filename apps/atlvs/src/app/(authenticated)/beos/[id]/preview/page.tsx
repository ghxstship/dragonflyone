'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Printer, Download, Building2, Clock, Users, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@ghxstship/ui';

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
          <p className="text-destructive">Failed to load BEO</p>
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
            <h1 className="text-h2-md font-weight-bold text-foreground">Print Preview</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              BEO #{beo.beo_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span className="text-body-sm font-weight-medium">Print</span>
          </button>
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
                <span className="text-h3-md font-weight-bold text-foreground">{beo.organization.name}</span>
              </div>
            )}
            <h2 className="text-h2-md font-weight-bold text-foreground">{beo.event_name}</h2>
            <p className="text-body-md text-muted-foreground">BEO #{beo.beo_number}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-avatar text-body-sm font-weight-medium ${
              beo.status === 'approved' ? 'bg-success-100 text-success-800' :
              beo.status === 'draft' ? 'bg-info-50 text-info-700' :
              'bg-warning-100 text-warning-800'
            }`}>
              {beo.status.charAt(0).toUpperCase() + beo.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Event Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-md text-foreground">{formatDate(beo.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-md text-foreground">{beo.start_time} - {beo.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-md text-foreground">{beo.guest_count} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-md text-foreground">{beo.space.name} ({beo.space.setup_type})</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Client Contact</h3>
            <p className="text-body-md font-weight-medium text-foreground">
              {beo.contact.first_name} {beo.contact.last_name}
            </p>
            <p className="text-body-sm text-muted-foreground">{beo.contact.email}</p>
            {beo.contact.phone && <p className="text-body-sm text-muted-foreground">{beo.contact.phone}</p>}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">Event Timeline</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-24">Time</th>
                <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Activity</th>
                <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-32">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {beo.sections.timeline.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 text-body-md text-foreground font-weight-medium">{item.time}</td>
                  <td className="py-2 text-body-md text-foreground">{item.description}</td>
                  <td className="py-2 text-body-sm text-muted-foreground">{item.department || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {beo.sections.catering.menu_items.length > 0 && (
          <div className="mb-8">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">Catering</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Item</th>
                  <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-24">Qty</th>
                  <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Dietary Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {beo.sections.catering.menu_items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-body-md text-foreground">{item.name}</td>
                    <td className="py-2 text-body-md text-foreground">{item.quantity}</td>
                    <td className="py-2 text-body-sm text-muted-foreground">{item.dietary_notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {beo.sections.catering.dietary_requirements && beo.sections.catering.dietary_requirements.length > 0 && (
              <div className="mt-4 p-3 bg-warning-50 border-2 border-warning-200 rounded-card">
                <p className="text-body-sm font-weight-semibold text-warning-800">Dietary Requirements:</p>
                <p className="text-body-sm text-warning-700">{beo.sections.catering.dietary_requirements.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {beo.sections.av_requirements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">AV Requirements</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Equipment</th>
                  <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground w-24">Qty</th>
                  <th className="py-2 text-body-sm font-weight-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {beo.sections.av_requirements.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-body-md text-foreground">{item.item}</td>
                    <td className="py-2 text-body-md text-foreground">{item.quantity}</td>
                    <td className="py-2 text-body-sm text-muted-foreground">{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {beo.sections.notes && (
          <div className="mb-8">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 pb-2 border-b border-border">Additional Notes</h3>
            <p className="text-body-md text-foreground whitespace-pre-wrap">{beo.sections.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
