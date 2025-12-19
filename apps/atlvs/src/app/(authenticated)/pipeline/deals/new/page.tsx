'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, DollarSign, Tag, FileText } from 'lucide-react';
import { useCreateDeal } from '@/hooks/usePipeline';

function NewDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStage = searchParams.get('stage') || 'lead';

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    stage: initialStage,
    value: '',
    probability: '',
    expected_close_date: '',
    source: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createDeal = useCreateDeal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required';
    }
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }
    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Value must be a number';
    }
    if (formData.probability) {
      const prob = parseFloat(formData.probability);
      if (isNaN(prob) || prob < 0 || prob > 100) {
        newErrors.probability = 'Probability must be between 0 and 100';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createDeal.mutateAsync({
        name: formData.name,
        contact_name: formData.contact_name || undefined,
        contact_email: formData.contact_email || undefined,
        stage: formData.stage,
        value: formData.value ? parseFloat(formData.value) : undefined,
        probability: formData.probability ? parseFloat(formData.probability) : undefined,
        expected_close_date: formData.expected_close_date || undefined,
        source: formData.source || undefined,
        notes: formData.notes || undefined,
      });
      router.push('/pipeline');
    } catch (error) {
      setErrors({ submit: 'Failed to create deal. Please try again.' });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/pipeline"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">New Deal</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Create a new deal in your pipeline
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Deal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Deal Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Corporate Annual Gala"
                className={`w-full px-4 py-2 border-2 rounded-button ${
                  errors.name ? 'border-destructive' : 'border-border'
                } focus:outline-none focus:border-primary`}
              />
              {errors.name && (
                <p className="text-body-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Stage
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="">Select source...</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="social_media">Social Media</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="repeat_client">Repeat Client</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Contact Name
              </label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-2 border-2 rounded-button ${
                  errors.contact_email ? 'border-destructive' : 'border-border'
                } focus:outline-none focus:border-primary`}
              />
              {errors.contact_email && (
                <p className="text-body-xs text-destructive mt-1">{errors.contact_email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deal Value
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Value ($)
              </label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="50000"
                className={`w-full px-4 py-2 border-2 rounded-button ${
                  errors.value ? 'border-destructive' : 'border-border'
                } focus:outline-none focus:border-primary`}
              />
              {errors.value && (
                <p className="text-body-xs text-destructive mt-1">{errors.value}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Probability (%)
              </label>
              <input
                type="text"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                placeholder="50"
                className={`w-full px-4 py-2 border-2 rounded-button ${
                  errors.probability ? 'border-destructive' : 'border-border'
                } focus:outline-none focus:border-primary`}
              />
              {errors.probability && (
                <p className="text-body-xs text-destructive mt-1">{errors.probability}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                name="expected_close_date"
                value={formData.expected_close_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Notes
          </h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Add any additional notes about this deal..."
            className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {errors.submit && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <p className="text-body-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/pipeline"
            className="px-6 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createDeal.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {createDeal.isPending ? 'Creating...' : 'Create Deal'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewDealPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <NewDealForm />
    </Suspense>
  );
}
