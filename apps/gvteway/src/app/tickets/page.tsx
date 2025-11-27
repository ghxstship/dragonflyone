"use client";

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
  Badge,
  Card,
  SectionLayout,
  LoadingSpinner,
  EmptyState,
  Container,
  Stack,
  Grid,
  Link,
} from "@ghxstship/ui";
import { useTickets } from "@/hooks/useTickets";

export default function TicketsPage() {
  const router = useRouter();
  const { data: tickets, isLoading, refetch } = useTickets();

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-600">Home</Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-600">Events</Link>
          <Link href="/tickets" className="font-heading text-body-sm uppercase tracking-widest text-white">Tickets</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/orders">Orders</FooterLink>
            <FooterLink href="/tickets">Tickets</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="lg">
          <Stack gap={8}>
            <H2 className="text-white">My Tickets</H2>

            {isLoading ? (
              <Container className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading tickets..." />
              </Container>
            ) : tickets && tickets.length > 0 ? (
              <Stack gap={6}>
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="border-2 border-grey-800 p-6 bg-black">
                    <Stack gap={4}>
                      <Stack gap={2} direction="horizontal" className="justify-between items-start">
                        <Stack gap={3}>
                          <Stack gap={1}>
                            <H3 className="text-white">{ticket.event?.name || 'Event'}</H3>
                            <Body className="text-grey-600">{ticket.event?.venue || 'Venue'}</Body>
                          </Stack>
                          <Grid cols={2} gap={2}>
                            <Stack gap={1} direction="horizontal">
                              <Body className="text-grey-500 text-body-sm">Date:</Body>
                              <Body className="text-white text-body-sm">{ticket.event?.start_date ? new Date(ticket.event.start_date).toLocaleDateString() : 'TBD'}</Body>
                            </Stack>
                            <Stack gap={1} direction="horizontal">
                              <Body className="text-grey-500 text-body-sm">Section:</Body>
                              <Body className="text-white text-body-sm">{ticket.ticket_type?.name || 'General'}</Body>
                            </Stack>
                            <Stack gap={1} direction="horizontal">
                              <Body className="text-grey-500 text-body-sm">Seat:</Body>
                              <Body className="text-white text-body-sm">{ticket.seat_number || 'General Admission'}</Body>
                            </Stack>
                            <Stack gap={1} direction="horizontal">
                              <Body className="text-grey-500 text-body-sm">Ticket ID:</Body>
                              <Body className="font-mono text-white text-body-sm">{ticket.id.substring(0, 12).toUpperCase()}</Body>
                            </Stack>
                          </Grid>
                        </Stack>
                        <Stack gap={3} className="text-right items-end">
                          <Badge variant="solid">{ticket.status.toUpperCase()}</Badge>
                          <Card className="w-32 h-32 border-2 border-white bg-white p-2">
                            <Body className="w-full h-full bg-black/10 flex items-center justify-center text-[8px] font-mono">
                              {ticket.qr_code}
                            </Body>
                          </Card>
                        </Stack>
                      </Stack>
                      <Stack gap={3} direction="horizontal">
                        <Button variant="solid" size="sm" onClick={() => window.location.href = `/tickets/${ticket.id}/qr`}>View QR Code</Button>
                        <Button variant="outline" size="sm" onClick={() => window.location.href = `/tickets/${ticket.id}/transfer`}>Transfer</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <EmptyState
                title="No Tickets Found"
                description="You don't have any tickets yet"
                action={{ label: "Browse Events", onClick: () => window.location.href = '/events' }}
              />
            )}
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
