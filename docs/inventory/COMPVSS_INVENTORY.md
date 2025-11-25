# COMPVSS - Production Management Platform Inventory

**Application:** COMPVSS (Compass)  
**Purpose:** Production crew management, equipment tracking, safety, and event execution  
**Target Users:** Production crew, technical directors, project managers, safety officers  
**Last Updated:** November 23, 2025

---

## Pages Inventory (14 Total)

### Authentication
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/auth/signin` | `src/app/auth/signin/page.tsx` | ✅ | Sign-in page for crew |

### Core Application Pages
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/` | `src/app/page.tsx` | ✅ | Landing/home page |
| `/dashboard` | `src/app/dashboard/page.tsx` | ✅ | Production dashboard |

### Crew Management
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/crew` | `src/app/crew/page.tsx` | 🟡 | Crew directory & roster |
| `/crew/assign` | `src/app/crew/assign/page.tsx` | 🟡 | Crew assignment interface |
| `/directory` | `src/app/directory/page.tsx` | 🟡 | Full crew directory |

### Project Management
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/projects` | `src/app/projects/page.tsx` | 🟡 | Production projects list |
| `/projects/new` | `src/app/projects/new/page.tsx` | 🟡 | Create new production |

### Production Planning
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/schedule` | `src/app/schedule/page.tsx` | 🟡 | Production schedule calendar |
| `/run-of-show` | `src/app/run-of-show/page.tsx` | 🟡 | Event run-of-show planning |
| `/build-strike` | `src/app/build-strike/page.tsx` | 🟡 | Build/strike coordination |

### Equipment & Safety
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/equipment` | `src/app/equipment/page.tsx` | 🟡 | Equipment inventory |
| `/safety` | `src/app/safety/page.tsx` | 🟡 | Safety protocols & incidents |

### Venue Management
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/venues` | `src/app/venues/page.tsx` | 🟡 | Venue information & specs |

---

## Components Inventory (8 Total)

### Navigation Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `Navigation` | `src/components/navigation.tsx` | Layout | Main app navigation |
| `ProductionNavigation` | `src/components/production-navigation.tsx` | Layout | Production-specific nav |

### Crew Management Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `CrewCard` | `src/components/CrewCard.tsx` | Display | Crew member summary card |
| `CrewAssignmentModal` | `src/components/crew-assignment-modal.tsx` | Modal | Crew assignment interface |
| `CrewIntelligence` | `src/components/crew-intelligence.tsx` | Widget | Crew analytics & insights |

### Project Management Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `TaskBoard` | `src/components/task-board.tsx` | Display | Kanban-style task board |

### Layout Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `Section` | `src/components/section.tsx` | Layout | Reusable section wrapper |

### Route Protection
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Auth | Route authentication wrapper |

---

## API Routes Inventory (11 Total)

### Assets Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/assets` | `src/app/api/assets/route.ts` | GET, POST | Equipment assets list/create |
| `/api/assets/[id]` | `src/app/api/assets/[id]/route.ts` | GET, PATCH, DELETE | Single asset operations |

### Crew Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/crew` | `src/app/api/crew/route.ts` | GET, POST | Crew roster operations |
| `/api/crew/[id]` | `src/app/api/crew/[id]/route.ts` | GET, PATCH, DELETE | Single crew member operations |
| `/api/crew/assign` | `src/app/api/crew/assign/route.ts` | POST | Assign crew to projects |

### Equipment Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/equipment` | `src/app/api/equipment/route.ts` | GET, POST | Equipment inventory |

### Project Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/projects` | `src/app/api/projects/route.ts` | GET, POST | Production projects |
| `/api/projects/[id]` | `src/app/api/projects/[id]/route.ts` | GET, PATCH, DELETE | Single project operations |
| `/api/projects/create` | `src/app/api/projects/create/route.ts` | POST | Create new production |

### Safety Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/safety/incidents` | `src/app/api/safety/incidents/route.ts` | GET, POST | Safety incident tracking |

### Scheduling
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/schedule` | `src/app/api/schedule/route.ts` | GET, POST | Production schedule |

---

## Modals & Overlays

### Crew Assignment Modal
**Component:** `CrewAssignmentModal`  
**Purpose:** Assign crew members to production projects  
**Features:**
- Multi-select crew members
- Display crew availability
- Show crew roles & skills
- Batch assignment
- Real-time availability check

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `projectId: string`
- `availableCrew: CrewMember[]`
- `onAssign: (crewIds: string[]) => Promise<void>`

---

## Forms & Data Entry

### Project Creation Form
**Location:** `/projects/new`  
**Purpose:** Create new production project  
**Fields:**
- Project name (text)
- Client/organization (text)
- Project type (select)
- Start date (date)
- End date (date)
- Venue (select/text)
- Production manager (select)
- Technical director (select)
- Budget (number)
- Description (textarea)
- Special requirements (textarea)

---

## Key Features & Workflows

### Crew Management
- [ ] Crew roster with skills & certifications
- [x] Crew assignment modal
- [ ] Crew availability calendar
- [ ] Crew contact information
- [ ] Skill-based crew search
- [ ] Certification tracking

### Production Planning
- [ ] Project timeline visualization
- [ ] Resource allocation
- [ ] Equipment booking
- [ ] Venue coordination
- [ ] Run-of-show builder
- [ ] Build/strike schedule

### Equipment Management
- [ ] Equipment inventory list
- [ ] Equipment availability tracking
- [ ] Equipment maintenance logs
- [ ] Equipment checkout system
- [ ] Asset condition tracking

### Safety & Compliance
- [ ] Safety incident reporting
- [ ] Safety checklist management
- [ ] Crew certification verification
- [ ] Risk assessment tools
- [ ] Emergency contact database

### Scheduling
- [ ] Calendar view of productions
- [ ] Crew schedule conflicts
- [ ] Equipment booking calendar
- [ ] Venue availability
- [ ] Timeline gantt charts

---

## Widgets & Intelligence

### Crew Intelligence Widget
**Component:** `CrewIntelligence`  
**Features:**
- Crew utilization metrics
- Skills gap analysis
- Availability forecasting
- Performance tracking
- Certification expiry alerts

### Task Board
**Component:** `TaskBoard`  
**Features:**
- Kanban-style workflow
- Drag-and-drop task management
- Task assignment
- Status tracking
- Priority indicators

---

## Build Checklist

### Phase 1: Core Infrastructure ✅
- [x] Page routing structure
- [x] API route definitions
- [x] Authentication setup
- [x] Basic navigation

### Phase 2: Component Development 🟡
- [x] Crew assignment modal
- [x] Crew intelligence widget
- [x] Task board component
- [ ] Project creation form (in progress)
- [ ] Equipment checkout form
- [ ] Safety incident form
- [ ] Run-of-show builder
- [ ] Schedule calendar

### Phase 3: Data Integration ⚪
- [ ] Connect all API routes to Supabase
- [ ] Implement crew availability logic
- [ ] Real-time schedule updates
- [ ] Equipment booking system
- [ ] Safety incident workflow

### Phase 4: Advanced Features ⚪
- [ ] Crew skills matching algorithm
- [ ] Equipment maintenance scheduling
- [ ] Automated crew notifications
- [ ] Mobile-responsive design
- [ ] Offline capability

### Phase 5: Testing ⚪
- [ ] Unit tests for components
- [ ] Integration tests for APIs
- [ ] E2E tests for crew assignment
- [ ] Performance testing

---

## Database Tables Used

- `crew_members`
- `crew_assignments`
- `crew_certifications`
- `projects` (production projects)
- `assets` (equipment)
- `equipment_bookings`
- `safety_incidents`
- `venues`
- `schedules`
- `run_of_show_items`

See database migrations for complete schema details.

---

## Role-Based Access

### Production Manager
- Full access to project creation
- Crew assignment
- Equipment booking
- Budget oversight

### Technical Director
- Equipment management
- Crew technical assignments
- Safety protocols
- Venue coordination

### Crew Member
- View assigned projects
- Update availability
- Report incidents
- View schedule

### Safety Officer
- Incident reporting
- Safety protocol management
- Certification verification
- Risk assessments
