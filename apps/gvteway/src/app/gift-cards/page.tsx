'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
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
  { id: 'sports', name: 'Game Day', color: 'bg-green-600' },
  { id: 'theater', name: 'Theater Night', color: 'bg-red-800' },
];

export default function GiftCardsPage() {
  const router = useRouter();
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
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'redeemed':
        return <Badge className="bg-gray-500 text-white">Redeemed</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Display>GIFT CARDS</Display>
          <Body className="mt-2 text-gray-600">
            Give the gift of experiences
          </Body>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Stack direction="horizontal" gap={2} className="mb-8">
          <Button
            variant={activeTab === 'buy' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('buy')}
          >
            Buy Gift Card
          </Button>
          <Button
            variant={activeTab === 'redeem' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('redeem')}
          >
            Redeem Code
          </Button>
          <Button
            variant={activeTab === 'my-cards' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('my-cards')}
          >
            My Gift Cards
          </Button>
        </Stack>

        {activeTab === 'buy' && (
          <Grid cols={2} gap={8}>
            <Stack gap={6}>
              <Card className="p-6">
                <H3 className="mb-6">SELECT AMOUNT</H3>
                <Grid cols={4} gap={3}>
                  {GIFT_CARD_AMOUNTS.map(amount => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !customAmount ? 'solid' : 'outline'}
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
                  />
                </Field>
              </Card>

              <Card className="p-6">
                <H3 className="mb-6">CHOOSE DESIGN</H3>
                <Grid cols={3} gap={3}>
                  {GIFT_CARD_DESIGNS.map(design => (
                    <Stack
                      key={design.id}
                      className={`h-20 rounded cursor-pointer border-2 ${
                        selectedDesign === design.id ? 'border-black' : 'border-transparent'
                      } ${design.color}`}
                      onClick={() => setSelectedDesign(design.id)}
                    />
                  ))}
                </Grid>
              </Card>

              <Card className="p-6">
                <H3 className="mb-6">RECIPIENT DETAILS</H3>
                <Stack gap={4}>
                    <Field label="Recipient Email" required>
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="friend@email.com"
                        required
                      />
                    </Field>

                    <Field label="Recipient Name">
                      <Input
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Their name"
                      />
                    </Field>

                    <Field label="Personal Message">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        rows={3}
                      />
                    </Field>

                    <Field label="Delivery Date (Optional)">
                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </Field>

                    <Button variant="solid" disabled={purchasing} onClick={handlePurchase}>
                      {purchasing ? 'Processing...' : `Purchase $${customAmount || selectedAmount} Gift Card`}
                    </Button>
                  </Stack>
              </Card>
            </Stack>

            <Stack>
              <Card className={`p-8 ${GIFT_CARD_DESIGNS.find(d => d.id === selectedDesign)?.color || 'bg-black'} text-white sticky top-6`}>
                <Stack gap={4}>
                  <Body className="text-white/60 text-sm">GHXSTSHIP GIFT CARD</Body>
                  <Display className="text-white">
                    ${customAmount || selectedAmount}
                  </Display>
                  {recipientName && (
                    <Body className="text-white">To: {recipientName}</Body>
                  )}
                  {message && (
                    <Body className="text-white/80 text-sm italic">&quot;{message}&quot;</Body>
                  )}
                  <Body className="text-white/60 text-xs mt-4">
                    Valid for tickets, merchandise, and experiences
                  </Body>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        )}

        {activeTab === 'redeem' && (
          <Card className="p-8 max-w-md mx-auto">
            <H3 className="mb-6 text-center">REDEEM GIFT CARD</H3>
            <Stack gap={4}>
                <Field label="Gift Card Code">
                  <Input
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="text-center font-mono text-lg"
                    required
                  />
                </Field>
                <Button variant="solid" disabled={redeeming} onClick={handleRedeem}>
                  {redeeming ? 'Redeeming...' : 'Redeem Gift Card'}
                </Button>
              </Stack>
          </Card>
        )}

        {activeTab === 'my-cards' && (
          <Stack gap={4}>
            {loading ? (
              <Stack className="items-center py-12">
                <LoadingSpinner size="lg" />
              </Stack>
            ) : myCards.length > 0 ? (
              <Grid cols={3} gap={4}>
                {myCards.map(card => (
                  <Card key={card.id} className="p-6">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Body className="font-mono text-sm">{card.code}</Body>
                        {getStatusBadge(card.status)}
                      </Stack>
                      <Stack>
                        <Label className="text-gray-500">Balance</Label>
                        <H2>${card.current_balance.toFixed(2)}</H2>
                        {card.current_balance !== card.initial_balance && (
                          <Body className="text-sm text-gray-500">
                            of ${card.initial_balance.toFixed(2)}
                          </Body>
                        )}
                      </Stack>
                      {card.recipient_name && (
                        <Body className="text-sm text-gray-600">
                          Sent to: {card.recipient_name}
                        </Body>
                      )}
                      {card.expires_at && (
                        <Body className="text-xs text-gray-400">
                          Expires: {new Date(card.expires_at).toLocaleDateString()}
                        </Body>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Card className="p-12 text-center">
                <H3 className="mb-4">NO GIFT CARDS</H3>
                <Body className="text-gray-600 mb-6">
                  You haven&apos;t purchased or received any gift cards yet.
                </Body>
                <Button variant="solid" onClick={() => setActiveTab('buy')}>
                  Buy a Gift Card
                </Button>
              </Card>
            )}
          </Stack>
        )}
      </Container>
    </Section>
  );
}
