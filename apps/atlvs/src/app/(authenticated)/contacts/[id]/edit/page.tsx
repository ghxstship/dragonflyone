'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  Input,
  Label,
} from '@ghxstship/ui';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Building2 } from 'lucide-react';
import { useContact, useUpdateContact } from '@/hooks/useContacts';

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const { data: contact, isLoading } = useContact(contactId);
  const updateContact = useUpdateContact();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        title: contact.title || '',
      });
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateContact.mutateAsync({
        id: contactId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        title: formData.title || undefined,
      });
      router.push(`/contacts/${contactId}`);
    } catch (error) {
      setErrors({ submit: 'Failed to update contact' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading contact...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/contacts/${contactId}`}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Edit Contact</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            {contact?.first_name} {contact?.last_name}
          </Body>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </H2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                First Name *
              </Label>
              <Input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.first_name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.first_name && (
                <Body className="text-body-xs text-destructive mt-1">{errors.first_name}</Body>
              )}
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Last Name *
              </Label>
              <Input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.last_name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.last_name && (
                <Body className="text-body-xs text-destructive mt-1">{errors.last_name}</Body>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </H2>
          <div className="space-y-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Email *
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.email ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.email && (
                <Body className="text-body-xs text-destructive mt-1">{errors.email}</Body>
              )}
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Phone
              </Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </H2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Company
              </Label>
              <Input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Job Title
              </Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <Body className="text-body-sm text-destructive">{errors.submit}</Body>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/contacts/${contactId}`}
            className="px-6 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={updateContact.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateContact.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
