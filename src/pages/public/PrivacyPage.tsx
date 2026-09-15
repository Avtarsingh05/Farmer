import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Mic, Database, UserCheck, ArrowRight, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = "September 15, 2026";

  const sections = [
    { id: 'overview', title: '1. Overview & Commitment' },
    { id: 'data-collected', title: '2. Information We Collect' },
    { id: 'voice-privacy', title: '3. Mitra Voice Assistant Privacy' },
    { id: 'how-we-use', title: '4. How We Use Information' },
    { id: 'sharing', title: '5. Information Sharing & Disclosure' },
    { id: 'security', title: '6. Data Security & Storage' },
    { id: 'user-rights', title: '7. Your Rights & Choices' },
    { id: 'contact', title: '8. Grievance Redressal & Contact' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Header */}
      <section className="bg-white border-b border-neutral-200 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4 border border-primary-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
            At KisanMitra, we respect your privacy and are committed to protecting your personal and agricultural data. This policy outlines how information is collected, safeguarded, and handled across our platform.
          </p>
          <p className="mt-4 text-xs text-neutral-400 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Table of Contents sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Sections
              </h3>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs font-medium text-neutral-600 hover:text-primary-700 hover:bg-neutral-50 py-1.5 px-2.5 rounded-lg transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-5 border-t border-neutral-100 text-xs text-neutral-500">
                Privacy or account inquiries?
                <a href="mailto:privacy@kisanmitra.in" className="block text-primary-700 font-medium mt-1 hover:underline">
                  privacy@kisanmitra.in
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Clauses Content */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-2xs space-y-10 text-neutral-700 text-sm leading-relaxed">
            
            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                1. Overview & Commitment
              </h2>
              <p>
                KisanMitra ("we", "us", or "our") connects verified farmers directly with buyers across India. We believe transparency applies to privacy as much as pricing: we do not sell your personal information to marketing brokers, and we collect only what is essential to provide reliable marketplace services.
              </p>
            </section>

            {/* 2. Data Collected */}
            <section id="data-collected" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                2. Information We Collect
              </h2>
              <p>Depending on whether you use the platform as a Farmer or Buyer, we collect:</p>
              
              <div className="space-y-3 pt-1">
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wide">Account Details</h4>
                  <p className="text-xs text-neutral-600 mt-1">Full name, email address, contact phone number, and account role (Farmer or Buyer).</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wide">Farmer Profile & Verification Data</h4>
                  <p className="text-xs text-neutral-600 mt-1">District, state, farm address/area details, produce photos, and verification documents submitted to substantiate farmer identity.</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wide">Transaction & Order Information</h4>
                  <p className="text-xs text-neutral-600 mt-1">Produce purchased or listed, quantities, order status logs, delivery addresses, and payment confirmation IDs from licensed payment gateways.</p>
                </div>
              </div>
            </section>

            {/* 3. Mitra Voice Privacy */}
            <section id="voice-privacy" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary-600" />
                3. Mitra Voice Assistant Privacy
              </h2>
              <p>
                Our built-in voice assistant, <strong>Mitra</strong>, is designed with accessibility and voice privacy at its foundation:
              </p>
              
              <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 space-y-2.5 text-xs text-neutral-700">
                <p>
                  <strong>No Permanent Voice Storage:</strong> We do not permanently store or archive raw audio recordings of your voice. The microphone stream is used transiently to convert spoken queries into text and is released as soon as you stop speaking.
                </p>
                <p>
                  <strong>Explicit Activation:</strong> Mitra activates only after you explicitly click the microphone button. It does not perform background listening or surveillance.
                </p>
                <p>
                  <strong>Text & Browser Fallbacks:</strong> If you prefer not to use voice or if microphone permissions are denied, you can use the complete text input alternative at any time.
                </p>
              </div>
            </section>

            {/* 4. How We Use */}
            <section id="how-we-use" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                4. How We Use Information
              </h2>
              <ul className="space-y-1.5 list-disc pl-5 text-neutral-600 text-xs">
                <li>To facilitate marketplace transactions between farmers and buyers.</li>
                <li>To enable order tracking, status notifications, and fulfillment.</li>
                <li>To verify farmer authentications and prevent agricultural fraud.</li>
                <li>To present accurate localized market prices and inventory levels.</li>
                <li>To provide responsive customer support and dispute resolution.</li>
              </ul>
            </section>

            {/* 5. Sharing */}
            <section id="sharing" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                5. Information Sharing & Disclosure
              </h2>
              <p>We share data strictly in the context of order fulfillment and platform integrity:</p>
              <ul className="space-y-1.5 list-disc pl-5 text-neutral-600 text-xs">
                <li><strong>Between Parties:</strong> When an order is accepted, the farmer receives the buyer's delivery contact and address to fulfill dispatch.</li>
                <li><strong>Service Providers:</strong> We integrate verified infrastructure partners: Firebase (Google Cloud) for database/authentication, Cloudinary for produce image hosting, and Razorpay for payment processing.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by applicable Indian laws or government authorities.</li>
              </ul>
            </section>

            {/* 6. Security */}
            <section id="security" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                6. Data Security & Storage
              </h2>
              <p>
                We employ industry-standard technical measures to protect your information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900 mb-1">
                    <Lock className="w-3.5 h-3.5 text-primary-600" /> HTTPS / TLS Encryption
                  </div>
                  <p className="text-[11px] text-neutral-500">All data transmitted between your browser and our servers is encrypted using modern TLS.</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900 mb-1">
                    <Database className="w-3.5 h-3.5 text-primary-600" /> Strict Security Rules
                  </div>
                  <p className="text-[11px] text-neutral-500">Role-based Firestore rules ensure users can only access records they own or are authorized to inspect.</p>
                </div>
              </div>
            </section>

            {/* 7. User Rights */}
            <section id="user-rights" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                7. Your Rights & Choices
              </h2>
              <p>As a KisanMitra user, you maintain rights over your information:</p>
              <ul className="space-y-1.5 list-disc pl-5 text-neutral-600 text-xs">
                <li><strong>Profile Updates:</strong> You can edit your contact details, bio, and delivery addresses directly in your dashboard settings.</li>
                <li><strong>Data Deletion:</strong> You may request account deletion and removal of personal records by contacting support.</li>
                <li><strong>Microphone Control:</strong> You can revoke browser microphone permissions at any time via your browser settings.</li>
              </ul>
            </section>

            {/* 8. Contact */}
            <section id="contact" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                8. Grievance Redressal & Contact
              </h2>
              <p>
                For questions, concerns, or requests regarding this Privacy Policy or your data, please contact our Grievance Officer:
              </p>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-1">
                <p><strong>Grievance Officer:</strong> KisanMitra Data Protection Team</p>
                <p><strong>Email:</strong> <a href="mailto:privacy@kisanmitra.in" className="text-primary-700 hover:underline">privacy@kisanmitra.in</a></p>
                <p><strong>Project:</strong> Smart India Hackathon (SIH26033)</p>
                <p><strong>Location:</strong> India</p>
              </div>
            </section>

            {/* Link to Terms */}
            <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-500">
                Review the terms and conditions governing platform usage.
              </div>
              <Link 
                to="/terms" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
              >
                Read Terms and Conditions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
