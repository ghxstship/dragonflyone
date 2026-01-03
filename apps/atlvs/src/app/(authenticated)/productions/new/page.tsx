'use client';

/**
 * New Production Page
 * Uses normalized WizardPage template from @ghxstship/ui
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Calendar, DollarSign, Users, Target} from 'lucide-react';
import {
  Stack, Grid, Card, CardBody, H3, Body, Label, Input, Select, Textarea, Badge, WizardPage, useToast,
  type WizardStep} from "@ghxstship/ui";
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';

// Roles that can create productions

interface ProductionFormData {
  title: string;
  tagline: string;
  description: string;
  format: string;
  genre: string;
  announcementDate: string;
  onSaleDate: string;
  previewStart: string;
  openingDate: string;
  closingDate: string;
  loadInStart: string;
  loadOutEnd: string;
  venueId: string;
  capacityPerShow: number;
  showsPerDay: number;
  runtimeMinutes: number;
  productionBudget: number;
  operatingBudgetWeekly: number;
  ticketPriceMin: number;
  ticketPriceMax: number;
  projectedGross: number;
  breakEvenPercentage: number;
  sponsorshipTarget: number;
  blueprintId?: string;
}

const PRODUCTION_FORMATS = [
  { value: 'immersive', label: 'Immersive Experience' },
  { value: 'festival', label: 'Festival' },
  { value: 'activation', label: 'Brand Activation' },
  { value: 'installation', label: 'Installation' },
  { value: 'theater', label: 'Theater' },
  { value: 'concert', label: 'Concert' },
  { value: 'conference', label: 'Conference' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'private', label: 'Private Event' },
  { value: 'other', label: 'Other' },
];

export default function NewProductionPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductionFormData>({
    title: '',
    tagline: '',
    description: '',
    format: '',
    genre: '',
    announcementDate: '',
    onSaleDate: '',
    previewStart: '',
    openingDate: '',
    closingDate: '',
    loadInStart: '',
    loadOutEnd: '',
    venueId: '',
    capacityPerShow: 0,
    showsPerDay: 1,
    runtimeMinutes: 90,
    productionBudget: 0,
    operatingBudgetWeekly: 0,
    ticketPriceMin: 0,
    ticketPriceMax: 0,
    projectedGross: 0,
    breakEvenPercentage: 70,
    sponsorshipTarget: 0,
  });

  const updateField = (field: keyof ProductionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // RBAC: Check if user has permission to create productions
  const canCreateProduction = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/productions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create production');
      }

      const data = await response.json();
      toast.success('Production Created', `"${formData.title}" has been created successfully.`);
      router.push(`/p/${data.id}/overview`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error('Failed to Create Production', errorMessage,);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicsStep = () => (
    <Stack gap={6}>
      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={2}>
          <Label className="font-weight-semibold">Production Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter production title"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Format</Label>
          <Select
            value={formData.format}
            onChange={(e) => updateField('format', e.target.value)}
          >
            <option value="">Select format...</option>
            {PRODUCTION_FORMATS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </Stack>
      </Grid>

      <Stack gap={2}>
        <Label className="font-weight-semibold">Tagline</Label>
        <Input
          value={formData.tagline}
          onChange={(e) => updateField('tagline', e.target.value)}
          placeholder="A compelling one-liner"
        />
      </Stack>

      <Stack gap={2}>
        <Label className="font-weight-semibold">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe the production..."
          rows={4}
        />
      </Stack>

      <Stack gap={2}>
        <Label className="font-weight-semibold">Genre</Label>
        <Input
          value={formData.genre}
          onChange={(e) => updateField('genre', e.target.value)}
          placeholder="e.g., Horror, Comedy, Drama"
        />
      </Stack>
    </Stack>
  );

  const renderDatesStep = () => (
    <Stack gap={6}>
      <H3>Marketing Dates</H3>
      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={2}>
          <Label className="font-weight-semibold">Announcement Date</Label>
          <Input
            type="date"
            value={formData.announcementDate}
            onChange={(e) => updateField('announcementDate', e.target.value)}
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">On Sale Date</Label>
          <Input
            type="date"
            value={formData.onSaleDate}
            onChange={(e) => updateField('onSaleDate', e.target.value)}
          />
        </Stack>
      </Grid>

      <H3>Production Dates</H3>
      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={2}>
          <Label className="font-weight-semibold">Load-In Start</Label>
          <Input
            type="date"
            value={formData.loadInStart}
            onChange={(e) => updateField('loadInStart', e.target.value)}
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Preview Start</Label>
          <Input
            type="date"
            value={formData.previewStart}
            onChange={(e) => updateField('previewStart', e.target.value)}
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Opening Date</Label>
          <Input
            type="date"
            value={formData.openingDate}
            onChange={(e) => updateField('openingDate', e.target.value)}
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Closing Date</Label>
          <Input
            type="date"
            value={formData.closingDate}
            onChange={(e) => updateField('closingDate', e.target.value)}
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Load-Out End</Label>
          <Input
            type="date"
            value={formData.loadOutEnd}
            onChange={(e) => updateField('loadOutEnd', e.target.value)}
          />
        </Stack>
      </Grid>
    </Stack>
  );

  const renderVenueStep = () => (
    <Stack gap={6}>
      <Stack gap={2}>
        <Label className="font-weight-semibold">Venue</Label>
        <Select
          value={formData.venueId}
          onChange={(e) => updateField('venueId', e.target.value)}
        >
          <option value="">Select venue...</option>
          <option value="new">+ Add New Venue</option>
        </Select>
        <Body size="sm" className=" text-text-disabled">
          Select an existing venue or create a new one
        </Body>
      </Stack>

      <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
        <Stack gap={2}>
          <Label className="font-weight-semibold">Capacity Per Show</Label>
          <Input
            type="number"
            value={formData.capacityPerShow || ''}
            onChange={(e) => updateField('capacityPerShow', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Shows Per Day</Label>
          <Input
            type="number"
            value={formData.showsPerDay || ''}
            onChange={(e) => updateField('showsPerDay', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Runtime (minutes)</Label>
          <Input
            type="number"
            value={formData.runtimeMinutes || ''}
            onChange={(e) => updateField('runtimeMinutes', parseInt(e.target.value) || 90)}
            placeholder="90"
          />
        </Stack>
      </Grid>
    </Stack>
  );

  const renderBudgetStep = () => (
    <Stack gap={6}>
      <H3>Production Budget</H3>
      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={2}>
          <Label className="font-weight-semibold">Production Budget</Label>
          <Input
            type="number"
            value={formData.productionBudget || ''}
            onChange={(e) => updateField('productionBudget', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Weekly Operating Budget</Label>
          <Input
            type="number"
            value={formData.operatingBudgetWeekly || ''}
            onChange={(e) => updateField('operatingBudgetWeekly', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </Stack>
      </Grid>

      <H3>Revenue Projections</H3>
      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={2}>
          <Label className="font-weight-semibold">Ticket Price Min</Label>
          <Input
            type="number"
            value={formData.ticketPriceMin || ''}
            onChange={(e) => updateField('ticketPriceMin', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Ticket Price Max</Label>
          <Input
            type="number"
            value={formData.ticketPriceMax || ''}
            onChange={(e) => updateField('ticketPriceMax', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Projected Gross</Label>
          <Input
            type="number"
            value={formData.projectedGross || ''}
            onChange={(e) => updateField('projectedGross', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </Stack>
        <Stack gap={2}>
          <Label className="font-weight-semibold">Break-Even %</Label>
          <Input
            type="number"
            value={formData.breakEvenPercentage || ''}
            onChange={(e) => updateField('breakEvenPercentage', parseFloat(e.target.value) || 70)}
            placeholder="70"
          />
        </Stack>
      </Grid>

      <H3>Sponsorship</H3>
      <Stack gap={2}>
        <Label className="font-weight-semibold">Sponsorship Target</Label>
        <Input
          type="number"
          value={formData.sponsorshipTarget || ''}
          onChange={(e) => updateField('sponsorshipTarget', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
        />
      </Stack>
    </Stack>
  );

  const renderReviewStep = () => (
    <Stack gap={6}>
      <Card>
        <CardBody>
          <Stack gap={4}>
            <Stack direction="horizontal" className="items-center justify-between">
              <H3>{formData.title || 'Untitled Production'}</H3>
              <Badge variant="solid">{formData.format || 'No Format'}</Badge>
            </Stack>
            {formData.tagline && <Body className="text-text-disabled">{formData.tagline}</Body>}
          </Stack>
        </CardBody>
      </Card>

      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" className="items-center gap-2">
                <Calendar size={16} />
                <Label className="font-weight-semibold">Dates</Label>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Opening: {formData.openingDate || 'TBD'}</Body>
                <Body size="sm" className="">Closing: {formData.closingDate || 'TBD'}</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" className="items-center gap-2">
                <Users size={16} />
                <Label className="font-weight-semibold">Capacity</Label>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Per Show: {formData.capacityPerShow || 0}</Body>
                <Body size="sm" className="">Shows/Day: {formData.showsPerDay || 1}</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" className="items-center gap-2">
                <DollarSign size={16} />
                <Label className="font-weight-semibold">Budget</Label>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Production: ${formData.productionBudget?.toLocaleString() || 0}</Body>
                <Body size="sm" className="">Weekly Ops: ${formData.operatingBudgetWeekly?.toLocaleString() || 0}</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" className="items-center gap-2">
                <Target size={16} />
                <Label className="font-weight-semibold">Revenue</Label>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Tickets: ${formData.ticketPriceMin} - ${formData.ticketPriceMax}</Body>
                <Body size="sm" className="">Projected: ${formData.projectedGross?.toLocaleString() || 0}</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );

  // Build wizard steps with content
  const wizardSteps: WizardStep[] = [
    { id: 'basics', label: 'Basic Info', content: renderBasicsStep() },
    { id: 'dates', label: 'Dates', content: renderDatesStep() },
    { id: 'venue', label: 'Venue', content: renderVenueStep() },
    { id: 'budget', label: 'Budget', content: renderBudgetStep() },
    { id: 'review', label: 'Review', content: renderReviewStep() },
  ];

  return (
    <WizardPage
      title="Create New Production"
      subtitle="Set up a new production from scratch or from a blueprint"
      breadcrumbs={[
        { label: 'Productions', href: '/productions' },
        { label: 'New Production' },
      ]}
      steps={wizardSteps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSubmit={handleSubmit}
      submitLabel="Create Production"
      isSubmitting={isSubmitting}
      allowStepNavigation={true}
      banner={{
        icon: <Sparkles className="text-primary" size={24} />,
        title: 'Start from AI Blueprint',
        description: 'Use the Experience Generator to create a production blueprint',
        action: {
          label: 'Open Generator',
          onClick: () => router.push('/generator'),
        },
      }}
      accessDenied={!canCreateProduction ? {
        title: 'Permission Required',
        description: 'You do not have permission to create productions. This action requires ATLVS Team Member or higher role.',
        action: { label: 'Back to Productions', onClick: () => router.push('/productions') },
      } : undefined}
    />
  );
}
