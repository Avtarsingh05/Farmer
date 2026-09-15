import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Scale, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = "September 15, 2026";

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. User Eligibility & Accounts' },
    { id: 'farmer-listings', title: '3. Farmer Listings & Produce Quality' },
    { id: 'orders-payments', title: '4. Orders, Pricing & Payments' },
    { id: 'cancellations', title: '5. Cancellations & Disputes' },
    { id: 'mitra-voice', title: '6. Mitra Voice Assistant Usage' },
    { id: 'conduct', title: '7. Prohibited Conduct' },
    { id: 'liability', title: '8. Limitation of Liability' },
    { id: 'governing-law', title: '9. Governing Law & Jurisdiction' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Header */}
      <section className="bg-white border-b border-neutral-200 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4 border border-primary-200">
            <Scale className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
            Please read these terms carefully before accessing or using the KisanMitra platform. By registering or using our marketplace, you agree to be bound by these provisions.
          </p>
          <p className="mt-4 text-xs text-neutral-400 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Table of Contents sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Contents
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
                Have questions about our terms?
                <a href="mailto:support@kisanmitra.in" className="block text-primary-700 font-medium mt-1 hover:underline">
                  support@kisanmitra.in
                </a>
              </div>
            </div>
          </aside>

          {/* Clauses Content */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-2xs space-y-10 text-neutral-700 text-sm leading-relaxed">
            
            {/* 1. Acceptance */}
            <section id="acceptance" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                KisanMitra ("Platform", "we", "us", or "our") operates an agricultural marketplace connecting farmers directly with buyers (households, bulk purchasers, and retailers). By creating an account, browsing listings, or using the Mitra voice assistant, you confirm that you have read, understood, and agreed to these Terms and Conditions.
              </p>
              <p>
                If you do not agree with any part of these Terms, you must discontinue the use of KisanMitra immediately.
              </p>
            </section>

            {/* 2. Eligibility */}
            <section id="eligibility" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                2. User Eligibility & Accounts
              </h2>
              <ul className="space-y-2 list-disc pl-5 text-neutral-600">
                <li><strong>Age Requirement:</strong> You must be at least 18 years old or legally recognized as an adult capable of entering contracts under Indian Law.</li>
                <li><strong>Farmer Verification:</strong> Users registering as Farmers may be asked to submit identification (such as Aadhaar or land record declarations) for verification. Falsified farmer credentials will lead to immediate account termination.</li>
                <li><strong>Account Security:</strong> You are responsible for safeguarding your login credentials and for all activities conducted under your account.</li>
              </ul>
            </section>

            {/* 3. Farmer Listings */}
            <section id="farmer-listings" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                3. Farmer Listings & Produce Quality
              </h2>
              <p>
                Farmers hold sole responsibility for the accuracy of their produce listings, including quantity, unit, price, and quality grade:
              </p>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <p className="text-xs"><strong>Accurate Grading:</strong> Quality grades (Grade A, B, C, or Mixed) must reflect the actual batch state.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <p className="text-xs"><strong>Authentic Imagery:</strong> Photos should depict genuine farm harvests rather than copyrighted stock graphics.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <p className="text-xs"><strong>Stock Availability:</strong> Quantities listed must be currently available or actively growing for scheduled harvest.</p>
                </div>
              </div>
            </section>

            {/* 4. Orders & Payments */}
            <section id="orders-payments" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                4. Orders, Pricing & Payments
              </h2>
              <p>
                All prices on KisanMitra are denominated in Indian Rupees (INR) per specified unit (kg, quintal, tonne, piece, etc.).
              </p>
              <ul className="space-y-2 list-disc pl-5 text-neutral-600">
                <li><strong>Transparent Pricing:</strong> Farmers determine their asking prices directly. KisanMitra does not artificially manipulate asking rates.</li>
                <li><strong>Order Confirmation:</strong> An order is officially accepted once the farmer updates status from <code>pending</code> to <code>accepted</code>.</li>
                <li><strong>Payment Execution:</strong> Online transactions processed through authorized gateways (e.g. Razorpay) are subject to payment gateway policies. Cash or pickup settlements must adhere to the terms agreed upon during order placement.</li>
              </ul>
            </section>

            {/* 5. Cancellations */}
            <section id="cancellations" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                5. Cancellations & Disputes
              </h2>
              <p>
                Because agricultural commodities are perishable, specific cancellation policies apply:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-neutral-600">
                <li><strong>Buyer Cancellations:</strong> Buyers may cancel orders while they are still in <code>pending</code> status without penalty. Once an order is <code>accepted</code> or <code>processing</code>, cancellation requires farmer consent.</li>
                <li><strong>Farmer Rejections:</strong> If unforeseen conditions (pest infestation, extreme weather) compromise harvest, the farmer must notify the buyer immediately by rejecting or cancelling the order.</li>
                <li><strong>Dispute Resolution:</strong> If delivered produce deviates substantially from the listed grade or description, the buyer must report the issue within 24 hours of delivery.</li>
              </ul>
            </section>

            {/* 6. Mitra Voice Assistant */}
            <section id="mitra-voice" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                6. Mitra Voice Assistant Usage
              </h2>
              <p>
                Mitra is an accessibility tool designed to assist farmers and buyers via speech in Hindi, English, and regional languages:
              </p>
              <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 space-y-2 text-xs">
                <p>
                  <strong>Mandatory Confirmation:</strong> Any critical mutation initiated via voice (including listing publish, price modification, or order placement) requires visual or explicit verbal confirmation from the user. You remain responsible for reviewing the summarized parameters before approving.
                </p>
                <p>
                  <strong>Non-Custodial AI:</strong> Mitra does not have independent financial authority or authorization to modify permissions or bypass business rules.
                </p>
              </div>
            </section>

            {/* 7. Prohibited Conduct */}
            <section id="conduct" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                7. Prohibited Conduct
              </h2>
              <p>Users must not under any circumstances:</p>
              <ul className="space-y-1.5 list-disc pl-5 text-neutral-600 text-xs">
                <li>Submit misleading harvest information or misrepresent commercial status.</li>
                <li>Attempt unauthorized access to admin panels or another user's private data.</li>
                <li>Post abusive, fraudulent, or unlawful content in product descriptions or messages.</li>
                <li>Exploit automated scripts or API scraping to disrupt market operations.</li>
              </ul>
            </section>

            {/* 8. Limitation of Liability */}
            <section id="liability" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                8. Limitation of Liability
              </h2>
              <p className="text-xs text-neutral-500">
                KisanMitra acts as a marketplace facilitator connecting verified farmers and buyers. We do not manufacture produce, operate physical warehouses, or guarantee weather conditions. To the maximum extent permitted by applicable law, KisanMitra shall not be liable for indirect, incidental, or consequential damages resulting from transaction discrepancies or perishable spoilage during external transit.
              </p>
            </section>

            {/* 9. Governing Law */}
            <section id="governing-law" className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                9. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to the use of KisanMitra shall be subject to the exclusive jurisdiction of the competent courts of India.
              </p>
            </section>

            {/* Link to Privacy Policy */}
            <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-500">
                Also review how we protect your personal and agricultural data.
              </div>
              <Link 
                to="/privacy" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
              >
                Read Privacy Policy <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
