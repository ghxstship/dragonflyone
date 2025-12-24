'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, GripVertical, Eye, Save } from 'lucide-react';
import { useCreateLeadForm, type LeadFormField } from '@/hooks/useLeadForms';

const FIELD_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'textarea', label: 'Text Area' },
  { id: 'select', label: 'Dropdown' },
  { id: 'date', label: 'Date' },
  { id: 'number', label: 'Number' },
  { id: 'checkbox', label: 'Checkbox' },
] as const;

export default function NewLeadFormPage() {
  const router = useRouter();
  const createForm = useCreateLeadForm();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [fields, setFields] = useState<LeadFormField[]>([
    {
      id: 'field-1',
      type: 'text',
      label: 'Full Name',
      name: 'full_name',
      required: true,
      placeholder: 'Enter your name',
      order_index: 0,
    },
    {
      id: 'field-2',
      type: 'email',
      label: 'Email Address',
      name: 'email',
      required: true,
      placeholder: 'Enter your email',
      order_index: 1,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'name' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const addField = () => {
    const newField: LeadFormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      name: `field_${fields.length + 1}`,
      required: false,
      placeholder: '',
      order_index: fields.length,
    };
    setFields((prev) => [...prev, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<LeadFormField>) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (fieldId: string) => {
    setFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Form name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    }
    if (fields.length === 0) {
      newErrors.fields = 'Add at least one field';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await createForm.mutateAsync({
        organization_id: '', // Will be set by backend
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        fields,
        active: true,
      });
      router.push(`/lead-forms/${result.id}`);
    } catch (error) {
      setErrors({ submit: 'Failed to create form' });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/lead-forms"
                className="p-2 hover:bg-muted rounded-button transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <H1 className="text-h3-md font-weight-bold text-foreground">Create Lead Form</H1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                <Eye className="h-4 w-4" />
                <Text className="text-body-sm">Preview</Text>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createForm.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <Text className="text-body-sm font-weight-medium">
                  {createForm.isPending ? 'Creating...' : 'Create Form'}
                </Text>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Form Details</H2>
              <div className="space-y-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Form Name *
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Wedding Inquiry"
                    className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                      errors.name ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.name && (
                    <Body className="text-body-xs text-destructive mt-1">{errors.name}</Body>
                  )}
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    URL Slug *
                  </Label>
                  <div className="flex items-center">
                    <Text className="px-3 py-2 bg-muted border-2 border-r-0 border-border rounded-l-button text-body-sm text-muted-foreground">
                      /f/
                    </Text>
                    <Input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="wedding-inquiry"
                      className={`flex-1 px-4 py-2 border-2 rounded-r-button focus:outline-none focus:border-primary ${
                        errors.slug ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.slug && (
                    <Body className="text-body-xs text-destructive mt-1">{errors.slug}</Body>
                  )}
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Description
                  </Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Brief description of this form..."
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center justify-between mb-4">
                <H2 className="text-h4-md font-weight-semibold text-foreground">Form Fields</H2>
                <Button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-2 px-3 py-1.5 text-body-sm text-primary border-2 border-primary rounded-button hover:bg-primary/5 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>
              {errors.fields && (
                <Body className="text-body-sm text-destructive mb-4">{errors.fields}</Body>
              )}
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-4 bg-muted/30 border-2 border-border rounded-card"
                  >
                    <div className="p-1 cursor-move text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Label"
                        className="px-3 py-1.5 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                      />
                      <Select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as LeadFormField['type'] })}
                        className="px-3 py-1.5 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </Select>
                      <div className="flex items-center gap-2">
                        <Label className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
                          <Input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Required
                        </Label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Preview</H2>
              <div className="border-2 border-dashed border-border rounded-card p-4 bg-muted/20">
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                        {field.label}
                        {field.required && <Text className="text-destructive ml-1">*</Text>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                          rows={3}
                          disabled
                        />
                      ) : field.type === 'select' ? (
                        <Select className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm" disabled>
                          <option>Select...</option>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                          disabled
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    disabled
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-button opacity-75"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Settings</H2>
              <Body className="text-body-sm text-muted-foreground">
                Configure notifications, auto-responses, and styling after creating the form.
              </Body>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="mt-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <Body className="text-body-sm text-destructive">{errors.submit}</Body>
          </div>
        )}
      </div>
    </div>
  );
}
