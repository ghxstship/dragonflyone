# Data Protection Impact Assessment: Crew Management

## GHXSTSHIP Industries - DPIA for ATLVS Crew Management Platform

**Document Version:** 1.0  
**Assessment Date:** January 2025  
**DPO Approval:** Pending  
**Review Date:** January 2026

---

## 1. Project Overview

### 1.1 Basic Details

| Field | Value |
|-------|-------|
| **Project Name** | ATLVS Crew Management Platform |
| **Project Owner** | Product Team |
| **DPO Consulted** | Yes |
| **Assessment Type** | Full DPIA |

### 1.2 Project Description

ATLVS is a B2B platform for live entertainment production management that enables:
- Crew scheduling and assignment
- Time tracking and attendance
- Payroll data collection
- Skills and certification tracking
- Communication and collaboration
- Document management

### 1.3 Business Objectives

- Streamline crew scheduling for productions
- Track certifications and compliance requirements
- Facilitate payroll processing
- Enable efficient communication
- Maintain production documentation

---

## 2. Data Processing Details

### 2.1 Categories of Personal Data

| Category | Collected | Purpose | Legal Basis |
|----------|-----------|---------|-------------|
| **Name** | ✅ Yes | Identity, contracts | Contract |
| **Email** | ✅ Yes | Communication | Contract |
| **Phone** | ✅ Yes | Emergency contact | Contract |
| **Address** | ✅ Yes | Payroll, contracts | Contract |
| **Date of Birth** | ✅ Yes | Age verification, payroll | Legal obligation |
| **Government ID** | ✅ Yes | Employment verification | Legal obligation |
| **Bank Details** | ✅ Yes | Payroll | Contract |
| **Tax Information** | ✅ Yes | Tax compliance | Legal obligation |
| **Work History** | ✅ Yes | Qualifications | Legitimate interest |
| **Certifications** | ✅ Yes | Compliance | Legal obligation |
| **Photos** | ✅ Yes | ID badges | Consent |
| **Location** | ✅ Yes | Time tracking | Contract |
| **Health/Safety** | ✅ Yes | Workplace safety | Legal obligation |

### 2.2 Special Category Data

| Category | Collected | Justification |
|----------|-----------|---------------|
| Health Data | ✅ Limited | Workplace safety, accommodations |
| Biometric Data | ❌ No | Not required |
| Trade Union | ❌ No | Not required |
| Criminal Records | ✅ Limited | Security clearances (with consent) |

**Note:** Health data is limited to safety-relevant information (allergies, emergency medical info) collected with explicit consent.

### 2.3 Data Subjects

| Category | Approximate Number | Vulnerable? |
|----------|-------------------|-------------|
| Crew Members | 50,000+ | No |
| Contractors | 10,000+ | No |
| Production Staff | 5,000+ | No |
| Minors (performers) | 500+ | Yes |

### 2.4 Data Sources

- ✅ Directly from data subjects (onboarding)
- ✅ From employers/agencies
- ✅ From certification bodies
- ✅ Background check providers (with consent)
- ❌ Publicly available sources

---

## 3. Processing Operations

### 3.1 Data Flow

```
Crew Onboarding
       │
       ▼
┌─────────────────┐
│   ATLVS App     │
│  - Profile      │
│  - Certs        │
│  - Availability │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Supabase DB    │────►│  Payroll Export │
│  - Crew records │     │  (Encrypted)    │
│  - Schedules    │     └─────────────────┘
│  - Time logs    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Document Store │     │  Notifications  │
│  - Contracts    │     │  - Email/SMS    │
│  - Certs        │     └─────────────────┘
└─────────────────┘
```

### 3.2 Processing Activities

| Activity | Description | Automated? |
|----------|-------------|------------|
| Crew Onboarding | Profile creation, document upload | Partially |
| Scheduling | Shift assignment and management | Yes |
| Time Tracking | Clock in/out, GPS verification | Yes |
| Payroll Data | Hours aggregation, rate calculation | Yes |
| Certification Tracking | Expiry monitoring, renewal alerts | Yes |
| Background Checks | Third-party verification | No |
| Communication | Shift notifications, updates | Yes |

---

## 4. Necessity and Proportionality

### 4.1 Necessity Assessment

| Question | Assessment |
|----------|------------|
| Is processing necessary? | Yes - Employment/contractor management |
| Could purpose be achieved with less data? | No - Legal requirements mandate certain data |
| Less intrusive alternatives? | No - Current processing is minimal for purpose |

### 4.2 Data Minimization

| Data Point | Necessity | Retention |
|------------|-----------|-----------|
| Name, Contact | Essential | Employment + 7 years |
| Government ID | Legal requirement | Employment + 7 years |
| Bank Details | Payroll | Employment + 7 years |
| Tax Info | Legal requirement | Employment + 7 years |
| Certifications | Safety compliance | Until expiry + 2 years |
| Time Records | Payroll, disputes | 7 years |
| Health Info | Safety only | Employment duration |

### 4.3 Proportionality

**Benefits:**
- Efficient crew management
- Legal compliance (employment, tax, safety)
- Accurate payroll processing
- Safety certification tracking

**Potential Harms:**
- Sensitive employment data exposure
- Financial data breach
- Discrimination based on health data
- Excessive surveillance concerns

**Conclusion:** Processing is proportionate given legal requirements and safeguards.

---

## 5. Risk Assessment

### 5.1 Identified Risks

| ID | Risk | Likelihood | Severity | Level |
|----|------|------------|----------|-------|
| R1 | Breach of financial data | Low | High | Medium |
| R2 | Unauthorized access to personnel files | Medium | High | High |
| R3 | Misuse of health information | Low | High | Medium |
| R4 | Excessive location tracking | Medium | Medium | Medium |
| R5 | Discrimination from data profiling | Low | High | Medium |
| R6 | Minors' data exposure | Low | High | Medium |
| R7 | Third-party processor breach | Low | High | Medium |

### 5.2 Risk Details

**R2: Unauthorized Personnel File Access**
- **Description:** Managers accessing data beyond their need
- **Impact:** Privacy violation, potential discrimination
- **Likelihood:** Medium (common in HR systems)
- **Mitigation:** Role-based access, audit logging, training

**R3: Health Information Misuse**
- **Description:** Health data used for discrimination
- **Impact:** Legal liability, harm to individuals
- **Likelihood:** Low (limited collection, access controls)
- **Mitigation:** Strict access, purpose limitation, training

**R4: Location Tracking**
- **Description:** GPS tracking beyond work hours
- **Impact:** Privacy invasion, trust erosion
- **Likelihood:** Medium (feature exists)
- **Mitigation:** Work hours only, transparency, opt-out

---

## 6. Risk Mitigation Measures

### 6.1 Technical Measures

| Measure | Status | Effectiveness |
|---------|--------|---------------|
| Encryption at Rest | ✅ Implemented | High |
| Encryption in Transit | ✅ Implemented | High |
| Row-Level Security | ✅ Implemented | High |
| Role-Based Access | ✅ Implemented | High |
| Audit Logging | ✅ Implemented | High |
| Data Masking | ✅ Implemented | High |
| Secure Document Storage | ✅ Implemented | High |
| Location Boundaries | ✅ Implemented | Medium |

### 6.2 Organizational Measures

| Measure | Status | Effectiveness |
|---------|--------|---------------|
| Privacy Policy | ✅ Published | High |
| Employee Training | ✅ Annual | Medium |
| Access Reviews | ✅ Quarterly | High |
| Incident Response | ✅ Documented | High |
| DPAs with Processors | ✅ Signed | High |
| Data Retention Policy | ✅ Implemented | High |
| Background Check Policy | ✅ Documented | High |

### 6.3 Residual Risk

| ID | Original Level | Mitigation | Residual Level | Acceptable? |
|----|----------------|------------|----------------|-------------|
| R1 | Medium | Encryption, access controls | Low | ✅ Yes |
| R2 | High | RBAC, audit, training | Medium | ✅ Yes |
| R3 | Medium | Access limits, purpose limit | Low | ✅ Yes |
| R4 | Medium | Boundaries, transparency | Low | ✅ Yes |
| R5 | Medium | Training, audits | Low | ✅ Yes |
| R6 | Medium | Special protections | Low | ✅ Yes |
| R7 | Medium | DPAs, audits | Low | ✅ Yes |

---

## 7. Data Subject Rights

### 7.1 Rights Implementation

| Right | Implementation | Response Time |
|-------|----------------|---------------|
| Access | Self-service + HR request | 30 days |
| Rectification | Self-service (some fields) | Immediate |
| Erasure | HR request (with limitations) | 30 days |
| Portability | Export feature | 30 days |
| Object | HR request | 7 days |
| Restrict | HR request | 7 days |

### 7.2 Limitations

Certain data cannot be deleted due to legal requirements:
- Tax records (7 years)
- Payroll records (7 years)
- Safety incident records (varies by jurisdiction)
- Contractual records (contract + 6 years)

---

## 8. Special Considerations

### 8.1 Employee Monitoring

| Monitoring Type | Implemented | Justification | Transparency |
|-----------------|-------------|---------------|--------------|
| Time Tracking | ✅ Yes | Payroll accuracy | ✅ Disclosed |
| Location (work) | ✅ Yes | Site verification | ✅ Disclosed |
| Location (off-work) | ❌ No | Not justified | N/A |
| Email/Comms | ❌ No | Not implemented | N/A |
| Device Monitoring | ❌ No | Not implemented | N/A |

### 8.2 Automated Decision-Making

| Process | Automated? | Human Review |
|---------|------------|--------------|
| Scheduling | Partially | Manager approval |
| Payroll Calculation | Yes | HR review |
| Certification Alerts | Yes | N/A (notifications only) |
| Background Checks | No | Always manual |

### 8.3 Minors' Data

For crew members under 18:
- ✅ Parental/guardian consent required
- ✅ Limited data collection
- ✅ Enhanced access controls
- ✅ Working hours restrictions enforced
- ✅ Chaperone requirements tracked

---

## 9. International Transfers

### 9.1 Transfer Summary

| Recipient | Location | Mechanism |
|-----------|----------|-----------|
| Supabase | US | SCCs |
| Vercel | US | SCCs |
| Resend | US | SCCs |

### 9.2 Safeguards

- Standard Contractual Clauses with all processors
- Encryption of all transferred data
- Access limited to necessary personnel
- Regular compliance audits

---

## 10. DPIA Outcome

### 10.1 Summary

**Overall Risk Level:** MEDIUM (after mitigation)

**Key Findings:**
1. Processing involves sensitive employment and financial data
2. Legal requirements mandate much of the data collection
3. Technical controls adequately protect data
4. Enhanced measures needed for health data and minors

### 10.2 Recommendations

1. **Implement data masking** for sensitive fields in non-production environments
2. **Enhanced training** for managers on data protection
3. **Regular access reviews** (quarterly minimum)
4. **Separate storage** for health-related information
5. **Annual penetration testing** of crew management systems

### 10.3 Decision

**✅ APPROVED WITH CONDITIONS** - Processing may proceed with:

1. Implementation of enhanced health data protections within 90 days
2. Manager training completion within 60 days
3. Quarterly access reviews
4. Annual DPIA review

---

## 11. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Owner | | | |
| Data Protection Officer | | | |
| HR Director | | | |
| Legal Counsel | | | |

---

## 12. Review Schedule

| Review Type | Frequency | Next Review |
|-------------|-----------|-------------|
| Full DPIA Review | Annual | January 2026 |
| Risk Assessment | Quarterly | April 2025 |
| Access Review | Quarterly | April 2025 |
| Training Verification | Annual | January 2026 |

---

## Appendix A: Legal Basis by Data Category

| Data Category | Legal Basis | Specific Law/Requirement |
|---------------|-------------|--------------------------|
| Identity | Contract | Employment/contractor agreement |
| Tax Information | Legal Obligation | Tax laws (varies by jurisdiction) |
| Bank Details | Contract | Payment processing |
| Certifications | Legal Obligation | Workplace safety regulations |
| Health (safety) | Legal Obligation | OSHA, workplace safety laws |
| Time Records | Legal Obligation | Labor laws, wage regulations |
| Background Checks | Consent | Pre-employment screening |

## Appendix B: Retention Schedule

| Data Type | Retention Period | Legal Basis |
|-----------|------------------|-------------|
| Employment Records | Employment + 7 years | Tax, labor law |
| Payroll Records | 7 years | Tax law |
| Time Records | 7 years | Labor law |
| Certifications | Until expiry + 2 years | Safety compliance |
| Health Information | Employment duration | Purpose limitation |
| Background Checks | 3 years | Best practice |
| Communications | 2 years | Business records |

---

*This DPIA should be reviewed annually or when significant changes are made to the processing activity.*
