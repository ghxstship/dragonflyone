'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

interface GiftCard {
  id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  status: 'active' | 'redeemed' | 'expired';
  expires_at?: string;
  purchased_at: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
}

const GIFT_CARD_AMOUNTS = [25, 50, 75, 100, 150, 200, 250, 500];

const GIFT_CARD_DESIGNS = [
  { id: 'classic', name: 'Classic Black', color: 'bg-black' },
  { id: 'concert', name: 'Concert Vibes', color: 'bg-purple-600' },
  { id: 'festival', name: 'Festival Fun', color: 'bg-gradient-to-r from-pink-500 to-yellow-500' },
  { id: 'sports', name: 'Game Day', color: 'bg-success-600' },
  { id: 'theater', name: 'Theater Night', color: 'bg-error-800' },
];

export default function GiftCardsPage() {
  const _router = useRouter();
  const [myCards, setMyCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'redeem' | 'my-cards'>('buy');

  // Purchase form state
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('classic');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Redeem form state
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const fetchMyCards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gift-cards/my-cards');
      if (response.ok) {
        const data = await response.json();
        setMyCards(data.cards || []);
      }
    } catch (err) {
      console.error('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchasing(true);
    setError(null);

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

    if (amount < 10 || amount > 1000) {
      setError('Amount must be between $10 and $1,000');
      setPurchasing(false);
      return;
    }

    try {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          design: selectedDesign,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          message,
          delivery_date: deliveryDate || null,
        }),
      });

      if (response.ok) {
        setSuccess('Gift card purchased successfully!');
        setRecipientEmail('');
        setRecipientName('');
        setMessage('');
        setCustomAmount('');
        fetchMyCards();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to purchase gift card');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeeming(true);
    setError(null);

    try {
      const response = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Gift card redeemed! $${data.balance} added to your account.`);
        setRedeemCode('');
        fetchMyCards();
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid gift card code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setRedeeming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success-500 text-white">Active</Badge>;
      case 'redeemed':
        return <Badge className="bg-ink-500 text-white">Redeemed</Badge>;
      case 'expired':
        return <Badge className="bg-error-500 text-white">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Shop">
            <FooterLink href="/gift-cards">Gift Cards</FooterLink>
            <FooterLink href="/events">Events</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Perfect Gift</Kicker>
              <H2 size="lg" className="text-white">Gift Cards</H2>
              <Body className="text-on-dark-muted">Give the gift of experiences</Body>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-spacing-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-spacing-6">
            {success}
          </Alert>
        )}

        <Stack direction="horizontal" gap={2}>
          <Button
            variant={activeTab === 'buy' ? 'solid' : 'outlineInk'}
            inverted={activeTab === 'buy'}
            onClick={() => setActiveTab('buy')}
          >
            Buy Gift Card
          </Button>
          <Button
            variant={activeTab === 'redeem' ? 'solid' : 'outlineInk'}
            inverted={activeTab === 'redeem'}
            onClick={() => setActiveTab('redeem')}
          >
            Redeem Code
          </Button>
          <Button
            variant={activeTab === 'my-cards' ? 'solid' : 'outlineInk'}
            inverted={activeTab === 'my-cards'}
            onClick={() => setActiveTab('my-cards')}
          >
            My Gift Cards
          </Button>
        </Stack>

        {activeTab === 'buy' && (
          <Grid cols={2} gap={8}>
            <Stack gap={6}>
              <Card inverted className="p-6">
                <H3 className="mb-6 text-white">Select Amount</H3>
                <Grid cols={4} gap={3}>
                  {GIFT_CARD_AMOUNTS.map(amount => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !customAmount ? 'solid' : 'outlineInk'}
                      inverted={selectedAmount === amount && !customAmount}
                      onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                    >
                      ${amount}
                    </Button>
                  ))}
                </Grid>
                <Field label="Or enter custom amount" className="mt-4">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="$10 - $1,000"
                    min={10}
                    max={1000}
                    inverted
                  />
                </Field>
              </Card>

              <Card inverted className="p-6">
                <H3 className="mb-6 text-white">Choose Design</H3>
                <Grid cols={3} gap={3}>
                  {GIFT_CARD_DESIGNS.map(design => (
                    <Stack
                      key={design.id}
                      className={`h-20 cursor-pointer rounded-card border-2 ${
                        selectedDesign === design.id ? 'ring-2 ring-white' : 'border-transparent'
                      } ${design.color}`}
                      onClick={() => setSelectedDesign(design.id)}
                    />
                  ))}
                </Grid>
              </Card>

              <Card inverted className="p-6">
                <H3 className="mb-6 text-white">Recipient Details</H3>
                <Stack gap={4}>
                    <Field label="Recipient Email" required>
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="friend@email.com"
                        required
                        inverted
                      />
                    </Field>

                    <Field label="Recipient Name">
                      <Input
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Their name"
                        inverted
                      />
                    </Field>

                    <Field label="Personal Message">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        rows={3}
                        inverted
                      />
                    </Field>

                    <Field label="Delivery Date (Optional)">
                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        inverted
                      />
                    </Field>

                    <Button variant="solid" inverted disabled={purchasing} onClick={handlePurchase}>
                      {purchasing ? 'Processing...' : `Purchase $${customAmount || selectedAmount} Gift Card`}
                    </Button>
                  </Stack>
              </Card>
            </Stack>

            <Stack>
              <Card className={`sticky top-6 p-8 text-white ${GIFT_CARD_DESIGNS.find(d => d.id === selectedDesign)?.color || 'bg-black'}`}>
                <Stack gap={4}>
                  <Body className="text-body-sm text-white/60">GHXSTSHIP GIFT CARD</Body>
                  <H2 className="text-h2-md text-white">
                    ${customAmount || selectedAmount}
                  </H2>
                  {recipientName && (
                    <Body className="text-white">To: {recipientName}</Body>
                  )}
                  {message && (
                    <Body className="text-body-sm italic text-white/80">&quot;{message}&quot;</Body>
                  )}
                  <Body className="mt-4 text-mono-xs text-white/60">
                    Valid for tickets, merchandise, and experiences
                  </Body>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        )}

        {activeTab === 'redeem' && (
          <Card inverted variant="elevated" className="mx-auto max-w-md p-8">
            <H3 className="mb-6 text-center text-white">Redeem Gift Card</H3>
            <Stack gap={4}>
                <Field label="Gift Card Code">
                  <Input
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="text-center font-mono"
                    required
                    inverted
                  />
                </Field>
                <Button variant="solid" inverted disabled={redeeming} onClick={handleRedeem}>
                  {redeeming ? 'Redeeming...' : 'Redeem Gift Card'}
                </Button>
              </Stack>
          </Card>
        )}

        {activeTab === 'my-cards' && (
          <Stack gap={4}>
            {loading ? (
              <Stack className="items-center py-spacing-12">
                <LoadingSpinner size="lg" />
              </Stack>
            ) : myCards.length > 0 ? (
              <Grid cols={3} gap={4}>
                {myCards.map(card => (
                  <Card key={card.id} inverted className="p-6">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Body className="font-mono text-on-dark-muted">{card.code}</Body>
                        {getStatusBadge(card.status)}
                      </Stack>
                      <Stack>
                        <Label className="text-on-dark-disabled">Balance</Label>
                        <H2 className="text-white">${card.current_balance.toFixed(2)}</H2>
                        {card.current_balance !== card.initial_balance && (
                          <Body size="sm" className="text-on-dark-muted">
                            of ${card.initial_balance.toFixed(2)}
                          </Body>
                        )}
                      </Stack>
                      {card.recipient_name && (
                        <Body size="sm" className="text-on-dark-muted">
                          Sent to: {card.recipient_name}
                        </Body>
                      )}
                      {card.expires_at && (
                        <Body size="sm" className="font-mono text-on-dark-disabled">
                          Expires: {new Date(card.expires_at).toLocaleDateString()}
                        </Body>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Card inverted className="p-12 text-center">
                <H3 className="mb-4 text-white">No Gift Cards</H3>
                <Body className="mb-6 text-on-dark-muted">
                  You haven&apos;t purchased or received any gift cards yet.
                </Body>
                <Button variant="solid" inverted onClick={() => setActiveTab('buy')}>
                  Buy a Gift Card
                </Button>
              </Card>
            )}
          </Stack>
        )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
