"use client";

/**
 * Terms of Service Page
 * Terms and conditions
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { FileText, List, Download } from "lucide-react";
import {
  Body,
  Button,
  Card,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using ATLVS, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site." },
  { id: "use", title: "2. Use License", content: "Permission is granted to temporarily access the materials on ATLVS for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title." },
  { id: "disclaimer", title: "3. Disclaimer", content: "The materials on ATLVS are provided on an 'as is' basis. ATLVS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights." },
  { id: "limitations", title: "4. Limitations", content: "In no event shall ATLVS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ATLVS." },
  { id: "revisions", title: "5. Revisions", content: "ATLVS may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service." },
  { id: "governing", title: "6. Governing Law", content: "These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location." },
];

export default function TermsPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "terms",
      label: "Terms of Service",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-weight-bold">Terms of Service</Body>
                <Body size="sm" className="text-grey-400">Last updated: December 1, 2024</Body>
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
            <Body className="font-weight-bold mb-2">Questions?</Body>
            <Body className="text-grey-400 mb-4">Contact our legal team if you have any questions about these terms.</Body>
            <Button variant="outline" onClick={() => router.push("/contact")}>Contact Us</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Legal", title: "Terms of Service", description: "Please read these terms carefully before using ATLVS" }}
      backButton={{ label: "Legal", href: "/legal" }}
      tabs={tabs}
    />
  );
}
