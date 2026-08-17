import React, { useEffect } from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import { LegalDocumentData } from '@/lib/legalPdfExport';

const disclaimerData: LegalDocumentData = {
  title: 'Disclaimer',
  lastUpdated: 'August 17, 2026',
  description: 'The information provided on the Devi Real Estates website is intended for general informational and property-enquiry purposes. While we make reasonable efforts to keep information accurate and up to date, property information can change and may be provided by property owners, developers, builders, agents, or other third parties.',
  sections: [
    {
      heading: '1. Property Information',
      paragraphs: ['Property details displayed on this website may include information such as:'],
      bullets: [
        'Price',
        'Property area',
        'Location',
        'Floor plans',
        'Amenities',
        'Images',
        'Specifications',
        'Construction status',
        'Possession information',
        'Project details',
      ],
    },
    {
      paragraphs: [
        'Such information should be independently verified before making any purchase, booking, rental, or investment decision.',
      ],
    },
    {
      heading: '2. Images and Visual Representations',
      paragraphs: [
        'Property photographs, architectural images, renders, illustrations, floor plans, and other visual materials may be used for informational or promotional purposes.',
        'Actual property appearance, finishes, dimensions, landscaping, furniture, amenities, colours, and specifications may differ from images or representations.',
      ],
    },
    {
      heading: '3. Prices and Availability',
      paragraphs: [
        'Prices and availability are subject to change without notice.',
        'A property displayed on this website does not guarantee that it is currently available.',
        'Users should contact Devi Real Estates for the latest information.',
      ],
    },
    {
      heading: '4. Legal and Title Verification',
      paragraphs: [
        'Devi Real Estates strongly recommends that prospective buyers independently verify all relevant legal and property documentation before entering into a transaction. This may include:',
      ],
      bullets: [
        'Ownership/title documents',
        'Encumbrance information',
        'Approved plans',
        'Building permissions',
        'Layout approvals',
        'Land-use permissions',
        'RERA registration details, where applicable',
        'Completion or occupancy documentation, where applicable',
        'Tax and statutory records',
        'Other documents relevant to the transaction',
      ],
    },
    {
      paragraphs: [
        'Professional legal and financial advice should be obtained where appropriate.',
      ],
    },
    {
      heading: '5. RERA',
      paragraphs: [
        'Where a property or project falls within the applicable provisions of real-estate regulation, users should independently verify its RERA registration and related information through the appropriate regulatory authority.',
        'The Andhra Pradesh RERA framework places obligations on registered real-estate agents concerning registered projects, truthful representations, and providing relevant information to allottees.',
      ],
    },
    {
      heading: '6. No Investment Advice',
      paragraphs: [
        'Information on this website should not be considered financial, investment, legal, tax, or professional advice.',
        'Past property performance or market information does not guarantee future appreciation or returns.',
      ],
    },
    {
      heading: '7. Third-Party Information',
      paragraphs: [
        'Some information may originate from third parties, including property owners, developers, builders, agents, or service providers.',
        'Although reasonable care may be taken when publishing such information, Devi Real Estates does not guarantee that every third-party statement is complete, current, or error-free.',
      ],
    },
    {
      heading: '8. No Guarantee',
      paragraphs: ['The website and its content are provided for general informational purposes. Devi Real Estates does not guarantee that:'],
      bullets: [
        'Every listing will remain available',
        'Property information will always be error-free',
        'Prices will remain unchanged',
        'Project timelines will remain unchanged',
        'Every property will meet a user\'s individual expectations',
        'A particular property will increase in value',
        'A transaction will be completed',
      ],
    },
    {
      heading: '9. Independent Due Diligence',
      paragraphs: [
        'Before making any payment or entering into a property transaction, users should conduct their own due diligence and verify all important information with the relevant owner, developer, authorities, and professional advisers.',
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

const Disclaimer: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Disclaimer | Devi Real Estates';
  }, []);

  return (
    <LegalPageLayout documentData={disclaimerData}>
      <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-8">
        <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed bg-orange-50/50 p-4 rounded-xl border border-orange-100/60">
          The information provided on the Devi Real Estates website is intended for general informational and property-enquiry purposes. While we make reasonable efforts to keep information accurate and up to date, property information can change and may be provided by property owners, developers, builders, agents, or other third parties.
        </p>

        {/* Section 1 */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            1. Property Information
          </h2>
          <p>Property details displayed on this website may include information such as:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Price',
              'Property area',
              'Location',
              'Floor plans',
              'Amenities',
              'Images',
              'Specifications',
              'Construction status',
              'Possession information',
              'Project details',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="font-medium text-slate-800">
            Such information should be independently verified before making any purchase, booking, rental, or investment decision.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            2. Images and Visual Representations
          </h2>
          <p>
            Property photographs, architectural images, renders, illustrations, floor plans, and other visual materials may be used for informational or promotional purposes.
          </p>
          <p>
            Actual property appearance, finishes, dimensions, landscaping, furniture, amenities, colours, and specifications may differ from images or representations.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            3. Prices and Availability
          </h2>
          <p>Prices and availability are subject to change without notice.</p>
          <p>
            A property displayed on this website does not guarantee that it is currently available. Users should contact Devi Real Estates for the latest information.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            4. Legal and Title Verification
          </h2>
          <p>
            Devi Real Estates strongly recommends that prospective buyers independently verify all relevant legal and property documentation before entering into a transaction. This may include:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Ownership/title documents',
              'Encumbrance information',
              'Approved plans',
              'Building permissions',
              'Layout approvals',
              'Land-use permissions',
              'RERA registration details, where applicable',
              'Completion or occupancy documentation',
              'Tax and statutory records',
              'Other documents relevant to the transaction',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>Professional legal and financial advice should be obtained where appropriate.</p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            5. RERA
          </h2>
          <p>
            Where a property or project falls within the applicable provisions of real-estate regulation, users should independently verify its RERA registration and related information through the appropriate regulatory authority.
          </p>
          <p>
            The Andhra Pradesh RERA framework places obligations on registered real-estate agents concerning registered projects, truthful representations, and providing relevant information to allottees.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            6. No Investment Advice
          </h2>
          <p>
            Information on this website should not be considered financial, investment, legal, tax, or professional advice. Past property performance or market information does not guarantee future appreciation or returns.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            7. Third-Party Information
          </h2>
          <p>
            Some information may originate from third parties, including property owners, developers, builders, agents, or service providers. Although reasonable care may be taken when publishing such information, Devi Real Estates does not guarantee that every third-party statement is complete, current, or error-free.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            8. No Guarantee
          </h2>
          <p>The website and its content are provided for general informational purposes. Devi Real Estates does not guarantee that:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Every listing will remain available</li>
            <li>Property information will always be error-free</li>
            <li>Prices will remain unchanged</li>
            <li>Project timelines will remain unchanged</li>
            <li>Every property will meet a user's individual expectations</li>
            <li>A particular property will increase in value</li>
            <li>A transaction will be completed</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            9. Independent Due Diligence
          </h2>
          <p>
            Before making any payment or entering into a property transaction, users should conduct their own due diligence and verify all important information with the relevant owner, developer, authorities, and professional advisers.
          </p>
          <p className="text-sm text-slate-500 pt-2">
            If you identify incorrect or outdated information on a property listing, please contact us so that we can review the information.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default Disclaimer;
