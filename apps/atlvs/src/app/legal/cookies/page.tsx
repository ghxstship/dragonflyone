"use client";

/**
 * Cookie Policy Page
 * Cookie usage policy
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Cookie, List, Download } from "lucide-react";
import {
  Body,
  Button,
  Card,
  DetailPage,
  Section,
} from "@ghxstship/ui";

const SECTIONS = [
  { id: "what", title: "1. What Are Cookies", content: "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site." },
  { id: "types", title: "2. Types of Cookies We Use", content: "We use essential cookies for site functionality, analytics cookies to understand how visitors use our site, and preference cookies to remember your settings. We may also use marketing cookies to deliver relevant advertisements." },
  { id: "essential", title: "3. Essential Cookies", content: "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms." },
  { id: "analytics", title: "4. Analytics Cookies", content: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site." },
  { id: "manage", title: "5. Managing Cookies", content: "You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly." },
  { id: "updates", title: "6. Updates to This Policy", content: "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we post changes to this policy, we will revise the 'last updated' date at the top of this policy." },
];

export default function CookiePolicyPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "cookies",
      label: "Cookie Policy",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-weight-bold">Cookie Policy</Body>
                <Body size="sm" className="text-grey-400">Last updated: November 15, 2024</Body>
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
            <Body className="font-weight-bold mb-2">Cookie Preferences</Body>
            <Body className="text-grey-400 mb-4">You can manage your cookie preferences at any time.</Body>
            <Button variant="outline">Manage Preferences</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Legal", title: "Cookie Policy", description: "How we use cookies and similar technologies" }}
      backButton={{ label: "Legal", href: "/legal" }}
      tabs={tabs}
    />
  );
}
