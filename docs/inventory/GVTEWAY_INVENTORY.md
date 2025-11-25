# GVTEWAY - Customer Marketplace Platform Inventory

**Application:** GVTEWAY (Gateway)  
**Purpose:** Event discovery, ticket purchasing, community engagement  
**Target Users:** Event attendees, customers, community members  
**Last Updated:** November 23, 2025

---

## Pages Inventory (20 Total)

### Authentication
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/(auth)/login` | `src/app/(auth)/login/page.tsx` | ✅ | Login page (route group) |
| `/auth/signin` | `src/app/auth/signin/page.tsx` | ✅ | Sign-in page |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | ✅ | Sign-up/registration page |

### Core Application Pages
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/` | `src/app/page.tsx` | ✅ | Homepage/landing page |
| `/dashboard` | `src/app/dashboard/page.tsx` | ✅ | User dashboard |
| `/design-system` | `src/app/design-system/page.tsx` | ✅ | Design system showcase |

### Event Discovery
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/browse` | `src/app/browse/page.tsx` | 🟡 | Browse all events |
| `/search` | `src/app/search/page.tsx` | 🟡 | Search events with filters |
| `/events` | `src/app/events/page.tsx` | 🟡 | Events listing page |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | 🟡 | Event detail page |
| `/events/create` | `src/app/events/create/page.tsx` | 🟡 | Create new event (organizers) |

### Purchasing & Orders
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/checkout` | `src/app/checkout/page.tsx` | 🟡 | Checkout flow (Stripe) |
| `/tickets` | `src/app/tickets/page.tsx` | 🟡 | User's tickets |
| `/orders` | `src/app/orders/page.tsx` | 🟡 | Order history & management |

### User Features
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/profile` | `src/app/profile/page.tsx` | 🟡 | User profile page |
| `/settings` | `src/app/settings/page.tsx` | 🟡 | Account settings |
| `/wishlist` | `src/app/wishlist/page.tsx` | 🟡 | Saved/wishlisted events |

### Community & Content
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/community` | `src/app/community/page.tsx` | 🟡 | Community forums |
| `/moderate` | `src/app/moderate/page.tsx` | 🟡 | Content moderation (admins) |

### Venue Information
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/venues` | `src/app/venues/page.tsx` | 🟡 | Venue directory |

---

## Components Inventory (9 Total)

### Navigation Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `Navigation` | `src/components/navigation.tsx` | Layout | Main app navigation |
| `RoleNavigation` | `src/components/role-navigation.tsx` | Layout | Role-based navigation |

### Event Display Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `EventCard` | `src/components/EventCard.tsx` | Display | Event summary card (legacy) |
| `event-card` | `src/components/event-card.tsx` | Display | Event summary card (new) |
| `ExperienceDiscovery` | `src/components/experience-discovery.tsx` | Display | Event discovery widget |

### Form Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `EventCreationForm` | `src/components/event-creation-form.tsx` | Form | Create/edit event form |

### Ticket Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `TicketCard` | `src/components/ticket-card.tsx` | Display | Ticket display card |

### Layout Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `Section` | `src/components/section.tsx` | Layout | Reusable section wrapper |

### Route Protection
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Auth | Route authentication wrapper |

---

## API Routes Inventory (17 Total)

### Admin Operations
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/admin/refunds` | `src/app/api/admin/refunds/route.ts` | POST | Process refunds (admin) |

### Checkout & Payments
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/checkout/session` | `src/app/api/checkout/session/route.ts` | POST | Create Stripe checkout session |

### Community Features
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/community/forums` | `src/app/api/community/forums/route.ts` | GET, POST | Community forum posts |

### Event Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/events` | `src/app/api/events/route.ts` | GET, POST | List/create events |
| `/api/events/[id]` | `src/app/api/events/[id]/route.ts` | GET, PATCH, DELETE | Single event operations |
| `/api/events/create` | `src/app/api/events/create/route.ts` | POST | Create new event |

### Order Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/orders` | `src/app/api/orders/route.ts` | GET, POST | User orders |
| `/api/orders/[id]` | `src/app/api/orders/[id]/route.ts` | GET, PATCH | Single order operations |

### Saved Searches
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/saved-searches` | `src/app/api/saved-searches/route.ts` | GET, POST, DELETE | User saved searches |

### Ticket Operations
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/tickets` | `src/app/api/tickets/route.ts` | GET, POST | Ticket operations |
| `/api/tickets/[id]` | `src/app/api/tickets/[id]/route.ts` | GET, PATCH | Single ticket operations |

### User Profile & Settings
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/user/profile` | `src/app/api/user/profile/route.ts` | GET, PATCH | User profile data |
| `/api/user/settings` | `src/app/api/user/settings/route.ts` | GET, PATCH | Account settings |

### Venue Information
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/venues` | `src/app/api/venues/route.ts` | GET, POST | Venue directory |
| `/api/venues/[id]` | `src/app/api/venues/[id]/route.ts` | GET, PATCH | Single venue operations |

### Webhooks
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/webhooks/stripe` | `src/app/api/webhooks/stripe/route.ts` | POST | Stripe webhook handler |

### Wishlist
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/wishlist` | `src/app/api/wishlist/route.ts` | GET, POST, DELETE | User wishlist operations |

---

## Forms & Data Entry

### Event Creation Form
**Component:** `EventCreationForm`  
**Purpose:** Create new events (for organizers/admins)  
**Fields:**
- Title (text, required)
- Slug (text, required)
- Headliner (text, required)
- Venue (text, required)
- City (text, required)
- Start Date (datetime-local, required)
- Status (select: draft, on-sale, sold-out)
- Price Band (select: $, $$, $$$)
- Genres (text, comma-separated)
- Experience Tags (text, comma-separated)

**Validation:**
- All required fields must be filled
- Slug must be unique
- Date must be in future
- Genres/tags parsed from comma-separated strings

### User Signup Form
**Location:** `/auth/signup`  
**Fields:**
- Email (required)
- Password (required)
- Confirm Password (required)
- First Name
- Last Name
- Agree to Terms (checkbox, required)

### Checkout Form
**Location:** `/checkout`  
**Integration:** Stripe Elements
**Fields:**
- Billing information
- Payment method (Stripe)
- Email for confirmation
- Special requests (optional)

---

## Key Features & Workflows

### Event Discovery
- [ ] Homepage event recommendations
- [ ] Browse all events with filters
- [ ] Search by location, date, genre
- [ ] Event detail pages with full info
- [ ] Related events suggestions
- [ ] Save events to wishlist

### Ticket Purchasing
- [ ] Add tickets to cart
- [ ] Stripe checkout integration
- [ ] Order confirmation email
- [ ] Digital ticket generation
- [ ] QR code for entry
- [ ] Ticket transfer capability

### User Account
- [ ] User registration & login
- [ ] Profile customization
- [ ] Order history
- [ ] Ticket management
- [ ] Wishlist management
- [ ] Saved search preferences
- [ ] Email notification settings

### Community Features
- [ ] Community forums/discussions
- [ ] Event reviews & ratings
- [ ] User-generated content
- [ ] Content moderation tools
- [ ] Report inappropriate content

### Organizer Features
- [ ] Event creation interface
- [ ] Event management dashboard
- [ ] Ticket inventory management
- [ ] Sales analytics
- [ ] Customer data export

---

## Payment Integration (Stripe)

### Checkout Flow
1. User adds tickets to cart
2. Navigate to `/checkout`
3. Create Stripe checkout session via `/api/checkout/session`
4. Redirect to Stripe hosted checkout
5. Process payment
6. Webhook receives payment confirmation
7. Generate tickets
8. Send confirmation email
9. Redirect to order confirmation

### Webhook Events
**Endpoint:** `/api/webhooks/stripe`  
**Events Handled:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.failed`
- `charge.refunded`

### Refund Processing
**Endpoint:** `/api/admin/refunds`  
**Access:** Admin only  
**Process:**
- Validate refund request
- Process via Stripe API
- Update order status
- Notify customer
- Update ticket availability

---

## Build Checklist

### Phase 1: Core Infrastructure ✅
- [x] Page routing structure
- [x] API route definitions
- [x] Authentication setup
- [x] Basic navigation

### Phase 2: Component Development 🟡
- [x] Event creation form
- [x] Event display cards
- [ ] Checkout flow
- [ ] Ticket display
- [ ] User profile interface
- [ ] Search & filter components
- [ ] Community forum UI

### Phase 3: Stripe Integration 🟡
- [ ] Stripe Elements setup
- [ ] Checkout session creation
- [ ] Webhook endpoint
- [ ] Payment confirmation flow
- [ ] Refund processing
- [ ] Webhook signature validation

### Phase 4: Data Integration ⚪
- [ ] Connect all API routes to Supabase
- [ ] Implement search indexing
- [ ] Real-time ticket availability
- [ ] Order processing workflow
- [ ] Email notifications

### Phase 5: Advanced Features ⚪
- [ ] Recommendation engine
- [ ] Saved searches
- [ ] Event sharing
- [ ] Social media integration
- [ ] Mobile app (future)

### Phase 6: Testing ⚪
- [ ] Unit tests for components
- [ ] Integration tests for APIs
- [ ] Stripe test mode verification
- [ ] E2E checkout flow
- [ ] Performance testing

---

## Database Tables Used

- `events`
- `tickets`
- `orders`
- `order_items`
- `venues`
- `users` (attendees)
- `wishlists`
- `saved_searches`
- `community_posts`
- `event_reviews`
- `payment_transactions`

See database migrations for complete schema details.

---

## Role-Based Access

### Public (Unauthenticated)
- Browse events
- View event details
- View venue information
- Sign up / Sign in

### Attendee (Authenticated User)
- All public features
- Purchase tickets
- View order history
- Manage profile
- Save wishlists
- Participate in community

### Organizer
- All attendee features
- Create events
- Manage own events
- View sales analytics
- Export customer data

### Moderator
- All attendee features
- Access moderation dashboard
- Review flagged content
- Manage community posts
- Ban/warn users

### Admin
- Full platform access
- Process refunds
- View all orders
- Manage all events
- System configuration

---

## Third-Party Integrations

### Current
- **Stripe** - Payment processing
- **Supabase** - Database & auth
- **Supabase Edge Functions** - Webhooks

### Planned
- Email service (SendGrid/Resend)
- SMS notifications (Twilio)
- Social media APIs
- Analytics (Google Analytics/Mixpanel)
- Search (Algolia/Typesense)
