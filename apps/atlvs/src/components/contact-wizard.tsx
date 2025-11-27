"use client";

import { useState } from "react";
import { Card, Stack, Grid, Label, H3, Body, Button, Input, Textarea, Alert } from "@ghxstship/ui";

const wizardSteps = [
  {
    id: "brief",
    title: "Engagement Brief",
    description: "Capture entity, project intent, and operating timeline.",
    fields: [
      {
        id: "organization",
        label: "Organization",
        type: "text",
        placeholder: "GHXSTSHIP Industries",
        hint: "Who owns the initiative?",
      },
      {
        id: "initiative",
        label: "Initiative",
        type: "text",
        placeholder: "Immersive global tour",
        hint: "Name or codename for quick reference.",
      },
      {
        id: "timeline",
        label: "Timeline",
        type: "text",
        placeholder: "Q1 2026",
        hint: "Share target launch window.",
      },
    ],
  },
  {
    id: "ops",
    title: "Operational Scope",
    description: "Define assets, crew, and platform touchpoints.",
    fields: [
      {
        id: "assets",
        label: "Asset Requirements",
        type: "textarea",
        placeholder: "Staging, LED, kinetic rigging",
        hint: "Call out any specialty equipment or logistics.",
      },
      {
        id: "crew",
        label: "Crew Disciplines",
        type: "textarea",
        placeholder: "Production mgmt, TD, LD, video",
        hint: "Roles + certifications we should assign.",
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance + Access",
    description: "Lock NDA, security tier, and escalation contacts.",
    fields: [
      {
        id: "nda",
        label: "NDA Status",
        type: "text",
        placeholder: "Signed 11/2025",
        hint: "Reference date + doc store link.",
      },
      {
        id: "security",
        label: "Security Tier",
        type: "text",
        placeholder: "Legend Admin",
        hint: "Legend-level access required?",
      },
      {
        id: "contact",
        label: "Primary Contact",
        type: "text",
        placeholder: "legend@ghxstship.pro",
        hint: "Escalation email or hotline.",
      },
    ],
  },
];

export function ContactWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    wizardSteps.forEach((step) => {
      step.fields.forEach((field) => {
        initial[field.id] = "";
      });
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<"idle" | "success">("idle");

  const step = wizardSteps[activeStep];
  const isLast = activeStep === wizardSteps.length - 1;

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    step.fields.forEach((field) => {
      if (!formData[field.id]?.trim()) {
        nextErrors[field.id] = "Required";
      }
    });
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
    if (submissionState === "success") {
      setSubmissionState("idle");
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (isLast) {
      setSubmissionState("success");
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Card className="p-8">
      <Stack gap={8}>
        <Stack gap={4}>
          <Label className="font-code text-mono-xs uppercase tracking-display text-ink-400">Multi-Step Wizard</Label>
          <Grid cols={3} gap={3}>
            {wizardSteps.map((item, index) => (
              <Button
                key={item.id}
                variant={index === activeStep ? "solid" : "outline"}
                onClick={() => setActiveStep(index)}
                className="flex flex-col items-start px-4 py-3 text-left h-auto"
              >
                <Label className="font-code text-mono-xs uppercase tracking-display">0{index + 1}</Label>
                <Body className="font-display text-h5-md">{item.title}</Body>
              </Button>
            ))}
          </Grid>
        </Stack>

        <form>
          <Stack gap={6}>
            <Stack>
              <H3 className="text-h5-md uppercase">{step.title}</H3>
              <Body className="mt-2 text-body-sm text-ink-300">{step.description}</Body>
            </Stack>

            <Stack gap={4}>
              {step.fields.map((field) => (
                <Stack key={field.id} gap={2}>
                  <Label className="text-mono-xs uppercase tracking-kicker text-ink-400">
                    {field.label}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      placeholder={field.placeholder}
                      rows={3}
                      value={formData[field.id]}
                      onChange={(event) => handleChange(field.id, event.target.value)}
                    />
                  ) : (
                    <Input
                      placeholder={field.placeholder}
                      type="text"
                      value={formData[field.id]}
                      onChange={(event) => handleChange(field.id, event.target.value)}
                    />
                  )}
                  <Body className="text-micro uppercase tracking-kicker text-ink-500">
                    {errors[field.id] ? (
                      <Body className="text-ink-50">{errors[field.id]}</Body>
                    ) : (
                      field.hint
                    )}
                  </Body>
                </Stack>
              ))}
            </Stack>

            {submissionState === "success" ? (
              <Alert variant="success">
                Brief captured. Legend support will confirm next steps within 24 hours.
              </Alert>
            ) : null}

            <Stack direction="horizontal" gap={4} className="flex-col md:flex-row md:items-center md:justify-between">
              <Body className="text-mono-xs uppercase tracking-kicker text-ink-500">
                Step {activeStep + 1} of {wizardSteps.length}
              </Body>
              <Stack direction="horizontal" gap={3}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="solid"
                  onClick={handleNext}
                >
                  {isLast ? "Submit Brief" : "Next"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
