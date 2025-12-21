# International Data Transfers Documentation

## GHXSTSHIP Industries - Cross-Border Data Transfer Framework

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Legal Basis:** GDPR Chapter V, UK GDPR, SCCs

---

## 1. Executive Summary

This document outlines the legal mechanisms and safeguards GHXSTSHIP Industries uses for international transfers of personal data. As a global platform serving users across 52+ countries, we ensure all cross-border data transfers comply with applicable data protection laws.

---

## 2. Data Transfer Overview

### 2.1 Primary Data Flows

| From | To | Data Types | Legal Basis |
|------|-----|------------|-------------|
| EU/EEA | United States | User data, analytics | SCCs + Supplementary Measures |
| UK | United States | User data, analytics | UK Addendum to SCCs |
| Brazil | United States | User data | LGPD-compliant contracts |
| Canada | United States | User data | PIPEDA-compliant contracts |
| Australia | United States | User data | Privacy Act compliance |

### 2.2 Data Processing Locations

| Service | Provider | Location | Adequacy Status |
|---------|----------|----------|-----------------|
| Database | Supabase | US (AWS) | SCCs required |
| Hosting | Vercel | Global CDN | SCCs required |
| Payments | Stripe | US/EU | Adequate (EU operations) |
| Email | Resend | US | SCCs required |
| CDN | Cloudflare | Global | SCCs required |
| Monitoring | Sentry | US | SCCs required |

---

## 3. Legal Mechanisms

### 3.1 Adequacy Decisions

The European Commission has recognized the following countries as providing adequate protection:

**Currently Adequate:**
- Andorra, Argentina, Canada (commercial), Faroe Islands, Guernsey, Israel, Isle of Man, Japan, Jersey, New Zealand, Republic of Korea, Switzerland, United Kingdom, Uruguay

**EU-US Data Privacy Framework:**
- Stripe is certified under the EU-US Data Privacy Framework
- Other US providers use SCCs with supplementary measures

### 3.2 Standard Contractual Clauses (SCCs)

We use the EU Commission's Standard Contractual Clauses (Decision 2021/914) for transfers to countries without adequacy decisions.

**Module Selection:**

| Transfer Type | Module | Parties |
|---------------|--------|---------|
| Controller to Processor | Module 2 | GHXSTSHIP → Sub-processors |
| Processor to Processor | Module 3 | Sub-processor chains |

### 3.3 UK International Data Transfer Agreement

For transfers from the UK, we use:
- UK Addendum to EU SCCs (ICO approved)
- International Data Transfer Agreement (IDTA) where applicable

### 3.4 Binding Corporate Rules

Not applicable - GHXSTSHIP does not currently use BCRs.

---

## 4. Transfer Impact Assessments

### 4.1 Assessment Framework

For each international transfer, we assess:

1. **Legal Framework Analysis**
   - Laws in destination country
   - Government access powers
   - Judicial remedies available

2. **Technical Measures**
   - Encryption standards
   - Access controls
   - Data minimization

3. **Organizational Measures**
   - Contractual protections
   - Policies and procedures
   - Staff training

4. **Risk Assessment**
   - Likelihood of government access
   - Impact on data subjects
   - Effectiveness of safeguards

### 4.2 US Transfer Assessment

**Destination:** United States

**Legal Framework:**
- FISA Section 702 and EO 12333 allow government surveillance
- CLOUD Act enables cross-border data requests
- EU-US Data Privacy Framework provides some protections

**Risk Level:** Medium

**Supplementary Measures Applied:**
- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Pseudonymization where possible
- ✅ Access controls and audit logging
- ✅ Data minimization practices
- ✅ Contractual commitments from providers

**Assessment Conclusion:** Transfer is permissible with SCCs and supplementary measures.

---

## 5. Supplementary Measures

### 5.1 Technical Measures

| Measure | Implementation | Effectiveness |
|---------|----------------|---------------|
| **Encryption at Rest** | AES-256 via Supabase | High - Data unreadable without keys |
| **Encryption in Transit** | TLS 1.3 | High - Prevents interception |
| **Key Management** | Provider-managed with rotation | Medium - Keys in same jurisdiction |
| **Pseudonymization** | User IDs instead of names in logs | Medium - Reduces identifiability |
| **Data Minimization** | Only necessary data transferred | High - Limits exposure |

### 5.2 Organizational Measures

| Measure | Implementation |
|---------|----------------|
| **DPA with Providers** | All sub-processors have signed DPAs |
| **Access Restrictions** | Role-based access, need-to-know basis |
| **Audit Rights** | Contractual right to audit providers |
| **Breach Notification** | 24-48 hour notification requirements |
| **Sub-processor Approval** | Prior approval required for new sub-processors |

### 5.3 Contractual Measures

| Measure | Implementation |
|---------|----------------|
| **SCCs** | Incorporated into all processor agreements |
| **Government Access Clause** | Providers must notify of requests where legal |
| **Suspension Rights** | Right to suspend transfers if laws change |
| **Audit Cooperation** | Providers must cooperate with audits |

---

## 6. Sub-Processor Transfers

### 6.1 Approved Sub-Processors

| Sub-Processor | Location | Transfer Mechanism | TIA Completed |
|---------------|----------|-------------------|---------------|
| Supabase Inc. | US | SCCs + Supplementary | ✅ Yes |
| Vercel Inc. | US/Global | SCCs + Supplementary | ✅ Yes |
| Stripe Inc. | US/EU | DPF + SCCs | ✅ Yes |
| Cloudflare Inc. | US/Global | SCCs + BCRs | ✅ Yes |
| Resend Inc. | US | SCCs + Supplementary | ✅ Yes |
| Sentry | US | SCCs + Supplementary | ✅ Yes |

### 6.2 Sub-Processor Chain

```
GHXSTSHIP (Controller)
    │
    ├── Supabase (Processor)
    │   └── AWS (Sub-processor)
    │
    ├── Vercel (Processor)
    │   └── AWS (Sub-processor)
    │
    ├── Stripe (Processor)
    │   └── Various payment networks
    │
    ├── Cloudflare (Processor)
    │   └── Global edge network
    │
    └── Resend (Processor)
        └── AWS SES (Sub-processor)
```

---

## 7. Data Subject Rights

### 7.1 Rights Preserved

International transfers do not diminish data subject rights:

- ✅ Right to access
- ✅ Right to rectification
- ✅ Right to erasure
- ✅ Right to data portability
- ✅ Right to object
- ✅ Right to withdraw consent

### 7.2 Exercising Rights

Data subjects can exercise their rights regardless of where their data is processed:

- **Email:** privacy@ghxstship.com
- **DPO:** dpo@ghxstship.com
- **Settings:** /settings/privacy

### 7.3 Complaints

Data subjects may lodge complaints with:
- Their local supervisory authority
- The supervisory authority of GHXSTSHIP's establishment
- Courts in their country of residence

---

## 8. Monitoring and Review

### 8.1 Ongoing Monitoring

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Legal landscape review | Quarterly | Legal |
| Sub-processor compliance | Annual | Compliance |
| TIA updates | Annual or on change | DPO |
| SCC validity check | Annual | Legal |

### 8.2 Trigger Events for Review

- New adequacy decisions or invalidations
- Changes to sub-processor locations
- New government access laws
- Court decisions affecting transfers
- Guidance from supervisory authorities

### 8.3 Suspension Criteria

Transfers may be suspended if:
- SCCs are invalidated
- Supplementary measures become ineffective
- Sub-processor fails compliance audit
- Government access request received
- Supervisory authority orders suspension

---

## 9. Documentation

### 9.1 Required Records

| Document | Location | Retention |
|----------|----------|-----------|
| SCCs (signed) | Legal drive | Duration of processing + 5 years |
| TIAs | Compliance folder | Duration of processing + 5 years |
| Sub-processor list | Public (website) | Current version |
| DPAs | Legal drive | Duration of processing + 5 years |
| Audit reports | Compliance folder | 5 years |

### 9.2 Transparency

The following information is publicly available:
- Sub-processor list: /legal/sub-processors
- Privacy policy (transfer section): /legal/privacy
- Cookie policy: /legal/cookies

---

## 10. Specific Jurisdiction Requirements

### 10.1 GDPR (EU/EEA)

- **Legal Basis:** SCCs (Module 2) + Supplementary Measures
- **Supervisory Authority:** Lead authority based on main establishment
- **DPO Required:** Yes
- **Records:** Article 30 records maintained

### 10.2 UK GDPR

- **Legal Basis:** UK Addendum to SCCs
- **Supervisory Authority:** ICO
- **Additional Requirements:** UK-specific TIA considerations

### 10.3 LGPD (Brazil)

- **Legal Basis:** Contractual clauses equivalent to SCCs
- **Supervisory Authority:** ANPD
- **Additional Requirements:** Portuguese language notices

### 10.4 PIPEDA (Canada)

- **Legal Basis:** Contractual protections
- **Supervisory Authority:** OPC
- **Additional Requirements:** Comparable protection standard

---

## 11. Contact Information

**Data Protection Officer:**
- Email: dpo@ghxstship.com

**Privacy Team:**
- Email: privacy@ghxstship.com

**Legal Team:**
- Email: legal@ghxstship.com

---

## 12. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Legal/Compliance | Initial document |

---

## Appendix A: SCC Module 2 Key Clauses

**Clause 8 - Data Protection Safeguards:**
Processor must implement appropriate technical and organizational measures.

**Clause 9 - Sub-processors:**
Prior authorization required; same obligations imposed.

**Clause 10 - Data Subject Rights:**
Processor must assist controller in responding to requests.

**Clause 14 - Local Laws:**
Processor warrants no reason to believe laws prevent compliance.

**Clause 15 - Government Access:**
Processor must notify controller of requests where legally permitted.

## Appendix B: Transfer Impact Assessment Template

1. **Transfer Details**
   - Data categories
   - Data subjects
   - Destination country
   - Recipient

2. **Legal Analysis**
   - Relevant laws in destination
   - Government access powers
   - Judicial remedies

3. **Risk Assessment**
   - Likelihood of access
   - Impact on data subjects
   - Residual risk level

4. **Safeguards**
   - Technical measures
   - Organizational measures
   - Contractual measures

5. **Conclusion**
   - Transfer permissible: Yes/No
   - Conditions/limitations
   - Review date

---

*This document should be reviewed annually and updated when significant changes occur to transfer mechanisms or legal requirements.*
