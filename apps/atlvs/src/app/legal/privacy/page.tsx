import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Body,
  H2,
  H3,
  Label,
  Container,
  Display,
  FullBleedSection,
  Button,
} from "@ghxstship/ui";
import { Shield, Globe, FileText, Mail, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const privacyData = {
  lastUpdated: "January 1, 2025",
  version: "2.0",
  effectiveDate: "January 1, 2025",
};

export default function PrivacyPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={6} className="text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800 mx-auto">
              <Shield className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              LEGAL
            </Label>
            <Display size="lg" className="text-white">
              PRIVACY POLICY
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Last updated: {privacyData.lastUpdated} | Version {privacyData.version}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Table of Contents */}
      <FullBleedSection background="grey" className="py-8">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#information-collected" className="text-body-sm text-primary-600 hover:text-primary-800 underline">Information Collected</a>
            <span className="text-grey-400">•</span>
            <a href="#how-we-use" className="text-body-sm text-primary-600 hover:text-primary-800 underline">How We Use Data</a>
            <span className="text-grey-400">•</span>
            <a href="#sharing" className="text-body-sm text-primary-600 hover:text-primary-800 underline">Data Sharing</a>
            <span className="text-grey-400">•</span>
            <a href="#your-rights" className="text-body-sm text-primary-600 hover:text-primary-800 underline">Your Rights</a>
            <span className="text-grey-400">•</span>
            <a href="#gdpr" className="text-body-sm text-primary-600 hover:text-primary-800 underline">GDPR</a>
            <span className="text-grey-400">•</span>
            <a href="#ccpa" className="text-body-sm text-primary-600 hover:text-primary-800 underline">CCPA</a>
            <span className="text-grey-400">•</span>
            <a href="#international" className="text-body-sm text-primary-600 hover:text-primary-800 underline">International</a>
            <span className="text-grey-400">•</span>
            <a href="#contact" className="text-body-sm text-primary-600 hover:text-primary-800 underline">Contact</a>
          </div>
        </Container>
      </FullBleedSection>

      {/* Content */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            {/* Introduction */}
            <Stack gap={4}>
              <Body className="text-grey-700">
                GHXSTSHIP Industries (&quot;GHXSTSHIP,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                ATLVS, COMPVSS, and GVTEWAY platforms (collectively, the &quot;Services&quot;). This policy applies to users worldwide 
                and addresses specific requirements under various international privacy regulations including GDPR, CCPA/CPRA, 
                LGPD, PIPEDA, and others.
              </Body>
              <Body className="text-grey-700">
                By using our Services, you consent to the data practices described in this policy. If you do not agree with 
                the terms of this policy, please do not access or use our Services.
              </Body>
            </Stack>

            {/* 1. Information We Collect */}
            <Stack gap={4} id="information-collected">
              <H2 className="text-ink-950">1. Information We Collect</H2>
              
              <H3 className="text-ink-900 text-body-base font-weight-semibold">1.1 Information You Provide</H3>
              <Body className="text-grey-700">
                We collect information you provide directly to us, including:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, phone number, password, profile photo</li>
                <li><strong>Organization Information:</strong> Company name, business address, tax identification numbers</li>
                <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely via Stripe)</li>
                <li><strong>Event Information:</strong> Event details, venue information, ticket configurations</li>
                <li><strong>Communications:</strong> Messages, support requests, feedback you send to us</li>
                <li><strong>User Content:</strong> Photos, documents, and other content you upload</li>
              </ul>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">1.2 Information Collected Automatically</H3>
              <Body className="text-grey-700">
                When you use our Services, we automatically collect:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Device Information:</strong> Device type, operating system, browser type, unique device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URL</li>
                <li><strong>Location Data:</strong> General location based on IP address (precise location only with consent)</li>
                <li><strong>Usage Data:</strong> Features used, actions taken, time spent on pages</li>
                <li><strong>Cookies and Tracking:</strong> See our <a href="/legal/cookies" className="text-primary-600 underline">Cookie Policy</a> for details</li>
              </ul>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">1.3 Information from Third Parties</H3>
              <Body className="text-grey-700">
                We may receive information from third parties including:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li>Social media platforms when you connect your accounts</li>
                <li>Payment processors for transaction verification</li>
                <li>Identity verification services for fraud prevention</li>
                <li>Business partners for event and ticketing integrations</li>
              </ul>
            </Stack>

            {/* 2. How We Use Your Information */}
            <Stack gap={4} id="how-we-use">
              <H2 className="text-ink-950">2. How We Use Your Information</H2>
              <Body className="text-grey-700">
                We use the information we collect for the following purposes and legal bases:
              </Body>
              
              <div className="border-2 border-grey-200 rounded-card overflow-hidden">
                <table className="w-full text-body-sm">
                  <thead className="bg-grey-100">
                    <tr>
                      <th className="text-left p-3 font-weight-semibold text-grey-900">Purpose</th>
                      <th className="text-left p-3 font-weight-semibold text-grey-900">Legal Basis (GDPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-200">
                    <tr>
                      <td className="p-3 text-grey-700">Provide and maintain our Services</td>
                      <td className="p-3 text-grey-700">Contract performance</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Process transactions and payments</td>
                      <td className="p-3 text-grey-700">Contract performance</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Send service-related communications</td>
                      <td className="p-3 text-grey-700">Contract performance / Legitimate interest</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Send marketing communications</td>
                      <td className="p-3 text-grey-700">Consent</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Improve and personalize Services</td>
                      <td className="p-3 text-grey-700">Legitimate interest</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Prevent fraud and ensure security</td>
                      <td className="p-3 text-grey-700">Legitimate interest / Legal obligation</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Comply with legal obligations</td>
                      <td className="p-3 text-grey-700">Legal obligation</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-grey-700">Analytics and performance monitoring</td>
                      <td className="p-3 text-grey-700">Consent / Legitimate interest</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Stack>

            {/* 3. Information Sharing */}
            <Stack gap={4} id="sharing">
              <H2 className="text-ink-950">3. Information Sharing and Disclosure</H2>
              <Body className="text-grey-700 font-weight-semibold">
                We do not sell your personal information. We may share your information in the following circumstances:
              </Body>
              
              <H3 className="text-ink-900 text-body-base font-weight-semibold">3.1 Service Providers</H3>
              <Body className="text-grey-700">
                We share information with third-party service providers who perform services on our behalf, including:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Supabase:</strong> Database hosting and authentication (US)</li>
                <li><strong>Vercel:</strong> Website hosting and CDN (Global)</li>
                <li><strong>Stripe:</strong> Payment processing (US, with EU data processing)</li>
                <li><strong>Resend:</strong> Email delivery (US)</li>
                <li><strong>Sentry:</strong> Error tracking and monitoring (US)</li>
              </ul>
              <Body className="text-grey-700">
                All service providers are bound by data processing agreements and are required to protect your information.
                See our <a href="/legal/sub-processors" className="text-primary-600 underline">Sub-processor List</a> for complete details.
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">3.2 Legal Requirements</H3>
              <Body className="text-grey-700">
                We may disclose your information if required by law, regulation, legal process, or governmental request, 
                or to protect the rights, property, or safety of GHXSTSHIP, our users, or others.
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">3.3 Business Transfers</H3>
              <Body className="text-grey-700">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred. 
                We will provide notice before your information is transferred and becomes subject to a different privacy policy.
              </Body>
            </Stack>

            {/* 4. Data Retention */}
            <Stack gap={4}>
              <H2 className="text-ink-950">4. Data Retention</H2>
              <Body className="text-grey-700">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
                unless a longer retention period is required or permitted by law. Specific retention periods include:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active, plus 3 years after deletion</li>
                <li><strong>Transaction Records:</strong> 7 years for tax and legal compliance</li>
                <li><strong>Marketing Preferences:</strong> Until you withdraw consent</li>
                <li><strong>Support Communications:</strong> 3 years after resolution</li>
                <li><strong>Analytics Data:</strong> 26 months (anonymized thereafter)</li>
                <li><strong>Audit Logs:</strong> 3 years for security and compliance</li>
              </ul>
            </Stack>

            {/* 5. Data Security */}
            <Stack gap={4}>
              <H2 className="text-ink-950">5. Data Security</H2>
              <Body className="text-grey-700">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access control (RBAC) and multi-factor authentication</li>
                <li><strong>Data Isolation:</strong> Multi-tenant architecture with row-level security</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection</li>
                <li><strong>Auditing:</strong> Comprehensive audit logging of all data access</li>
                <li><strong>Incident Response:</strong> Documented breach notification procedures</li>
              </ul>
              <Body className="text-grey-700">
                While we strive to protect your information, no method of transmission over the Internet is 100% secure. 
                We cannot guarantee absolute security.
              </Body>
            </Stack>

            {/* 6. Your Rights */}
            <Stack gap={4} id="your-rights">
              <H2 className="text-ink-950">6. Your Rights</H2>
              <Body className="text-grey-700">
                Depending on your location, you may have the following rights regarding your personal information:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
                <li><strong>Automated Decisions:</strong> Not be subject to solely automated decision-making</li>
              </ul>
              <Body className="text-grey-700">
                To exercise these rights, visit your <a href="/settings/privacy" className="text-primary-600 underline">Privacy Settings</a> or 
                contact us at <a href="mailto:privacy@ghxstship.com" className="text-primary-600 underline">privacy@ghxstship.com</a>.
                We will respond to requests within 30 days (GDPR) or 45 days (CCPA).
              </Body>
            </Stack>

            {/* 7. GDPR - European Users */}
            <Stack gap={4} id="gdpr" className="border-2 border-primary-200 rounded-card p-6 bg-primary-50">
              <div className="flex items-center gap-3">
                <Globe className="size-6 text-primary-600" />
                <H2 className="text-ink-950 !mb-0">7. For European Users (GDPR)</H2>
              </div>
              <Body className="text-grey-700">
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have additional 
                rights under the General Data Protection Regulation (GDPR):
              </Body>
              
              <H3 className="text-ink-900 text-body-base font-weight-semibold">Data Controller</H3>
              <Body className="text-grey-700">
                GHXSTSHIP Industries is the data controller for personal data collected through our Services.
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Legal Bases for Processing</H3>
              <Body className="text-grey-700">
                We process your personal data only when we have a valid legal basis, including:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-1 ml-4">
                <li>Your consent</li>
                <li>Performance of a contract with you</li>
                <li>Compliance with legal obligations</li>
                <li>Our legitimate interests (which do not override your rights)</li>
              </ul>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">International Data Transfers</H3>
              <Body className="text-grey-700">
                Your data may be transferred to and processed in countries outside the EEA, including the United States. 
                We ensure appropriate safeguards are in place, including:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-1 ml-4">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Data Processing Agreements with all sub-processors</li>
                <li>Supplementary measures where required</li>
              </ul>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Data Protection Officer</H3>
              <Body className="text-grey-700">
                You can contact our Data Protection Officer at: <a href="mailto:dpo@ghxstship.com" className="text-primary-600 underline">dpo@ghxstship.com</a>
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Supervisory Authority</H3>
              <Body className="text-grey-700">
                You have the right to lodge a complaint with your local data protection supervisory authority if you 
                believe we have violated your privacy rights.
              </Body>
            </Stack>

            {/* 8. CCPA - California Users */}
            <Stack gap={4} id="ccpa" className="border-2 border-accent-200 rounded-card p-6 bg-accent-50">
              <div className="flex items-center gap-3">
                <FileText className="size-6 text-accent-600" />
                <H2 className="text-ink-950 !mb-0">8. For California Residents (CCPA/CPRA)</H2>
              </div>
              <Body className="text-grey-700">
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) 
                and California Privacy Rights Act (CPRA):
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Your California Privacy Rights</H3>
              <ul className="list-disc list-inside text-grey-700 space-y-2 ml-4">
                <li><strong>Right to Know:</strong> Request disclosure of personal information collected, used, and disclosed</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale or sharing of personal information</li>
                <li><strong>Right to Limit:</strong> Limit use of sensitive personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your rights</li>
              </ul>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Categories of Personal Information</H3>
              <Body className="text-grey-700">
                In the past 12 months, we have collected the following categories of personal information:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-1 ml-4">
                <li>Identifiers (name, email, IP address)</li>
                <li>Commercial information (purchase history, transaction data)</li>
                <li>Internet activity (browsing history, interactions with our Services)</li>
                <li>Geolocation data (general location from IP address)</li>
                <li>Professional information (company, job title)</li>
                <li>Inferences (preferences, characteristics)</li>
              </ul>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Do Not Sell or Share My Personal Information</H3>
              <Body className="text-grey-700">
                <strong>We do not sell your personal information.</strong> We do not share your personal information for 
                cross-context behavioral advertising. To opt out of any future sharing, visit your 
                <a href="/settings/privacy" className="text-primary-600 underline ml-1">Privacy Settings</a>.
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Submitting Requests</H3>
              <Body className="text-grey-700">
                To exercise your CCPA rights, you may:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-1 ml-4">
                <li>Email us at <a href="mailto:privacy@ghxstship.com" className="text-primary-600 underline">privacy@ghxstship.com</a></li>
                <li>Use our <a href="/settings/privacy" className="text-primary-600 underline">Privacy Settings</a> page</li>
                <li>Call us at 1-800-GHXSTSHIP</li>
              </ul>
              <Body className="text-grey-700">
                We will verify your identity before processing your request. You may designate an authorized agent to 
                submit requests on your behalf.
              </Body>
            </Stack>

            {/* 9. Other International Regulations */}
            <Stack gap={4} id="international">
              <H2 className="text-ink-950">9. Other International Regulations</H2>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Brazil (LGPD)</H3>
              <Body className="text-grey-700">
                If you are located in Brazil, you have rights under the Lei Geral de Proteção de Dados (LGPD), including 
                the right to access, correct, delete, and port your data. Contact our DPO for LGPD-related requests.
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Canada (PIPEDA)</H3>
              <Body className="text-grey-700">
                Canadian users have rights under the Personal Information Protection and Electronic Documents Act (PIPEDA). 
                We obtain meaningful consent for the collection, use, and disclosure of your personal information.
              </Body>

              <H3 className="text-ink-900 text-body-base font-weight-semibold">Australia (Privacy Act 1988)</H3>
              <Body className="text-grey-700">
                Australian users have rights under the Privacy Act 1988 and Australian Privacy Principles (APPs). 
                You may access and correct your personal information and lodge complaints with the OAIC.
              </Body>
            </Stack>

            {/* 10. Children's Privacy */}
            <Stack gap={4}>
              <H2 className="text-ink-950">10. Children&apos;s Privacy</H2>
              <Body className="text-grey-700">
                Our Services are not intended for children under 16 years of age (or 13 in the US under COPPA). 
                We do not knowingly collect personal information from children. If you believe we have collected 
                information from a child, please contact us immediately at 
                <a href="mailto:privacy@ghxstship.com" className="text-primary-600 underline ml-1">privacy@ghxstship.com</a>.
              </Body>
            </Stack>

            {/* 11. Cookies */}
            <Stack gap={4}>
              <H2 className="text-ink-950">11. Cookies and Tracking Technologies</H2>
              <Body className="text-grey-700">
                We use cookies and similar tracking technologies to collect and track information about your use of our Services. 
                For detailed information about the cookies we use and how to manage them, please see our 
                <a href="/legal/cookies" className="text-primary-600 underline ml-1">Cookie Policy</a>.
              </Body>
              <Body className="text-grey-700">
                You can manage your cookie preferences at any time through our cookie consent banner or your browser settings.
              </Body>
            </Stack>

            {/* 12. Changes to This Policy */}
            <Stack gap={4}>
              <H2 className="text-ink-950">12. Changes to This Policy</H2>
              <Body className="text-grey-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </Body>
              <ul className="list-disc list-inside text-grey-700 space-y-1 ml-4">
                <li>Posting the updated policy on this page with a new effective date</li>
                <li>Sending you an email notification (for significant changes)</li>
                <li>Displaying a prominent notice within our Services</li>
              </ul>
              <Body className="text-grey-700">
                We encourage you to review this policy periodically. Your continued use of our Services after any changes 
                constitutes your acceptance of the updated policy.
              </Body>
            </Stack>

            {/* 13. Contact Us */}
            <Stack gap={4} id="contact" className="border-2 border-grey-200 rounded-card p-6 bg-grey-50">
              <div className="flex items-center gap-3">
                <Mail className="size-6 text-grey-600" />
                <H2 className="text-ink-950 !mb-0">13. Contact Us</H2>
              </div>
              <Body className="text-grey-700">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </Body>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Body className="font-weight-semibold text-grey-900">General Privacy Inquiries</Body>
                  <Body className="text-grey-700">
                    Email: <a href="mailto:privacy@ghxstship.com" className="text-primary-600 underline">privacy@ghxstship.com</a>
                  </Body>
                </div>
                <div>
                  <Body className="font-weight-semibold text-grey-900">Data Protection Officer</Body>
                  <Body className="text-grey-700">
                    Email: <a href="mailto:dpo@ghxstship.com" className="text-primary-600 underline">dpo@ghxstship.com</a>
                  </Body>
                </div>
                <div>
                  <Body className="font-weight-semibold text-grey-900">Mailing Address</Body>
                  <Body className="text-grey-700">
                    GHXSTSHIP Industries<br />
                    Attn: Privacy Team<br />
                    [Address to be added]
                  </Body>
                </div>
                <div>
                  <Body className="font-weight-semibold text-grey-900">Data Subject Requests</Body>
                  <Body className="text-grey-700">
                    Submit requests via your <a href="/settings/privacy" className="text-primary-600 underline">Privacy Settings</a>
                  </Body>
                </div>
              </div>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Related Links */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <H2 className="text-white">RELATED POLICIES</H2>
            <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
              <NextLink href="/legal/cookies">
                <Button variant="outlineWhite" size="lg">
                  Cookie Policy
                </Button>
              </NextLink>
              <NextLink href="/legal/terms">
                <Button variant="outlineWhite" size="lg">
                  Terms of Service
                </Button>
              </NextLink>
              <NextLink href="/legal/sub-processors">
                <Button variant="outlineWhite" size="lg">
                  Sub-processors
                </Button>
              </NextLink>
              <NextLink href="/settings/privacy">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Privacy Settings
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
