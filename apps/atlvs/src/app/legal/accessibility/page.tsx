"use client";

/**
 * Accessibility Statement Page
 * Accessibility commitment
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Users, List, Download } from "lucide-react";
import {
  Body,
  Button,
  Card,
  DetailPage,
  Section,
} from "@ghxstship/ui";

const SECTIONS = [
  { id: "commitment", title: "Our Commitment", content: "ATLVS is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards." },
  { id: "standards", title: "Conformance Status", content: "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone." },
  { id: "features", title: "Accessibility Features", content: "Our platform includes keyboard navigation support, screen reader compatibility, sufficient color contrast, resizable text, alternative text for images, and clear focus indicators." },
  { id: "feedback", title: "Feedback", content: "We welcome your feedback on the accessibility of ATLVS. Please let us know if you encounter accessibility barriers. We take accessibility issues seriously and will work to address them promptly." },
  { id: "contact", title: "Contact Us", content: "If you have specific questions or concerns about the accessibility of this site, please contact us at accessibility@atlvs.com. We will work with you to provide the information or service you need through an alternative communication method." },
];

export default function AccessibilityPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "accessibility",
      label: "Accessibility",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-weight-bold">Accessibility Statement</Body>
                <Body size="sm" className="text-grey-400">Last updated: October 1, 2024</Body>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </div>
          </Card>

          <div className="space-y-6">
            {SECTIONS.map((section) => (
              <Card key={section.id} className="p-6">
                <Body className="font-weight-bold font-weight-medium mb-4">{section.title}</Body>
                <Body className="text-grey-300 leading-relaxed">{section.content}</Body>
              </Card>
            ))}
          </div>

          <Card className="p-6 mt-6">
            <Body className="font-weight-bold mb-2">Report an Accessibility Issue</Body>
            <Body className="text-grey-400 mb-4">Help us improve by reporting any accessibility barriers you encounter.</Body>
            <Button variant="outline" onClick={() => router.push("/contact")}>Report Issue</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Legal", title: "Accessibility Statement", description: "Our commitment to digital accessibility" }}
      backButton={{ label: "Legal", href: "/legal" }}
      tabs={tabs}
    />
  );
}
