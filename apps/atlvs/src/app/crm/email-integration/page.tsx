"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface EmailAccount {
  id: string;
  email: string;
  provider: "Gmail" | "Outlook" | "Exchange";
  status: "Connected" | "Disconnected" | "Syncing";
  lastSync: string;
  autoLog: boolean;
}

interface EmailThread {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  preview: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: "Unread" | "Read" | "Replied";
}

const mockAccounts: EmailAccount[] = [
  { id: "EA-001", email: "john.smith@company.com", provider: "Gmail", status: "Connected", lastSync: "2 min ago", autoLog: true },
  { id: "EA-002", email: "sales@company.com", provider: "Outlook", status: "Connected", lastSync: "5 min ago", autoLog: true },
];

const mockEmails: EmailThread[] = [
  { id: "EM-001", subject: "Re: Summer Festival Proposal", from: "client@festival.com", to: "john.smith@company.com", date: "2024-11-25 10:30", preview: "Thanks for sending over the proposal. We've reviewed it and have a few questions...", linkedContact: "Festival Productions", linkedDeal: "Summer Fest 2025", status: "Unread" },
  { id: "EM-002", subject: "Equipment Quote Request", from: "vendor@audiohouse.com", to: "john.smith@company.com", date: "2024-11-25 09:15", preview: "Please find attached our quote for the L-Acoustics system rental...", linkedContact: "Audio House Inc", status: "Read" },
  { id: "EM-003", subject: "Contract Review - Corporate Gala", from: "legal@techcorp.com", to: "sales@company.com", date: "2024-11-24 16:45", preview: "Our legal team has completed the review. Please see the attached redlines...", linkedContact: "Tech Corp", linkedDeal: "Corporate Gala 2024", status: "Replied" },
  { id: "EM-004", subject: "Meeting Confirmation", from: "assistant@venue.com", to: "john.smith@company.com", date: "2024-11-24 14:20", preview: "This confirms your site visit scheduled for November 28th at 2:00 PM...", linkedContact: "Grand Arena", status: "Read" },
];

export default function EmailIntegrationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailThread | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const unreadCount = mockEmails.filter(e => e.status === "Unread").length;
  const linkedCount = mockEmails.filter(e => e.linkedContact || e.linkedDeal).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Connected": return "text-green-400";
      case "Disconnected": return "text-red-400";
      case "Syncing": return "text-yellow-400";
      case "Unread": return "text-blue-400";
      case "Read": return "text-ink-400";
      case "Replied": return "text-green-400";
      default: return "text-ink-400";
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "Gmail": return "📧";
      case "Outlook": return "📬";
      case "Exchange": return "📨";
      default: return "✉️";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Email Integration</H1>
            <Label className="text-ink-400">Connect email accounts and auto-log communications to CRM</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Connected Accounts" value={mockAccounts.filter(a => a.status === "Connected").length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Unread Emails" value={unreadCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Auto-Logged" value={linkedCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Today's Emails" value={mockEmails.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "inbox"} onClick={() => setActiveTab("inbox")}>Inbox</Tab>
              <Tab active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")}>Accounts</Tab>
              <Tab active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</Tab>
            </TabsList>

            <TabPanel active={activeTab === "inbox"}>
              <Stack gap={4}>
                {mockEmails.map((email) => (
                  <Card key={email.id} className={`border-2 ${email.status === "Unread" ? "border-blue-800 bg-blue-900/10" : "border-ink-800 bg-ink-900/50"} p-4 cursor-pointer hover:border-white`} onClick={() => setSelectedEmail(email)}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Label className={email.status === "Unread" ? "text-white font-bold" : "text-white"}>{email.from}</Label>
                        <Label size="xs" className="text-ink-500">{email.date}</Label>
                      </Stack>
                      <Stack gap={1} className="col-span-2">
                        <Label className={email.status === "Unread" ? "text-white font-bold" : "text-ink-300"}>{email.subject}</Label>
                        <Label size="xs" className="text-ink-500 truncate">{email.preview}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        {email.linkedContact && <Badge variant="outline">{email.linkedContact}</Badge>}
                      </Stack>
                      {email.linkedDeal && <Badge variant="solid">{email.linkedDeal}</Badge>}
                      <Label className={getStatusColor(email.status)}>{email.status}</Label>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "accounts"}>
              <Stack gap={4}>
                {mockAccounts.map((account) => (
                  <Card key={account.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Label className="text-2xl">{getProviderIcon(account.provider)}</Label>
                        <Stack gap={1}>
                          <Label className="text-white">{account.email}</Label>
                          <Badge variant="outline">{account.provider}</Badge>
                        </Stack>
                      </Stack>
                      <Label className={getStatusColor(account.status)}>{account.status}</Label>
                      <Label className="text-ink-400">Last sync: {account.lastSync}</Label>
                      <Label className={account.autoLog ? "text-green-400" : "text-ink-500"}>
                        Auto-log: {account.autoLog ? "On" : "Off"}
                      </Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">Settings</Button>
                        <Button variant="ghost" size="sm" className="text-red-400">Disconnect</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
                <Button variant="outlineWhite" onClick={() => setShowConnectModal(true)}>+ Connect Account</Button>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "settings"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={6}>
                  <H3>Email Logging Settings</H3>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Label className="text-white">Auto-log all emails</Label>
                        <Label size="xs" className="text-ink-400">Automatically log emails to matching contacts</Label>
                      </Stack>
                      <Button variant="solid" size="sm">Enabled</Button>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Label className="text-white">Link to deals</Label>
                        <Label size="xs" className="text-ink-400">Associate emails with active deals when possible</Label>
                      </Stack>
                      <Button variant="solid" size="sm">Enabled</Button>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Label className="text-white">Track email opens</Label>
                        <Label size="xs" className="text-ink-400">Track when recipients open your emails</Label>
                      </Stack>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/contacts")}>Contacts</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/deals")}>Deals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedEmail} onClose={() => setSelectedEmail(null)}>
        <ModalHeader><H3>{selectedEmail?.subject}</H3></ModalHeader>
        <ModalBody>
          {selectedEmail && (
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">From</Label><Label className="text-white">{selectedEmail.from}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">To</Label><Label className="text-white">{selectedEmail.to}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Date</Label><Label className="text-white">{selectedEmail.date}</Label></Stack>
              <Card className="p-4 border border-ink-700 bg-ink-800">
                <Body className="text-ink-200">{selectedEmail.preview}</Body>
              </Card>
              {(selectedEmail.linkedContact || selectedEmail.linkedDeal) && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Linked Records</Label>
                  <Stack direction="horizontal" gap={2}>
                    {selectedEmail.linkedContact && <Badge variant="outline">{selectedEmail.linkedContact}</Badge>}
                    {selectedEmail.linkedDeal && <Badge variant="solid">{selectedEmail.linkedDeal}</Badge>}
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedEmail(null)}>Close</Button>
          <Button variant="outline">Link to Contact</Button>
          <Button variant="solid">Reply</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showConnectModal} onClose={() => setShowConnectModal(false)}>
        <ModalHeader><H3>Connect Email Account</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Label className="text-ink-400">Select your email provider to connect</Label>
            <Grid cols={3} gap={4}>
              {[{ name: "Gmail", icon: "📧" }, { name: "Outlook", icon: "📬" }, { name: "Exchange", icon: "📨" }].map((provider) => (
                <Card key={provider.name} className="p-6 border-2 border-ink-700 cursor-pointer hover:border-white text-center">
                  <Stack gap={2}>
                    <Label className="text-4xl">{provider.icon}</Label>
                    <Label className="text-white">{provider.name}</Label>
                  </Stack>
                </Card>
              ))}
            </Grid>
            <Alert variant="info">You will be redirected to authorize access to your email account</Alert>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowConnectModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
