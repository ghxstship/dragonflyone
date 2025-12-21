'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, CheckCircle, Send, FileText, Clock, Users, MapPin, Calendar, Utensils, AlertTriangle } from 'lucide-react';
import { useBEO, useApproveBEO, useDistributeBEO } from '@/hooks/useBEOs';

export default function BEODetailPage() {
  const params = useParams();
  const router = useRouter();
  const beoId = params.id as string;

  const { data, isLoading, error } = useBEO(beoId);
  const beo = data?.beo;
  const approveMutation = useApproveBEO();
  const distributeMutation = useDistributeBEO();

  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const DEPARTMENTS = [
    { id: 'kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'bar', label: 'Bar', icon: Utensils },
    { id: 'service', label: 'Service', icon: Users },
    { id: 'av', label: 'Audio/Visual', icon: FileText },
    { id: 'setup', label: 'Setup Crew', icon: MapPin },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(beoId);
    } catch (err) {
      console.error('Failed to approve BEO:', err);
    }
  };

  const handleDistribute = async () => {
    if (selectedDepartments.length === 0) return;
    try {
      await distributeMutation.mutateAsync({
        id: beoId,
        recipients: selectedDepartments,
      });
      setShowDistributeModal(false);
      setSelectedDepartments([]);
    } catch (err) {
      console.error('Failed to distribute BEO:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'bg-muted text-muted-foreground' };
      case 'pending_review':
        return { label: 'Pending Review', color: 'bg-warning/20 text-warning' };
      case 'approved':
        return { label: 'Approved', color: 'bg-success/20 text-success' };
      case 'distributed':
        return { label: 'Distributed', color: 'bg-primary/20 text-primary' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
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
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-h3-md font-weight-bold text-foreground mb-2">BEO Not Found</h2>
          <p className="text-body-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'The requested BEO could not be found.'}
          </p>
          <Link
            href="/beos"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BEOs
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(beo.status);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/beos"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h2-md font-weight-bold text-foreground">{beo.beo_number}</h1>
              <span className={`px-3 py-1 rounded-badge text-body-sm font-weight-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-body-sm text-muted-foreground mt-1">
              {beo.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {beo.status === 'draft' && (
            <button
              onClick={() => router.push(`/beos/${beoId}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          )}
          {beo.status === 'pending_review' && (
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success text-body-sm font-weight-medium hover:bg-success/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
          )}
          {beo.status === 'approved' && (
            <button
              onClick={() => setShowDistributeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
              Distribute
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Event Date</span>
          </div>
          <p className="text-body-lg font-weight-medium text-foreground">
            {formatDate(beo.event_date)}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Event Time</span>
          </div>
          <p className="text-body-lg font-weight-medium text-foreground">
            {beo.event_start_time ? formatTime(beo.event_start_time) : 'TBD'}
            {beo.event_end_time && ` - ${formatTime(beo.event_end_time)}`}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Guest Count</span>
          </div>
          <p className="text-body-lg font-weight-medium text-foreground">
            {beo.guest_count || 0} guests
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Room Setup</span>
          </div>
          <p className="text-body-lg font-weight-medium text-foreground capitalize">
            {beo.sections?.room_setup?.layout || 'Standard'}
          </p>
        </div>
      </div>

      {beo.sections && Object.keys(beo.sections).length > 0 && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Event Details</h2>
          <div className="space-y-6">
            {Object.entries(beo.sections).map(([sectionKey, sectionData]) => (
              <div key={sectionKey} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <h3 className="text-body-lg font-weight-medium text-foreground capitalize mb-2">
                  {sectionKey.replace(/_/g, ' ')}
                </h3>
                <div className="text-body-sm text-muted-foreground">
                  {typeof sectionData === 'string' ? (
                    <p>{sectionData}</p>
                  ) : Array.isArray(sectionData) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {sectionData.map((item, idx) => (
                        <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-body-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(sectionData, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {beo.sections?.timeline && beo.sections.timeline.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Timeline</h2>
          <div className="space-y-3">
            {beo.sections.timeline.map((item: { time: string; activity: string; notes?: string }, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-3 bg-muted/30 rounded-card">
                <div className="flex-shrink-0 w-20 text-body-sm font-weight-medium text-primary">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm font-weight-medium text-foreground">{item.activity}</p>
                  {item.notes && (
                    <p className="text-body-xs text-muted-foreground mt-1">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {beo.notes && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</h2>
          <p className="text-body-sm text-muted-foreground whitespace-pre-wrap">{beo.notes}</p>
        </div>
      )}

      {showDistributeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-md">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Distribute BEO
            </h2>
            <p className="text-body-sm text-muted-foreground mb-4">
              Select departments to receive this BEO:
            </p>
            <div className="space-y-2 mb-6">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDepartments.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDepartments((prev) =>
                        isSelected
                          ? prev.filter((d) => d !== dept.id)
                          : [...prev, dept.id]
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-card border-2 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-body-sm font-weight-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {dept.label}
                    </span>
                    {isSelected && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDistributeModal(false)}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDistribute}
                disabled={selectedDepartments.length === 0 || distributeMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {distributeMutation.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
