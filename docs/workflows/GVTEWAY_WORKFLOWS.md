# GVTEWAY Detailed Workflows

> **Version:** 2.0  
> **Last Updated:** December 31, 2025  
> **App Purpose:** Consumer-facing ticketing, fan engagement, experiences  
> **Total Pages:** 189  
> **Total Workflows:** 31

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [USER_GUIDES.md](../guides/USER_GUIDES.md) | End-to-end user guides including GVTEWAY consumer journey |
| [WORKFLOW_INVENTORY.md](./WORKFLOW_INVENTORY.md) | Master workflow inventory with cross-platform overview |
| [ATLVS_WORKFLOWS.md](./ATLVS_WORKFLOWS.md) | Business operations workflows |
| [COMPVSS_WORKFLOWS.md](./COMPVSS_WORKFLOWS.md) | Production operations workflows |

---

## Table of Contents

1. [Consumer Workflows](#consumer-workflows) (7 workflows)
2. [Member Workflows](#member-workflows) (11 workflows)
3. [Artist Workflows](#artist-workflows) (2 workflows)
4. [Admin Workflows](#admin-workflows) (8 workflows)
5. [Venue Manager Workflows](#venue-manager-workflows) (1 workflow)
6. [Offline & Authentication Workflows](#offline--authentication-workflows) (2 workflows)

---

## Consumer Workflows

### WF-GVTEWAY-001: Event Discovery & Browse

**Actor:** Public User (unauthenticated)  
**Trigger:** User wants to find events

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Visit homepage | `/` | Homepage displayed |
| 2 | Browse events | `/browse` | Events listed |
| 3 | Use discovery | `/discover` | Curated events shown |
| 4 | Take discovery quiz | `/discover/quiz` | Personalized results |
| 5 | Search events | `/search` | Search results |
| 6 | Use universal search | `/search/universal` | All results |
| 7 | View new events | `/new-events` | New events listed |
| 8 | Find nearby events | `/nearby` | Local events shown |
| 9 | Browse by destination | `/destinations` | Destinations listed |
| 10 | View experiences | `/experiences` | Experiences shown |
| 11 | Browse tours | `/tours` | Tours listed |
| 12 | View calendar | `/calendar` | Calendar displayed |
| 13 | Use map view | `/map` | Map displayed |

**Post-Conditions:**
- Events discovered
- User engaged

---

### WF-GVTEWAY-002: Event Details & Information

**Actor:** Public User  
**Trigger:** User wants event details

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Select event | `/events` | Event list |
| 2 | View event details | `/events/[id]` | Details displayed |
| 3 | View program | `/events/[id]/program` | Program shown |
| 4 | Check accessibility | `/events/[id]/accessibility` | Accessibility info |
| 5 | View entry info | `/events/[id]/entry-info` | Entry details |
| 6 | Check parking | `/events/[id]/parking` | Parking info |
| 7 | View seating chart | `/events/[id]/seating` | Seating displayed |
| 8 | View social wall | `/events/[id]/social-wall` | Social content |
| 9 | Compare events | `/events/compare` | Comparison view |

**Post-Conditions:**
- Event understood
- Ready to purchase

---

### WF-GVTEWAY-003: Ticket Purchase Flow

**Actor:** Public User  
**Trigger:** User wants to buy tickets

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Select event | `/events/[id]` | Event displayed |
| 2 | Choose tickets | `/events/[id]` | Tickets selected |
| 3 | Add to cart | `/cart` | Cart updated |
| 4 | Select currency | `/checkout/currency` | Currency set |
| 5 | Proceed to checkout | `/checkout` | Checkout started |
| 6 | Enter details | `/checkout` | Details captured |
| 7 | Apply promo code | `/checkout` | Discount applied |
| 8 | Complete payment | `/checkout` | Payment processed |
| 9 | View confirmation | `/confirmation` | Order confirmed |

**Post-Conditions:**
- Tickets purchased
- Confirmation sent
- Order created

---

### WF-GVTEWAY-004: Artist & Venue Discovery

**Actor:** Public User  
**Trigger:** User wants to explore artists/venues

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Browse artists | `/artists` | Artists listed |
| 2 | View artist profile | `/artists/[id]` | Profile displayed |
| 3 | Browse venues | `/venues` | Venues listed |
| 4 | View venue details | `/venues/[id]` | Venue displayed |
| 5 | View creators | `/creators` | Creators listed |
| 6 | Get directions | `/directions` | Directions shown |

**Post-Conditions:**
- Artists/venues discovered
- Events found

---

### WF-GVTEWAY-005: Merchandise Shopping

**Actor:** Public User  
**Trigger:** User wants to buy merchandise

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Browse merch | `/merch` | Merch displayed |
| 2 | View artist merch | `/merch/[artistId]` | Artist merch shown |
| 3 | View bundles | `/merch/bundles` | Bundles displayed |
| 4 | Browse collections | `/collections/[id]` | Collection shown |
| 5 | View deals | `/deals` | Deals displayed |
| 6 | Shop shoppable content | `/shop/shoppable` | Shoppable items |
| 7 | Browse packages | `/packages` | Packages shown |
| 8 | Buy gift cards | `/gift-cards` | Gift cards available |
| 9 | Add to cart | `/cart` | Cart updated |
| 10 | Checkout | `/checkout` | Purchase completed |

**Post-Conditions:**
- Merch purchased
- Order created

---

### WF-GVTEWAY-006: Help & Support Access

**Actor:** Public User  
**Trigger:** User needs help

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access help | `/help` | Help center |
| 2 | View accessibility info | `/accessibility` | Accessibility info |
| 3 | Request accessibility | `/accessibility/request` | Request submitted |
| 4 | View community guidelines | `/community/guidelines` | Guidelines shown |
| 5 | Get directions | `/directions` | Directions displayed |

**Post-Conditions:**
- Help received
- Request submitted

---

### WF-GVTEWAY-007: User Registration

**Actor:** Public User  
**Trigger:** User wants to create account

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Click sign up | `/auth/signup` | Registration form |
| 2 | Enter details | `/auth/signup` | Details captured |
| 3 | Submit registration | `/auth/signup` | Account created |
| 4 | Verify email | `/auth/verify-email` | Email verified |
| 5 | Complete onboarding | `/onboarding` | Preferences set |

**Post-Conditions:**
- Account created
- Member access granted

---

## Member Workflows

### WF-GVTEWAY-008: Account Management

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member manages account

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access account | `/account` | Account hub |
| 2 | View profile | `/account/profile` | Profile displayed |
| 3 | View orders | `/account/orders` | Orders listed |
| 4 | View tickets | `/account/tickets` | Tickets shown |
| 5 | View refunds | `/account/my-refunds` | Refunds listed |
| 6 | View transfers | `/account/my-transfers` | Transfers shown |
| 7 | Update profile | `/profile` | Profile updated |
| 8 | View badges | `/profile/badges` | Badges displayed |
| 9 | Check reputation | `/profile/reputation` | Reputation shown |

**Post-Conditions:**
- Account managed
- Profile current

---

### WF-GVTEWAY-009: Ticket Management

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member manages tickets

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View tickets | `/tickets` | Tickets listed |
| 2 | Track ticket | `/tickets/tracking` | Tracking info |
| 3 | Transfer ticket | `/tickets/transfer` | Transfer initiated |
| 4 | Gift ticket | `/tickets/gift` | Gift sent |
| 5 | Group tickets | `/tickets/groups` | Groups managed |
| 6 | Print at home | `/tickets/print-at-home` | Ticket printed |
| 7 | Access wallet | `/wallet` | Wallet displayed |
| 8 | Offline wallet | `/wallet/offline` | Offline access |
| 9 | List for resale | `/resale` | Resale listed |
| 10 | Set price alerts | `/price-alerts` | Alerts set |

**Post-Conditions:**
- Tickets managed
- Transfers complete

---

### WF-GVTEWAY-010: Order Management

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member manages orders

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View orders | `/orders` | Orders listed |
| 2 | View order history | `/orders/history` | History displayed |
| 3 | View my events | `/my-events` | Events listed |
| 4 | Request refund | `/account/my-refunds` | Refund requested |

**Post-Conditions:**
- Orders tracked
- Refunds processed

---

### WF-GVTEWAY-011: Live Event Experience

**Actor:** Ticket Holder (GVTEWAY_MEMBER with ticket)  
**Trigger:** Attending live event

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access event hub | `/e/[eventId]` | Event hub displayed |
| 2 | View my tickets | `/e/[eventId]/my-tickets` | Tickets shown |
| 3 | View ticket | `/e/[eventId]/ticket` | Ticket displayed |
| 4 | Get entry info | `/e/[eventId]/entry-info` | Entry info shown |
| 5 | Navigate venue | `/e/[eventId]/navigate` | Navigation active |
| 6 | Find parking | `/e/[eventId]/navigate/parking` | Parking info |
| 7 | Accessibility nav | `/e/[eventId]/navigate/accessibility` | Accessible routes |
| 8 | Get directions | `/e/[eventId]/navigate/directions` | Directions shown |
| 9 | View map | `/e/[eventId]/map` | Venue map |
| 10 | View seating | `/e/[eventId]/seating` | Seating shown |
| 11 | View lineup | `/e/[eventId]/lineup` | Lineup displayed |
| 12 | View program | `/e/[eventId]/program` | Program shown |

**Post-Conditions:**
- Event navigated
- Information accessed

---

### WF-GVTEWAY-012: Event Engagement

**Actor:** Ticket Holder  
**Trigger:** Engaging with event

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access engagement hub | `/e/[eventId]/engage` | Engagement options |
| 2 | Participate in challenges | `/e/[eventId]/engage/challenges` | Challenges joined |
| 3 | Vote in polls | `/e/[eventId]/engage/polls` | Votes cast |
| 4 | Ask questions | `/e/[eventId]/engage/qa` | Questions submitted |
| 5 | Submit UGC | `/e/[eventId]/engage/ugc` | Content submitted |
| 6 | Join chat | `/e/[eventId]/chat` | Chat active |
| 7 | Find friends | `/e/[eventId]/friends` | Friends located |
| 8 | Take photos | `/e/[eventId]/photos` | Photos captured |
| 9 | Shop at event | `/e/[eventId]/shop` | Shopping available |

**Post-Conditions:**
- Engaged with event
- Content created

---

### WF-GVTEWAY-013: Event Services

**Actor:** Ticket Holder  
**Trigger:** Needs event services

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access services | `/e/[eventId]/services` | Services hub |
| 2 | Emergency info | `/e/[eventId]/services/emergency` | Emergency contacts |
| 3 | Lost & found | `/e/[eventId]/services/lost-found` | Lost items |
| 4 | Get support | `/e/[eventId]/services/support` | Support accessed |
| 5 | Request refund | `/e/[eventId]/refunds` | Refund requested |
| 6 | Write review | `/e/[eventId]/reviews` | Review submitted |

**Post-Conditions:**
- Services accessed
- Issues resolved

---

### WF-GVTEWAY-014: Community Participation

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member engages with community

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access community | `/community` | Community hub |
| 2 | Join challenges | `/community/challenges` | Challenges joined |
| 3 | View fan content | `/community/fan-content` | Content displayed |
| 4 | Vote in polls | `/community/polls` | Votes cast |
| 5 | Browse forums | `/forums` | Forums accessed |
| 6 | Join groups | `/groups` | Groups joined |
| 7 | Connect with friends | `/friends` | Friends connected |
| 8 | Send messages | `/messages` | Messages sent |
| 9 | View activity | `/activity` | Activity feed |
| 10 | Submit UGC | `/ugc` | Content submitted |
| 11 | Share photos | `/photos` | Photos shared |
| 12 | Write reviews | `/reviews` | Reviews written |
| 13 | Create new review | `/reviews/new` | Review created |
| 14 | Join Q&A sessions | `/qa-sessions` | Q&A joined |
| 15 | Join watch parties | `/watch-parties` | Party joined |

**Post-Conditions:**
- Community engaged
- Content shared

---

### WF-GVTEWAY-015: Fan Club & Membership

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member manages fan club/membership

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access fan club | `/fan-club` | Fan club hub |
| 2 | View exclusive access | `/fan-club/exclusive-access` | Exclusives shown |
| 3 | Browse fan clubs | `/fan-clubs` | Clubs listed |
| 4 | Manage membership | `/membership` | Membership managed |
| 5 | View benefits | `/membership/benefits` | Benefits displayed |
| 6 | View rewards | `/rewards` | Rewards shown |
| 7 | Manage referrals | `/referrals` | Referrals tracked |

**Post-Conditions:**
- Membership active
- Benefits accessed

---

### WF-GVTEWAY-016: Settings & Preferences

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member updates settings

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access settings | `/settings` | Settings hub |
| 2 | Set language | `/settings/language` | Language set |
| 3 | Configure notifications | `/settings/notifications` | Notifications set |
| 4 | Manage privacy | `/settings/privacy` | Privacy configured |
| 5 | View notifications | `/notifications` | Notifications shown |
| 6 | Manage favorites | `/favorites` | Favorites managed |
| 7 | Manage wishlist | `/wishlist` | Wishlist updated |
| 8 | Manage saved searches | `/saved-searches` | Searches saved |

**Post-Conditions:**
- Settings updated
- Preferences saved

---

### WF-GVTEWAY-017: Support & Help

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member needs support

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access help | `/help` | Help center |
| 2 | Start support chat | `/support/chat` | Chat started |
| 3 | Report lost item | `/lost-found` | Item reported |
| 4 | Complete survey | `/surveys/[id]` | Survey completed |

**Post-Conditions:**
- Support received
- Issues resolved

---

### WF-GVTEWAY-018: Event Matching

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Member wants personalized recommendations

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access match | `/match` | Matching started |
| 2 | Answer preferences | `/match` | Preferences captured |
| 3 | View recommendations | `/match` | Events recommended |
| 4 | Save favorites | `/favorites` | Favorites saved |

**Post-Conditions:**
- Recommendations received
- Events saved

---

## Artist Workflows

### WF-GVTEWAY-019: Artist Profile Management

**Actor:** GVTEWAY_ARTIST, GVTEWAY_ARTIST_VERIFIED  
**Trigger:** Artist manages profile

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access profile | `/profile` | Profile displayed |
| 2 | Update profile | `/profile` | Profile updated |
| 3 | View badges | `/profile/badges` | Badges shown |
| 4 | Check reputation | `/profile/reputation` | Reputation displayed |
| 5 | Manage merch | `/merch/[artistId]` | Merch managed |
| 6 | View events | `/my-events` | Events listed |

**Post-Conditions:**
- Profile current
- Merch managed

---

### WF-GVTEWAY-020: Artist Application

**Actor:** Public User  
**Trigger:** User wants to become artist

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access apply | `/apply` | Application form |
| 2 | Complete application | `/apply` | Application submitted |
| 3 | View confirmation | `/apply/confirmation` | Confirmation shown |

**Post-Conditions:**
- Application submitted
- Review pending

---

## Admin Workflows

### WF-GVTEWAY-021: Event Creation & Management

**Actor:** GVTEWAY_ADMIN, GVTEWAY_EXPERIENCE_CREATOR  
**Trigger:** Admin creates/manages event

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access events | `/events` | Events listed |
| 2 | Create event | `/events/create` | Creation started |
| 3 | Use blueprint | `/events/create/from-blueprint` | Blueprint applied |
| 4 | Collaborate on event | `/events/create/collaboration` | Collaboration active |
| 5 | Use templates | `/events/templates` | Template applied |
| 6 | Clone event | `/events/clone` | Event cloned |
| 7 | Configure event | `/events/[id]` | Event configured |
| 8 | Build landing page | `/events/[id]/landing-builder` | Landing built |
| 9 | Configure floor | `/events/[id]/floor-config` | Floor configured |
| 10 | Set up seating | `/events/[id]/seating` | Seating set |
| 11 | Configure languages | `/events/[id]/languages` | Languages set |
| 12 | Set up RFID | `/events/[id]/rfid` | RFID configured |
| 13 | Configure accessibility | `/events/[id]/accessibility` | Accessibility set |
| 14 | Set up parking | `/events/[id]/parking` | Parking configured |
| 15 | Configure program | `/events/[id]/program` | Program set |
| 16 | Set up photo booth | `/events/[id]/photo-booth` | Photo booth ready |
| 17 | Configure social wall | `/events/[id]/social-wall` | Social wall active |
| 18 | Set up chat | `/events/[id]/chat` | Chat enabled |
| 19 | Configure waitlist | `/events/[id]/waitlist` | Waitlist active |
| 20 | Configure friends | `/events/[id]/friends` | Friends feature on |

**Post-Conditions:**
- Event created
- Configuration complete

---

### WF-GVTEWAY-022: Ticketing Administration

**Actor:** GVTEWAY_ADMIN  
**Trigger:** Admin manages ticketing

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access admin | `/dashboard` | Admin dashboard |
| 2 | Configure anti-scalping | `/admin/anti-scalping` | Anti-scalping set |
| 3 | View anti-scalping | `/tickets/anti-scalping` | Status displayed |
| 4 | Set urgency pricing | `/tickets/urgency` | Urgency configured |
| 5 | Manage promo codes | `/admin/promo-codes` | Promos managed |
| 6 | Configure early bird | `/admin/pricing/early-bird` | Early bird set |
| 7 | Manage will call | `/admin/will-call` | Will call managed |
| 8 | Sync inventory | `/admin/inventory-sync` | Inventory synced |
| 9 | View sales reporting | `/admin/sales-reporting` | Reports displayed |

**Post-Conditions:**
- Ticketing configured
- Sales tracked

---

### WF-GVTEWAY-023: Marketing Administration

**Actor:** GVTEWAY_ADMIN  
**Trigger:** Admin manages marketing

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access marketing | `/marketing/analytics` | Analytics displayed |
| 2 | Configure A/B testing | `/marketing/ab-testing` | Tests configured |
| 3 | Set early bird | `/marketing/early-bird` | Early bird set |
| 4 | Manage influencers | `/marketing/influencers` | Influencers managed |
| 5 | Create media kit | `/marketing/media-kit` | Media kit created |
| 6 | Configure pixels | `/marketing/pixels` | Tracking set |
| 7 | Manage SMS | `/admin/marketing/sms` | SMS configured |

**Post-Conditions:**
- Marketing configured
- Tracking active

---

### WF-GVTEWAY-024: Social Media Management

**Actor:** GVTEWAY_ADMIN  
**Trigger:** Admin manages social

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access social hub | `/social` | Social hub |
| 2 | Manage inbox | `/social/inbox` | Inbox managed |
| 3 | Monitor sentiment | `/social/sentiment` | Sentiment tracked |
| 4 | Handle crisis | `/social/crisis-management` | Crisis managed |
| 5 | Create story templates | `/social/story-templates` | Templates created |
| 6 | Manage TikTok challenges | `/social/tiktok-challenges` | Challenges managed |
| 7 | Manage content | `/content` | Content managed |
| 8 | Manage content calendar | `/admin/content-calendar` | Calendar managed |

**Post-Conditions:**
- Social managed
- Content scheduled

---

### WF-GVTEWAY-025: Moderation & Community Management

**Actor:** GVTEWAY_ADMIN, GVTEWAY_MODERATOR  
**Trigger:** Content needs moderation

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access moderation | `/moderate` | Moderation hub |
| 2 | Admin moderation | `/admin/moderation` | Admin tools |
| 3 | Review content | `/moderate` | Content reviewed |
| 4 | Manage contests | `/admin/contests` | Contests managed |
| 5 | Review community | `/community` | Community monitored |

**Post-Conditions:**
- Content moderated
- Community safe

---

### WF-GVTEWAY-026: POS & Operations

**Actor:** GVTEWAY_ADMIN  
**Trigger:** Admin manages POS/operations

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access POS | `/admin/pos` | POS hub |
| 2 | Configure cashless | `/admin/pos/cashless` | Cashless set |
| 3 | Manage integrations | `/admin/integrations` | Integrations configured |

**Post-Conditions:**
- POS configured
- Operations ready

---

## Event Staff Workflows

### WF-GVTEWAY-027: Box Office Operations

**Actor:** Event Staff (via event role)  
**Trigger:** Box office operations needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access box office | `/e/[eventId]/box-office` | Box office opened |
| 2 | Process will call | `/e/[eventId]/will-call` | Will call processed |
| 3 | Check in attendees | `/e/[eventId]/check-in` | Attendees checked in |
| 4 | Scan tickets | `/e/[eventId]/scan` | Tickets scanned |
| 5 | Issue credentials | `/e/[eventId]/credentials` | Credentials issued |

**Post-Conditions:**
- Attendees processed
- Access granted

---

### WF-GVTEWAY-028: Event Settlement

**Actor:** GVTEWAY_ADMIN  
**Trigger:** Event complete, settlement needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access settlement | `/e/[eventId]/settlement` | Settlement hub |
| 2 | Review sales | `/admin/sales-reporting` | Sales reviewed |
| 3 | Process settlement | `/e/[eventId]/settlement` | Settlement processed |

**Post-Conditions:**
- Settlement complete
- Funds distributed

---

## Venue Manager Workflows

### WF-GVTEWAY-029: Venue Management

**Actor:** GVTEWAY_VENUE_MANAGER  
**Trigger:** Venue manager manages venue

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access venues | `/venues` | Venues listed |
| 2 | Manage venue | `/venues/[id]` | Venue managed |
| 3 | View events | `/events` | Events listed |
| 4 | Access dashboard | `/dashboard` | Dashboard displayed |

**Post-Conditions:**
- Venue managed
- Events tracked

---

## Authentication Workflows

### WF-GVTEWAY-030: User Authentication

**Actor:** All Users  
**Trigger:** User needs to access system

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to login | `/(auth)/login` | Login form |
| 2 | Enter credentials | `/auth/signin` | Credentials entered |
| 3 | Submit | `/auth/signin` | Auth attempted |
| 4 | **Success:** Home | `/` | Access granted |
| 5 | **Failure:** Error | `/auth/signin` | Error shown |

**Alternative: Magic Link**
| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Request magic link | `/auth/magic-link` | Link requested |
| 2 | Check email | Email | Link received |
| 3 | Click link | Email | Authenticated |

**Alternative: Password Reset**
| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Forgot password | `/auth/forgot-password` | Reset form |
| 2 | Enter email | `/auth/forgot-password` | Email entered |
| 3 | Reset link | Email | Link received |
| 4 | New password | `/auth/reset-password` | Password set |

---

## Offline Workflows

### WF-GVTEWAY-031: Offline Access

**Actor:** GVTEWAY_MEMBER  
**Trigger:** Network unavailable

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access offline mode | `/offline` | Offline active |
| 2 | View offline wallet | `/wallet/offline` | Wallet available |
| 3 | Access cached tickets | `/wallet` | Tickets shown |

**Post-Conditions:**
- Tickets accessible offline
- Event access maintained

---

*End of GVTEWAY Detailed Workflows*
