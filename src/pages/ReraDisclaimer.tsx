import React, { useEffect } from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import { LegalDocumentData } from '@/lib/legalPdfExport';
import { ExternalLink } from 'lucide-react';

const reraData: LegalDocumentData = {
  title: 'RERA & Property Information Disclaimer',
  lastUpdated: 'August 17, 2026',
  description: 'Devi Real Estates is committed to providing property information responsibly and transparently.',
  sections: [
    {
      heading: '1. RERA Information',
      paragraphs: [
        'Where applicable, projects advertised or facilitated through Devi Real Estates should comply with the requirements of the applicable real-estate regulatory framework.',
        'For applicable projects, customers are encouraged to verify:',
      ],
      bullets: [
        'RERA registration number',
        'Project registration status',
        'Promoter/developer details',
        'Approved plans',
        'Project approvals',
        'Project status',
        'Completion and possession information',
        'Other information available through the applicable RERA authority',
      ],
    },
    {
      heading: '2. Verification of Project Details',
      paragraphs: [
        'Customers should independently verify project information through official records and documents before making any booking or payment.',
        'The Andhra Pradesh RERA framework requires registered real-estate agents to register for facilitating sale or purchase of applicable real-estate projects and prohibits unfair practices and false representations.',
      ],
    },
    {
      heading: '3. RERA Registration Does Not Replace Due Diligence',
      paragraphs: [
        'A RERA registration number should not be treated as a substitute for independent legal, financial, or technical due diligence.',
        'Customers should review the relevant project documents and obtain professional advice where necessary.',
      ],
    },
    {
      heading: '4. Property Listings',
      paragraphs: ['A property listing on Devi Real Estates does not by itself constitute:'],
      bullets: [
        'A guarantee of ownership',
        'A guarantee of title',
        'A guarantee of legal approval',
        'A guarantee of property availability',
        'A guarantee of construction quality',
        'A guarantee of appreciation or investment returns',
        'A binding offer or contract',
      ],
    },
    {
      heading: '5. Prices and Offers',
      paragraphs: [
        'Property prices, discounts, promotional offers, payment plans, and availability may change.',
        'Any offer displayed on the website should be confirmed with Devi Real Estates or the relevant developer/property owner before making a payment.',
      ],
    },
    {
      heading: '6. Documents and Approvals',
      paragraphs: ['Customers are encouraged to verify relevant documents, including where applicable:'],
      bullets: [
        'Title documents',
        'Encumbrance Certificate (EC)',
        'Approved layout',
        'Building approval',
        'RERA registration',
        'Sanctioned plans',
        'Completion/occupancy documents',
        'Property tax records',
        'Other applicable government approvals',
      ],
    },
    {
      heading: '7. Customer Responsibility',
      paragraphs: [
        'Before purchasing, booking, renting, or investing in any property, customers are responsible for conducting appropriate due diligence.',
        'Customers should not rely solely on information presented on a website listing.',
      ],
    },
    {
      heading: '8. Regulatory Information',
      paragraphs: [
        'For projects falling under the Andhra Pradesh RERA framework, customers may verify relevant information through the official Andhra Pradesh RERA authority.',
        'Official AP RERA Website: https://rera.ap.gov.in/',
      ],
    },
  ],
  contactInfo: {
    company: 'Devi Real Estates',
    phone: '+91 99129 91671',
    email: 'info.devirealestates@gmail.com',
    address: 'Geetha paatashala road, Thimmapuram, Kakinada, Andhra Pradesh - 533005',
    website: 'https://devirealestates.com',
  },
};

const ReraDisclaimer: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'RERA & Property Information | Devi Real Estates';
  }, []);

  return (
    <LegalPageLayout documentData={reraData}>
      <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-8">
        <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed bg-orange-50/50 p-4 rounded-xl border border-orange-100/60">
          Devi Real Estates is committed to providing property information responsibly and transparently.
        </p>

        {/* Section 1 */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            1. RERA Information
          </h2>
          <p>
            Where applicable, projects advertised or facilitated through Devi Real Estates should comply with the requirements of the applicable real-estate regulatory framework.
          </p>
          <p>For applicable projects, customers are encouraged to verify:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'RERA registration number',
              'Project registration status',
              'Promoter/developer details',
              'Approved plans',
              'Project approvals',
              'Project status',
              'Completion and possession information',
              'Other information available through the applicable RERA authority',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            2. Verification of Project Details
          </h2>
          <p>
            Customers should independently verify project information through official records and documents before making any booking or payment.
          </p>
          <p>
            The Andhra Pradesh RERA framework requires registered real-estate agents to register for facilitating sale or purchase of applicable real-estate projects and prohibits unfair practices and false representations.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            3. RERA Registration Does Not Replace Due Diligence
          </h2>
          <p>
            A RERA registration number should not be treated as a substitute for independent legal, financial, or technical due diligence.
          </p>
          <p>
            Customers should review the relevant project documents and obtain professional advice where necessary.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            4. Property Listings
          </h2>
          <p>A property listing on Devi Real Estates does not by itself constitute:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>A guarantee of ownership</li>
            <li>A guarantee of title</li>
            <li>A guarantee of legal approval</li>
            <li>A guarantee of property availability</li>
            <li>A guarantee of construction quality</li>
            <li>A guarantee of appreciation or investment returns</li>
            <li>A binding offer or contract</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            5. Prices and Offers
          </h2>
          <p>
            Property prices, discounts, promotional offers, payment plans, and availability may change.
          </p>
          <p>
            Any offer displayed on the website should be confirmed with Devi Real Estates or the relevant developer/property owner before making a payment.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            6. Documents and Approvals
          </h2>
          <p>Customers are encouraged to verify relevant documents, including where applicable:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Title documents',
              'Encumbrance Certificate (EC)',
              'Approved layout',
              'Building approval',
              'RERA registration',
              'Sanctioned plans',
              'Completion/occupancy documents',
              'Property tax records',
              'Other applicable government approvals',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            7. Customer Responsibility
          </h2>
          <p>
            Before purchasing, booking, renting, or investing in any property, customers are responsible for conducting appropriate due diligence. Customers should not rely solely on information presented on a website listing.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            8. Regulatory Information
          </h2>
          <p>
            For projects falling under the Andhra Pradesh RERA framework, customers may verify relevant information through the official Andhra Pradesh RERA authority.
          </p>
          <div className="my-3 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Official Andhra Pradesh RERA Portal</p>
              <p className="text-xs text-slate-500 mt-0.5">Verify registered projects and promoters</p>
            </div>
            <a 
              href="https://rera.ap.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <span>Visit AP RERA</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default ReraDisclaimer;
