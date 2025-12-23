'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import { 
  H3, 
  Body, 
  Button, 
  Input, 
  Card, 
  Grid, 
  Badge, 
  Stack, 
  Label,
  EnterprisePageHeader,
  MainContent,
  Container,
  useNotifications,
} from '@ghxstship/ui';
import { CreditCard, Lock, Check, ShoppingCart, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { log } from '@ghxstship/config';

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
  const { addNotification } = useNotifications();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'cardName':
        return value.trim().length < 2 ? 'Cardholder name is required' : '';
      case 'cardNumber':
        const cleanedNumber = value.replace(/\s/g, '');
        return !/^\d{13,19}$/.test(cleanedNumber) ? 'Enter a valid card number' : '';
      case 'expiry':
        return !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value) ? 'Enter MM/YY format' : '';
      case 'cvv':
        return !/^\d{3,4}$/.test(value) ? 'Enter 3-4 digit CVV' : '';
      case 'street':
        return value.trim().length < 3 ? 'Street address is required' : '';
      case 'city':
        return value.trim().length < 2 ? 'City is required' : '';
      case 'state':
        return value.trim().length < 2 ? 'State is required' : '';
      case 'zip':
        return !/^\d{5}(-\d{4})?$/.test(value) ? 'Enter valid ZIP code' : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData]) }));
  };

  const isFormValid = () => {
    const requiredFields = ['cardName', 'cardNumber', 'expiry', 'cvv', 'street', 'city', 'state', 'zip'];
    return requiredFields.every(field => {
      const value = formData[field as keyof typeof formData];
      return value && !validateField(field, value);
    });
  };

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
      log.error('Error loading cart:', error instanceof Error ? error : undefined);
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
        addNotification({ type: 'error', title: 'Payment Failed', message: data.error || 'Payment could not be processed' });
      }
    } catch (error) {
      log.error('Payment error:', error instanceof Error ? error : undefined);
      addNotification({ type: 'error', title: 'Payment Error', message: 'Payment processing failed. Please try again.' });
    } finally {
      setProcessing(false);
    }
  }

  const stepLabels = ['Review', 'Payment', 'Confirm'];

  if (loading) {
    return <GvtewayLoadingLayout text="Loading checkout..." />;
  }

  return (
    <>
      <EnterprisePageHeader
        title="Checkout"
        subtitle="Complete your purchase securely"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
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
              <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
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
              <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
                <Card inverted className="col-span-2 p-6">
                  <Stack gap={2} className="mb-6">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <CreditCard className="size-5 text-on-dark-muted" />
                      <H3 className="text-white">Payment Information</H3>
                    </Stack>
                  </Stack>
                  <Stack gap={4} role="form" aria-label="Payment form">
                    <Stack gap={1}>
                      <label htmlFor="cardName" className="text-body-sm text-on-dark-muted">Cardholder Name <span className="text-error">*</span></label>
                      <Input 
                        id="cardName"
                        placeholder="John Smith" 
                        inverted
                        value={formData.cardName}
                        onChange={(e) => handleFieldChange('cardName', e.target.value)}
                        onBlur={() => handleFieldBlur('cardName')}
                        aria-required="true"
                        aria-invalid={touched.cardName && !!errors.cardName}
                        aria-describedby={errors.cardName ? 'cardName-error' : undefined}
                      />
                      {touched.cardName && errors.cardName && (
                        <span id="cardName-error" className="text-body-xs text-error">{errors.cardName}</span>
                      )}
                    </Stack>
                    <Stack gap={1}>
                      <label htmlFor="cardNumber" className="text-body-sm text-on-dark-muted">Card Number <span className="text-error">*</span></label>
                      <Input 
                        id="cardNumber"
                        placeholder="4242 4242 4242 4242" 
                        inverted
                        value={formData.cardNumber}
                        onChange={(e) => handleFieldChange('cardNumber', e.target.value)}
                        onBlur={() => handleFieldBlur('cardNumber')}
                        aria-required="true"
                        aria-invalid={touched.cardNumber && !!errors.cardNumber}
                        aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
                      />
                      {touched.cardNumber && errors.cardNumber && (
                        <span id="cardNumber-error" className="text-body-xs text-error">{errors.cardNumber}</span>
                      )}
                    </Stack>
                    <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                      <Stack gap={1}>
                        <label htmlFor="expiry" className="text-body-sm text-on-dark-muted">Expiry Date <span className="text-error">*</span></label>
                        <Input 
                          id="expiry"
                          placeholder="MM/YY" 
                          inverted
                          value={formData.expiry}
                          onChange={(e) => handleFieldChange('expiry', e.target.value)}
                          onBlur={() => handleFieldBlur('expiry')}
                          aria-required="true"
                          aria-invalid={touched.expiry && !!errors.expiry}
                          aria-describedby={errors.expiry ? 'expiry-error' : undefined}
                        />
                        {touched.expiry && errors.expiry && (
                          <span id="expiry-error" className="text-body-xs text-error">{errors.expiry}</span>
                        )}
                      </Stack>
                      <Stack gap={1}>
                        <label htmlFor="cvv" className="text-body-sm text-on-dark-muted">CVV <span className="text-error">*</span></label>
                        <Input 
                          id="cvv"
                          placeholder="123" 
                          inverted
                          type="password"
                          value={formData.cvv}
                          onChange={(e) => handleFieldChange('cvv', e.target.value)}
                          onBlur={() => handleFieldBlur('cvv')}
                          aria-required="true"
                          aria-invalid={touched.cvv && !!errors.cvv}
                          aria-describedby={errors.cvv ? 'cvv-error' : undefined}
                        />
                        {touched.cvv && errors.cvv && (
                          <span id="cvv-error" className="text-body-xs text-error">{errors.cvv}</span>
                        )}
                      </Stack>
                    </Grid>
                    
                    <Stack gap={4} className="border-t border-ink-800 pt-4">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <MapPin className="size-5 text-on-dark-muted" aria-hidden="true" />
                        <H3 className="text-white">Billing Address</H3>
                      </Stack>
                      <Stack gap={1}>
                        <label htmlFor="street" className="text-body-sm text-on-dark-muted">Street Address <span className="text-error">*</span></label>
                        <Input 
                          id="street"
                          placeholder="123 Main St" 
                          inverted
                          value={formData.street}
                          onChange={(e) => handleFieldChange('street', e.target.value)}
                          onBlur={() => handleFieldBlur('street')}
                          aria-required="true"
                          aria-invalid={touched.street && !!errors.street}
                          aria-describedby={errors.street ? 'street-error' : undefined}
                        />
                        {touched.street && errors.street && (
                          <span id="street-error" className="text-body-xs text-error">{errors.street}</span>
                        )}
                      </Stack>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <label htmlFor="city" className="text-body-sm text-on-dark-muted">City <span className="text-error">*</span></label>
                          <Input 
                            id="city"
                            placeholder="New York" 
                            inverted
                            value={formData.city}
                            onChange={(e) => handleFieldChange('city', e.target.value)}
                            onBlur={() => handleFieldBlur('city')}
                            aria-required="true"
                            aria-invalid={touched.city && !!errors.city}
                            aria-describedby={errors.city ? 'city-error' : undefined}
                          />
                          {touched.city && errors.city && (
                            <span id="city-error" className="text-body-xs text-error">{errors.city}</span>
                          )}
                        </Stack>
                        <Stack gap={1}>
                          <label htmlFor="state" className="text-body-sm text-on-dark-muted">State <span className="text-error">*</span></label>
                          <Input 
                            id="state"
                            placeholder="NY" 
                            inverted
                            value={formData.state}
                            onChange={(e) => handleFieldChange('state', e.target.value)}
                            onBlur={() => handleFieldBlur('state')}
                            aria-required="true"
                            aria-invalid={touched.state && !!errors.state}
                            aria-describedby={errors.state ? 'state-error' : undefined}
                          />
                          {touched.state && errors.state && (
                            <span id="state-error" className="text-body-xs text-error">{errors.state}</span>
                          )}
                        </Stack>
                      </Grid>
                      <Stack gap={1}>
                        <label htmlFor="zip" className="text-body-sm text-on-dark-muted">ZIP Code <span className="text-error">*</span></label>
                        <Input 
                          id="zip"
                          placeholder="10001" 
                          inverted
                          value={formData.zip}
                          onChange={(e) => handleFieldChange('zip', e.target.value)}
                          onBlur={() => handleFieldBlur('zip')}
                          aria-required="true"
                          aria-invalid={touched.zip && !!errors.zip}
                          aria-describedby={errors.zip ? 'zip-error' : undefined}
                        />
                        {touched.zip && errors.zip && (
                          <span id="zip-error" className="text-body-xs text-error">{errors.zip}</span>
                        )}
                      </Stack>
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
                    disabled={processing || !isFormValid()}
                    icon={processing ? undefined : <CreditCard className="size-4" />}
                    iconPosition="left"
                    aria-label={processing ? 'Processing payment' : `Complete purchase for $${total.toFixed(2)}`}
                  >
                    Complete Purchase
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
                    <H3 className="text-white">Order Confirmed!</H3>
                    <Body className="text-on-dark-muted">Order #{orderId || 'PROCESSING'}</Body>
                  </Stack>
                  <Card inverted className="p-6">
                    <Body className="mb-2 text-on-dark-muted">Tickets have been sent to:</Body>
                    <Body className="font-display text-white">user@example.com</Body>
                  </Card>
                  <Stack gap={4} direction="horizontal">
                    <Button variant="outlineInk" onClick={() => router.push('/tickets')}>
                      View Tickets
                    </Button>
                    <Button variant="solid" inverted onClick={() => router.push('/events')}>
                      Browse More Events
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading checkout..." />}>
      <CheckoutContent />
    </Suspense>
  );
}
