"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Badge,
  Card,
  SectionLayout,
  StatCard,
  Container,
  Stack,
  Grid,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Link,
} from "@ghxstship/ui";

const paymentMethods = [
  { id: "PM-001", type: "Credit Card", brand: "Visa", last4: "4242", expiry: "12/2025", isDefault: true },
  { id: "PM-002", type: "Credit Card", brand: "Mastercard", last4: "8888", expiry: "06/2026", isDefault: false },
];

const transactionHistory = [
  { id: "TXN-12345", date: "2024-11-20", description: "Ultra Music Festival 2024 - GA Ticket", amount: -450, status: "Completed" },
  { id: "TXN-12344", date: "2024-11-18", description: "Refund - Rolling Loud", amount: 120, status: "Completed" },
  { id: "TXN-12343", date: "2024-11-15", description: "Art Basel VIP Pass", amount: -250, status: "Completed" },
];

export default function WalletPage() {
  const router = useRouter();
  const [showAddCard, setShowAddCard] = useState(false);

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
        >
          <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright=" 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/wallet">Wallet</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="lg">
          <Stack gap={8}>
            <H2 className="text-white">Wallet & Payment Methods</H2>

            <Grid cols={3} gap={6}>
              <StatCard
                value="$0.00"
                label="Balance"
                className="bg-black text-white border-grey-800"
              />
              <StatCard
                value="$820"
                label="Total Spent"
                className="bg-black text-white border-grey-800"
              />
              <StatCard
                value={transactionHistory.length}
                label="Transactions"
                className="bg-black text-white border-grey-800"
              />
            </Grid>

            <Stack gap={4}>
              <Stack gap={2} direction="horizontal" className="justify-between items-center">
                <H3 className="text-white">Payment Methods</H3>
                <Button variant="outline" onClick={() => setShowAddCard(!showAddCard)}>
                  {showAddCard ? "Cancel" : "Add Card"}
                </Button>
              </Stack>

              {showAddCard && (
                <Card className="border-2 border-grey-800 p-6 bg-black">
                  <Stack gap={4}>
                    <Input type="text" placeholder="Card Number" className="bg-black text-white border-grey-700" />
                    <Grid cols={2} gap={4}>
                      <Input type="text" placeholder="MM/YY" className="bg-black text-white border-grey-700" />
                      <Input type="text" placeholder="CVV" className="bg-black text-white border-grey-700" />
                    </Grid>
                    <Input type="text" placeholder="Cardholder Name" className="bg-black text-white border-grey-700" />
                    <Button variant="solid" onClick={() => { alert('Card saved!'); setShowAddCard(false); }}>Save Card</Button>
                  </Stack>
                </Card>
              )}

              {paymentMethods.map((method) => (
                <Card key={method.id} className="border-2 border-grey-800 p-6 bg-black">
                  <Stack gap={2} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Stack gap={3} direction="horizontal" className="items-center">
                        <Body className="font-heading text-lg uppercase text-white">{method.brand} •••• {method.last4}</Body>
                        {method.isDefault && <Badge>Default</Badge>}
                      </Stack>
                      <Body className="font-mono text-sm text-grey-400">Expires {method.expiry}</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      {!method.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => alert(`Set ${method.brand} as default`)}>Set Default</Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-grey-400" onClick={() => alert(`Remove ${method.brand}?`)}>Remove</Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Stack gap={4}>
              <H3 className="text-white">Transaction History</H3>
              <Table variant="bordered" className="bg-black">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistory.map((txn) => (
                    <TableRow key={txn.id} className="bg-black text-white">
                      <TableCell className="font-mono text-grey-400">{txn.date}</TableCell>
                      <TableCell className="text-white">{txn.description}</TableCell>
                      <TableCell className={`font-mono ${txn.amount > 0 ? 'text-white' : 'text-white'}`}>
                        {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="solid">{txn.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
