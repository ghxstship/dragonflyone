'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Input,
  Label,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Code, ExternalLink, Palette } from 'lucide-react';
import { useLeadForm } from '@/hooks/useLeadForms';

type EmbedType = 'inline' | 'popup' | 'slide-in';

export default function LeadFormEmbedPage() {
  const params = useParams();
  const formId = params.id as string;

  const { data: form, isLoading } = useLeadForm(formId);
  const [embedType, setEmbedType] = useState<EmbedType>('inline');
  const [copied, setCopied] = useState(false);
  const [buttonText, setButtonText] = useState('Open Form');
  const [buttonColor, setButtonColor] = useState('#6366f1');

  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const formUrl = `${baseUrl}/f/${form?.slug}`;

    switch (embedType) {
      case 'inline':
        return `<!-- Lead Form Embed: ${form?.name} -->
<iframe
  src="${formUrl}?embed=true"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; max-width: 600px;"
  title="${form?.name}"
></iframe>`;

      case 'popup':
        return `<!-- Lead Form Popup: ${form?.name} -->
<script>
  window.openLeadForm = function() {
    window.open(
      '${formUrl}?popup=true',
      'leadForm',
      'width=500,height=700,scrollbars=yes'
    );
  };
</script>
<Button
  onclick="openLeadForm()"
  style="background: ${buttonColor}; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;"
>
  ${buttonText}
</Button>`;

      case 'slide-in':
        return `<!-- Lead Form Slide-in: ${form?.name} -->
<script src="${baseUrl}/embed/slide-in.js"></script>
<script>
  LeadFormSlideIn.init({
    formId: '${formId}',
    slug: '${form?.slug}',
    position: 'right',
    buttonText: '${buttonText}',
    buttonColor: '${buttonColor}'
  });
</script>`;

      default:
        return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/lead-forms/${formId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Embed Form</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {form?.name}
            </Body>
          </div>
        </div>
        <Link
          href={`/f/${form?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <Text className="text-body-sm">Preview Form</Text>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Embed Type</H2>
            <div className="grid grid-cols-3 gap-4">
              {([
                { id: 'inline', label: 'Inline', description: 'Embed directly on your page' },
                { id: 'popup', label: 'Popup', description: 'Open in a popup window' },
                { id: 'slide-in', label: 'Slide-in', description: 'Slide in from the side' },
              ] as const).map((type) => (
                <Button
                  key={type.id}
                  onClick={() => setEmbedType(type.id)}
                  className={`p-4 rounded-card border-2 text-left transition-colors ${
                    embedType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <Body className="text-body-sm font-weight-medium text-foreground">{type.label}</Body>
                  <Body className="text-body-xs text-muted-foreground mt-1">{type.description}</Body>
                </Button>
              ))}
            </div>
          </div>

          {embedType !== 'inline' && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Button Customization
              </H2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Button Text
                  </Label>
                  <Input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Button Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-10 h-10 rounded border-2 border-border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary font-mono text-body-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Body className="text-body-sm text-muted-foreground mb-2">Preview:</Body>
                <Button
                  style={{ backgroundColor: buttonColor }}
                  className="text-white px-6 py-3 rounded-button font-weight-medium"
                >
                  {buttonText}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center justify-between mb-4">
              <H2 className="text-h4-md font-weight-semibold text-foreground flex items-center gap-2">
                <Code className="h-5 w-5" />
                Embed Code
              </H2>
              <Button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 bg-success-100 text-success-800" />
                    <Text className="text-body-sm text-success-800">Copied!</Text>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <Text className="text-body-sm">Copy Code</Text>
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-card overflow-x-auto text-body-xs font-mono text-foreground">
              {getEmbedCode()}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Direct Links</H2>
            <div className="space-y-4">
              <div>
                <Body className="text-body-sm font-weight-medium text-foreground mb-1">Form URL</Body>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-body-xs font-mono truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/f/${form?.slug}` : ''}
                  </code>
                  <Button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${form?.slug}`)}
                    className="p-2 hover:bg-muted rounded-button transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Body className="text-body-sm font-weight-medium text-foreground mb-1">QR Code</Body>
                <div className="bg-muted rounded-card p-4 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded flex items-center justify-center">
                    <Text className="text-body-xs text-muted-foreground">QR Code</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Instructions</H2>
            <div className="space-y-3 text-body-sm text-muted-foreground">
              <Body>1. Choose an embed type above</Body>
              <Body>2. Customize the button (if applicable)</Body>
              <Body>3. Copy the embed code</Body>
              <Body>4. Paste it into your website&apos;s HTML</Body>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
