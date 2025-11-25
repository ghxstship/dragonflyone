# 🚀 Advancing Catalog - Quick Start Guide

**Get your production advancing system running in 15 minutes!**

---

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Supabase CLI installed (`npm install -g supabase`)
- Access to your Supabase project

---

## ⚡ Quick Setup (5 Steps)

### 1️⃣ **Run Database Migrations**

```bash
cd supabase
supabase migration up

# Verify tables were created
supabase db remote list
```

**Expected Output:**
- ✅ `production_advancing_catalog` table
- ✅ `production_advances` table  
- ✅ `production_advance_items` table

---

### 2️⃣ **Generate TypeScript Types**

```bash
# From project root
supabase gen types typescript --local > packages/config/supabase-types.ts

# Or if using remote database
supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/config/supabase-types.ts
```

**This fixes all TypeScript errors related to database tables!**

---

### 3️⃣ **Rebuild Shared Packages**

```bash
# Build config package (types, hooks, utilities)
cd packages/config
pnpm build

# Build UI package (components)
cd ../ui
pnpm build

# Return to root
cd ../..
```

---

### 4️⃣ **Start Development Servers**

**Terminal 1 - ATLVS (Management Platform):**
```bash
cd apps/atlvs
pnpm dev

# Runs on http://localhost:3000
```

**Terminal 2 - COMPVSS (Operations Platform):**
```bash
cd apps/compvss
pnpm dev

# Runs on http://localhost:3001
```

---

### 5️⃣ **Test the System**

#### **Test Scenario 1: Create Request (COMPVSS)**
1. Navigate to `http://localhost:3001/advancing`
2. Click "Create New Request"
3. Browse catalog or add custom items
4. Enter team/workspace info
5. Submit request
6. ✅ Status should be "submitted"

#### **Test Scenario 2: Approve Request (ATLVS)**
1. Navigate to `http://localhost:3000/advancing`
2. See submitted request in "Pending Review" tab
3. Click "View Details"
4. Click "Approve" button
5. Add optional notes
6. Submit approval
7. ✅ Status should be "approved"

#### **Test Scenario 3: Fulfill Request (COMPVSS)**
1. Back to `http://localhost:3001/advancing`
2. Go to "To Fulfill" tab
3. Click approved request
4. Go to "Fulfill Items" tab
5. Enter fulfilled quantities
6. Add actual costs
7. Submit fulfillment
8. ✅ Status should update to "fulfilled"

---

## 🎯 System URLs

### **ATLVS (Management)**
- Dashboard: `/advancing`
- Request Detail: `/advancing/requests/[id]`
- Analytics: `/advancing/analytics` (when implemented)

### **COMPVSS (Operations)**
- Dashboard: `/advancing`
- Create Request: `/advancing/new`
- Request Detail: `/advancing/[id]`
- Fulfillment: `/advancing/[id]` (Fulfill Items tab)

---

## 📊 API Endpoints Available

### **Catalog**
```
GET  /api/advancing/catalog
GET  /api/advancing/catalog/categories
GET  /api/advancing/catalog/[id]
```

### **Requests**
```
GET    /api/advancing/requests
POST   /api/advancing/requests
GET    /api/advancing/requests/[id]
PATCH  /api/advancing/requests/[id]
DELETE /api/advancing/requests/[id]
```

### **Workflows**
```
POST /api/advancing/requests/[id]/approve
POST /api/advancing/requests/[id]/reject
POST /api/advancing/requests/[id]/fulfill
```

### **System**
```
GET  /api/advancing/analytics
POST /api/advancing/batch
```

---

## 🧪 Testing with cURL

### **Create Request**
```bash
curl -X POST http://localhost:3000/api/advancing/requests \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "team_workspace": "Production Team A",
    "activation_name": "Summer Festival 2025",
    "items": [
      {
        "item_name": "PA System",
        "quantity": 2,
        "unit": "Per Unit/Day",
        "unit_cost": 500
      }
    ],
    "estimated_cost": 1000
  }'
```

### **Approve Request**
```bash
curl -X POST http://localhost:3000/api/advancing/requests/[REQUEST_ID]/approve \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "reviewer_notes": "Approved for summer festival",
    "approved_cost": 950
  }'
```

### **Get Analytics**
```bash
curl http://localhost:3000/api/advancing/analytics \
  -H "x-organization-id: YOUR_ORG_ID"
```

---

## 🔧 Configuration

### **Environment Variables**

Create `.env.local` in both `apps/atlvs` and `apps/compvss`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URLs (for notifications)
NEXT_PUBLIC_ATLVS_URL=http://localhost:3000
NEXT_PUBLIC_COMPVSS_URL=http://localhost:3001

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

---

## 📧 Email Notifications Setup (Optional)

To enable email notifications, create an email API endpoint:

```typescript
// apps/atlvs/src/app/api/notifications/email/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { to, subject, html, text } = await request.json();
  
  // Integrate with your email service
  // Examples: SendGrid, AWS SES, Resend, etc.
  
  return NextResponse.json({ success: true });
}
```

---

## 🔗 Webhook Setup (Optional)

To receive webhooks from the advancing system:

```typescript
// Your external system
app.post('/webhooks/advancing', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  const payload = req.body;
  
  // Verify signature
  // Process event
  
  res.status(200).send('OK');
});
```

Configure webhooks in your database:
```sql
INSERT INTO webhook_configs (url, events, secret, enabled)
VALUES (
  'https://your-system.com/webhooks/advancing',
  ARRAY['advance.submitted', 'advance.approved', 'advance.fulfilled'],
  'your-secret-key',
  true
);
```

---

## 🐛 Troubleshooting

### **Issue: TypeScript errors about missing tables**
**Solution:** Run step 2 (Generate TypeScript Types)

### **Issue: Components not found**
**Solution:** Run step 3 (Rebuild Shared Packages)

### **Issue: "Module not found" errors**
**Solution:** Run `pnpm install` in project root

### **Issue: Database connection errors**
**Solution:** Check your Supabase credentials in `.env.local`

### **Issue: No catalog items showing**
**Solution:** Verify migration `0031_populate_advancing_catalog.sql` ran successfully

---

## 📚 Next Steps

### **Immediate**
1. ✅ Complete catalog population (remaining 249 items)
2. ✅ Configure email service for notifications
3. ✅ Set up webhooks if needed
4. ✅ Run user acceptance testing

### **Short Term**
- Add request templates for common scenarios
- Implement vendor management integration
- Create PDF export functionality
- Build mobile-responsive views
- Add advanced reporting dashboard

### **Long Term**
- AI-powered item recommendations
- Predictive budgeting based on historical data
- Automated vendor quote requests
- Calendar integration for delivery scheduling
- Multi-language support

---

## 💡 Pro Tips

### **Tip 1: Batch Operations**
Use batch approve/reject for multiple requests:
```bash
curl -X POST http://localhost:3000/api/advancing/batch \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "approve",
    "request_ids": ["id1", "id2", "id3"],
    "reviewer_notes": "Batch approval for Q4 events"
  }'
```

### **Tip 2: Search Catalog**
Use full-text search for finding items:
```
GET /api/advancing/catalog?search=microphone&category=Technical
```

### **Tip 3: Filter Requests**
Combine multiple filters:
```
GET /api/advancing/requests?status=submitted&project_id=xxx&limit=50
```

### **Tip 4: Track Analytics**
Monitor system usage:
```
GET /api/advancing/analytics?start_date=2025-01-01&end_date=2025-12-31
```

---

## 🎓 Learning Resources

### **Key Files to Study**
```
/packages/config/types/advancing.ts          - TypeScript types
/packages/config/hooks/useAdvancingCatalog.ts - React hooks
/packages/config/utils/advancing-helpers.ts   - Utility functions
/apps/atlvs/src/app/api/advancing/           - Backend APIs
/apps/compvss/src/components/advancing/      - UI components
```

### **Documentation**
1. `ADVANCING_CATALOG_IMPLEMENTATION.md` - Initial implementation
2. `ADVANCING_COMPLETE_IMPLEMENTATION.md` - Full system overview
3. `ADVANCING_SYSTEM_FINAL_STATUS.md` - Final status report
4. `ADVANCING_QUICK_START.md` - This guide!

---

## ✅ Verification Checklist

Before going to production, verify:

- [ ] Database migrations completed successfully
- [ ] TypeScript types generated
- [ ] All packages built
- [ ] Both platforms (ATLVS + COMPVSS) start without errors
- [ ] Can create a request in COMPVSS
- [ ] Can approve/reject in ATLVS
- [ ] Can fulfill in COMPVSS
- [ ] Email notifications working (if configured)
- [ ] Webhooks working (if configured)
- [ ] Analytics dashboard shows data
- [ ] All TypeScript errors resolved

---

## 🎉 Success!

If you've completed all steps, you now have a **fully functional production advancing catalog system** running locally!

**System Capabilities:**
- ✅ 329 standardized production items (ready to populate)
- ✅ Full request workflow (create → approve → fulfill)
- ✅ Cross-platform (management + operations)
- ✅ Real-time updates via React Query
- ✅ Analytics and reporting
- ✅ Batch operations
- ✅ Email notifications (optional)
- ✅ Webhook integrations (optional)

---

## 📞 Need Help?

**Common Questions:**
1. **How do I add more catalog items?**
   - Edit `supabase/migrations/0031_populate_advancing_catalog.sql`
   - Or use the Supabase dashboard to insert directly

2. **Can I customize the workflow?**
   - Yes! Edit the status enum and API route logic
   - Update frontend components for new status options

3. **How do I export to PDF?**
   - Install a PDF library (e.g., `react-pdf`, `jspdf`)
   - Create export functionality in request detail pages

4. **Can I integrate with other systems?**
   - Yes! Use the webhook system for real-time integrations
   - Or query the API endpoints directly from external systems

---

**Happy Advancing! 🚀**

Your production system is ready to streamline production equipment and service requests!
