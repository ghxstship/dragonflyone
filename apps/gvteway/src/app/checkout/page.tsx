'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { ConsumerNavigationPublic } from '../../components/navigation';
import { Container, Section, H1, H2, H3, Body, Button, Input, Select, Card, Grid, Badge, Stack, LoadingSpinner } from '@ghxstship/ui';
import { CreditCard, Lock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  event_title: string;
  ticket_type_name: string;
  price: number;
  qty: number;
  ticket_type_id: string;
  event_id: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<'cart' | 'payment' | 'confirm'>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    loadCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCartItems() {
    try {
      const eventId = searchParams.get('event');
      const ticketId = searchParams.get('ticket');
      const qty = parseInt(searchParams.get('qty') || '1');

      if (eventId && ticketId) {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, title')
          .eq('id', eventId)
          .single();

        const { data: ticket, error: ticketError } = await supabase
          .from('ticket_types')
          .select('id, name, price')
          .eq('id', ticketId)
          .single();

        if (!eventError && !ticketError && event && ticket) {
          setCartItems([{
            id: ticketId,
            event_title: event.title,
            ticket_type_name: ticket.name,
            price: ticket.price,
            qty,
            ticket_type_id: ticket.id,
            event_id: event.id,
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const fees = subtotal * 0.12;
  const total = subtotal + fees;

  async function handlePayment() {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin?redirect=/checkout');
        return;
      }

      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          userId: user.id,
          paymentMethod: formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(data.orderId);
        setStep('confirm');
      } else {
        alert('Payment failed: ' + data.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading checkout..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8} className="max-w-4xl mx-auto">
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Checkout</H1>
            <Body className="text-ink-600">Complete your purchase securely</Body>
          </Stack>

          {/* Progress Steps */}
          <Stack gap={2} direction="horizontal" className="justify-between">
            {['cart', 'payment', 'confirm'].map((s, idx) => (
              <Stack key={s} gap={2} direction="horizontal" className="flex-1 items-center">
                <Card className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === s ? 'bg-black text-white border-black' : 'border-ink-300 text-ink-600'}`}>
                  <Body>{idx + 1}</Body>
                </Card>
                {idx < 2 && <Card className={`flex-1 h-0.5 ${step !== 'cart' && idx === 0 || step === 'confirm' && idx === 1 ? 'bg-black' : 'bg-ink-300'} mx-2`} />}
              </Stack>
            ))}
          </Stack>

          {/* Cart Step */}
          {step === 'cart' && (
            <Grid cols={1} gap={6} className="lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <Card className="p-6">
                  <H2 className="mb-4">ORDER SUMMARY</H2>
                  {cartItems.length > 0 ? (
                    cartItems.map(item => (
                      <Stack key={item.id} gap={4} direction="horizontal" className="justify-between items-start py-4 border-b border-ink-200">
                        <Stack gap={1} className="flex-1">
                          <H3>{item.event_title}</H3>
                          <Body className="text-ink-600">{item.ticket_type_name}</Body>
                          <Body className="text-body-sm text-ink-500">Qty: {item.qty}</Body>
                        </Stack>
                        <Body className="font-bold">${(item.price * item.qty).toFixed(2)}</Body>
                      </Stack>
                    ))
                  ) : (
                    <Body className="text-ink-500">Your cart is empty</Body>
                  )}
                </Card>
              </Card>

              <Stack gap={4}>
                <Card className="p-6">
                  <H2 className="mb-4">TOTAL</H2>
                  <Stack gap={2} className="mb-4">
                    <Stack gap={2} direction="horizontal" className="justify-between">
                      <Body>Subtotal</Body>
                      <Body>${subtotal.toFixed(2)}</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-between">
                      <Body>Service Fees</Body>
                      <Body>${fees.toFixed(2)}</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-between border-t-2 border-black pt-2">
                      <Body className="font-bold">Total</Body>
                      <Body className="font-bold">${total.toFixed(2)}</Body>
                    </Stack>
                  </Stack>
                  <Button className="w-full" onClick={() => setStep('payment')}>
                    PROCEED TO PAYMENT
                  </Button>
                </Card>
              </Stack>
            </Grid>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <Grid cols={1} gap={6} className="lg:grid-cols-3">
              <Card className="lg:col-span-2 p-6">
                <H2 className="mb-6">PAYMENT INFORMATION</H2>
                <Stack gap={4}>
                  <Stack gap={2}>
                      <Input 
                        placeholder="Cardholder Name" 
                        className="w-full" 
                        value={formData.cardName}
                        onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                      />
                  </Stack>
                  <Stack gap={2}>
                    <Input 
                      placeholder="Card Number" 
                      className="w-full" 
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    />
                  </Stack>
                  <Grid cols={2} gap={4}>
                      <Input 
                        placeholder="MM/YY" 
                        value={formData.expiry}
                        onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                      />
                      <Input 
                        placeholder="CVV" 
                        value={formData.cvv}
                        onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                      />
                  </Grid>
                  <Stack gap={4} className="pt-4 border-t border-ink-200">
                    <H3>BILLING ADDRESS</H3>
                    <Stack gap={4}>
                        <Input 
                          placeholder="Street Address" 
                          className="w-full" 
                          value={formData.street}
                          onChange={(e) => setFormData({...formData, street: e.target.value})}
                        />
                      <Grid cols={2} gap={4}>
                          <Input 
                            placeholder="City" 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                          />
                          <Input 
                            placeholder="State" 
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                          />
                      </Grid>
                      <Input 
                        placeholder="ZIP Code" 
                        className="w-full" 
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

              <Stack gap={4}>
                <Card className="p-6">
                  <H2 className="mb-4">TOTAL</H2>
                  <Stack gap={2}>
                    <Stack gap={2} direction="horizontal" className="justify-between border-t-2 border-black pt-2">
                      <Body className="font-bold">Total</Body>
                      <Body className="font-bold">${total.toFixed(2)}</Body>
                    </Stack>
                  </Stack>
                </Card>
                <Card className="p-6 bg-ink-100">
                  <Stack gap={2} direction="horizontal" className="items-center mb-2">
                    <Lock className="w-4 h-4" />
                    <Body className="font-bold text-body-sm">SECURE CHECKOUT</Body>
                  </Stack>
                  <Body className="text-mono-xs text-ink-600">Your payment information is encrypted and secure</Body>
                </Card>
                <Button 
                  className="w-full mt-4" 
                  onClick={handlePayment}
                  disabled={processing || !formData.cardName || !formData.cardNumber}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {processing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
                </Button>
              </Stack>
            </Grid>
          )}

          {/* Confirmation Step */}
          {step === 'confirm' && (
            <Card className="p-12 text-center">
              <Card className="w-16 h-16 mx-auto mb-4 rounded-full bg-black flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </Card>
              <H1 className="mb-2">Order Confirmed!</H1>
              <Body className="text-ink-600 mb-6">Order #{orderId || 'PROCESSING'}</Body>
              <Card className="p-6 bg-ink-50 mb-6">
                <Body className="mb-4">Tickets have been sent to:</Body>
                <Body className="font-bold">user@example.com</Body>
              </Card>
              <Stack gap={4} direction="horizontal" className="justify-center">
                <Button variant="outline" onClick={() => window.location.href = '/tickets'}>
                  VIEW TICKETS
                </Button>
                <Button onClick={() => window.location.href = '/events'}>
                  BROWSE MORE EVENTS
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading checkout..." />
        </Container>
      </Section>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
