'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import { 
  H2, 
  H3, 
  Body, 
  Button, 
  Input, 
  Card, 
  Grid, 
  Badge, 
  Stack, 
  Kicker,
  Label,
} from '@ghxstship/ui';
import { CreditCard, Lock, Check, ShoppingCart, MapPin, ChevronRight } from 'lucide-react';
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

  const stepLabels = ['Review', 'Payment', 'Confirm'];

  if (loading) {
    return <GvtewayLoadingLayout text="Loading checkout..." />;
  }

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Secure Payment</Kicker>
              <H2 size="lg" className="text-white">Checkout</H2>
              <Body className="text-on-dark-muted">Complete your purchase securely</Body>
            </Stack>

            {/* Progress Steps */}
            <Card inverted className="p-4">
              <Stack gap={2} direction="horizontal" className="justify-between">
                {stepLabels.map((label, idx) => {
                  const stepKey = ['cart', 'payment', 'confirm'][idx];
                  const isActive = step === stepKey;
                  const isPast = (step === 'payment' && idx === 0) || (step === 'confirm' && idx < 2);
                  return (
                    <Stack key={label} gap={2} direction="horizontal" className="flex-1 items-center">
                      <Stack gap={1} className="items-center">
                        <Badge variant={isActive || isPast ? 'solid' : 'outline'}>
                          {idx + 1}
                        </Badge>
                        <Label size="xs" className={isActive ? 'text-white' : 'text-on-dark-muted'}>
                          {label}
                        </Label>
                      </Stack>
                      {idx < 2 && (
                        <ChevronRight className={`size-4 ${isPast ? 'text-white' : 'text-on-dark-disabled'}`} />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Card>

            {/* Cart Step */}
            {step === 'cart' && (
              <Grid cols={3} gap={6}>
                <Card inverted className="col-span-2 p-6">
                  <Stack gap={2} className="mb-6">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <ShoppingCart className="size-5 text-on-dark-muted" />
                      <H3 className="text-white">Order Summary</H3>
                    </Stack>
                  </Stack>
                  {cartItems.length > 0 ? (
                    <Stack gap={4}>
                      {cartItems.map(item => (
                        <Stack key={item.id} gap={4} direction="horizontal" className="items-start justify-between border-b border-ink-800 pb-4">
                          <Stack gap={1} className="flex-1">
                            <H3 className="text-white">{item.event_title}</H3>
                            <Body className="text-on-dark-muted">{item.ticket_type_name}</Body>
                            <Label size="xs" className="text-on-dark-disabled">Qty: {item.qty}</Label>
                          </Stack>
                          <Body className="font-display text-white">${(item.price * item.qty).toFixed(2)}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Body className="text-on-dark-muted">Your cart is empty</Body>
                  )}
                </Card>

                <Stack gap={4}>
                  <Card inverted variant="elevated" className="p-6">
                    <H3 className="mb-4 text-white">Total</H3>
                    <Stack gap={3}>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Subtotal</Body>
                        <Body className="font-mono text-white">${subtotal.toFixed(2)}</Body>
                      </Stack>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Service Fees</Body>
                        <Body className="font-mono text-white">${fees.toFixed(2)}</Body>
                      </Stack>
                      <Stack gap={1} direction="horizontal" className="justify-between border-t border-ink-800 pt-3">
                        <Body className="font-display text-white">Total</Body>
                        <Body className="font-display text-white">${total.toFixed(2)}</Body>
                      </Stack>
                    </Stack>
                  </Card>
                  <Button 
                    variant="solid" 
                    inverted
                    fullWidth 
                    onClick={() => setStep('payment')}
                    icon={<ChevronRight className="size-4" />}
                    iconPosition="right"
                  >
                    Proceed to Payment
                  </Button>
                </Stack>
              </Grid>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <Grid cols={3} gap={6}>
                <Card inverted className="col-span-2 p-6">
                  <Stack gap={2} className="mb-6">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <CreditCard className="size-5 text-on-dark-muted" />
                      <H3 className="text-white">Payment Information</H3>
                    </Stack>
                  </Stack>
                  <Stack gap={4}>
                    <Input 
                      placeholder="Cardholder Name" 
                      inverted
                      value={formData.cardName}
                      onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                    />
                    <Input 
                      placeholder="Card Number" 
                      inverted
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    />
                    <Grid cols={2} gap={4}>
                      <Input 
                        placeholder="MM/YY" 
                        inverted
                        value={formData.expiry}
                        onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                      />
                      <Input 
                        placeholder="CVV" 
                        inverted
                        value={formData.cvv}
                        onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                      />
                    </Grid>
                    
                    <Stack gap={4} className="border-t border-ink-800 pt-4">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <MapPin className="size-5 text-on-dark-muted" />
                        <H3 className="text-white">Billing Address</H3>
                      </Stack>
                      <Input 
                        placeholder="Street Address" 
                        inverted
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                      />
                      <Grid cols={2} gap={4}>
                        <Input 
                          placeholder="City" 
                          inverted
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                        <Input 
                          placeholder="State" 
                          inverted
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                      </Grid>
                      <Input 
                        placeholder="ZIP Code" 
                        inverted
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      />
                    </Stack>
                  </Stack>
                </Card>

                <Stack gap={4}>
                  <Card inverted variant="elevated" className="p-6">
                    <H3 className="mb-4 text-white">Total</H3>
                    <Stack gap={1} direction="horizontal" className="justify-between">
                      <Body className="font-display text-white">Total</Body>
                      <Body className="font-display text-white">${total.toFixed(2)}</Body>
                    </Stack>
                  </Card>
                  <Card inverted className="p-4">
                    <Stack gap={2} direction="horizontal" className="items-center">
                      <Lock className="size-4 text-on-dark-muted" />
                      <Label size="xs" className="text-on-dark-muted">Secure Checkout</Label>
                    </Stack>
                    <Body size="sm" className="mt-2 text-on-dark-disabled">
                      Your payment information is encrypted and secure
                    </Body>
                  </Card>
                  <Button 
                    variant="solid"
                    inverted
                    fullWidth
                    onClick={handlePayment}
                    disabled={processing || !formData.cardName || !formData.cardNumber}
                    icon={<CreditCard className="size-4" />}
                    iconPosition="left"
                  >
                    {processing ? 'Processing...' : 'Complete Purchase'}
                  </Button>
                </Stack>
              </Grid>
            )}

            {/* Confirmation Step */}
            {step === 'confirm' && (
              <Card inverted variant="elevated" className="p-12 text-center">
                <Stack gap={6} className="items-center">
                  <Badge variant="solid" className="size-16 rounded-avatar">
                    <Check className="size-8" />
                  </Badge>
                  <Stack gap={2}>
                    <H2 className="text-white">Order Confirmed!</H2>
                    <Body className="text-on-dark-muted">Order #{orderId || 'PROCESSING'}</Body>
                  </Stack>
                  <Card inverted className="p-6">
                    <Body className="mb-2 text-on-dark-muted">Tickets have been sent to:</Body>
                    <Body className="font-display text-white">user@example.com</Body>
                  </Card>
                  <Stack gap={4} direction="horizontal">
                    <Button variant="outlineInk" onClick={() => window.location.href = '/tickets'}>
                      View Tickets
                    </Button>
                    <Button variant="solid" inverted onClick={() => window.location.href = '/events'}>
                      Browse More Events
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}
      </Stack>
    </GvtewayAppLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading checkout..." />}>
      <CheckoutContent />
    </Suspense>
  );
}
