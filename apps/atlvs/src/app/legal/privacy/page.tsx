"use client";

/**
 * Privacy Policy Page
 * Privacy policy document
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Shield, List, Download } from "lucide-react";
import {
  Body,
  Button,
  Card,
  DetailPage,
  Section,
} from "@ghxstship/ui";

const SECTIONS = [
  { id: "collection", title: "1. Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, and any other information you choose to provide." },
  { id: "use", title: "2. How We Use Your Information", content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience. We may also use the information to send you updates and marketing communications." },
  { id: "sharing", title: "3. Information Sharing", content: "We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share information with trusted third parties who assist us in operating our website and conducting our business." },
  { id: "security", title: "4. Data Security", content: "We implement a variety of security measures to maintain the safety of your personal information. All data is encrypted in transit and at rest. We are SOC 2 Type II certified and undergo regular security audits." },
  { id: "rights", title: "5. Your Rights", content: "You have the right to access, correct, or delete your personal information. You can also object to processing, request data portability, and withdraw consent at any time. Contact us to exercise these rights." },
  { id: "cookies", title: "6. Cookies", content: "We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent." },
  { id: "changes", title: "7. Changes to This Policy", content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'last updated' date." },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "privacy",
      label: "Privacy Policy",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-weight-bold">Privacy Policy</Body>
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
            <Body className="font-weight-bold mb-2">Privacy Questions?</Body>
            <Body className="text-grey-400 mb-4">Contact our privacy team for any questions about how we handle your data.</Body>
            <Button variant="outline" onClick={() => router.push("/contact")}>Contact Us</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Legal", title: "Privacy Policy", description: "How we collect, use, and protect your information" }}
      backButton={{ label: "Legal", href: "/legal" }}
      tabs={tabs}
    />
  );
}
