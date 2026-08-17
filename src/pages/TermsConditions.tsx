import React, { useEffect } from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import { LegalDocumentData } from '@/lib/legalPdfExport';

const termsData: LegalDocumentData = {
  title: 'Terms & Conditions',
  lastUpdated: 'August 17, 2026',
  description: 'Welcome to Devi Real Estates. By accessing or using this website, you agree to comply with these Terms & Conditions. If you do not agree with these terms, please do not use the website.',
  sections: [
    {
      heading: '1. About the Website',
      paragraphs: [
        'Devi Real Estates operates this website to provide information about properties, real-estate projects, and related services.',
        'The website may contain property listings, images, descriptions, prices, specifications, location information, project information, and contact/enquiry facilities.',
      ],
    },
    {
      heading: '2. Property Information',
      paragraphs: [
        'We make reasonable efforts to present useful and accurate property information.',
        'However, property information may change from time to time, including:',
      ],
      bullets: [
        'Price',
        'Availability',
        'Property specifications',
        'Area or dimensions',
        'Amenities',
        'Location details',
        'Project status',
        'Construction status',
        'Possession timelines',
        'Offers and promotions',
      ],
    },
    {
      paragraphs: [
        'Users should independently verify important property information before making any financial or legal decision.',
      ],
    },
    {
      heading: '3. No Guarantee of Availability',
      paragraphs: [
        'The presence of a property on our website does not guarantee that the property remains available.',
        'Properties may be sold, booked, rented, withdrawn, or modified without prior notice.',
        'Please contact Devi Real Estates to confirm current availability and details.',
      ],
    },
    {
      heading: '4. Prices',
      paragraphs: [
        'Prices displayed on the website may be subject to change.',
        'Unless specifically stated otherwise, displayed prices may not include additional charges such as:',
      ],
      bullets: [
        'Registration charges',
        'Stamp duty',
        'Taxes',
        'Maintenance charges',
        'Development charges',
        'Parking charges',
        'Legal or documentation charges',
        'Other applicable costs',
      ],
    },
    {
      paragraphs: [
        'The final price and applicable charges should be confirmed before entering into a transaction.',
      ],
    },
    {
      heading: '5. Website Use',
      paragraphs: [
        'You agree to use this website only for lawful purposes.',
        'You must not:',
      ],
      bullets: [
        'Use the website for fraudulent purposes',
        'Submit false information',
        'Attempt to gain unauthorised access to the website',
        'Copy or reproduce website content without permission',
        'Interfere with website security or functionality',
        'Use automated systems to scrape or misuse website information',
        'Upload malicious code or harmful material',
      ],
    },
    {
      heading: '6. Enquiries',
      paragraphs: ['Submitting an enquiry does not constitute:'],
      bullets: [
        'A booking',
        'A purchase agreement',
        'A rental agreement',
        'A guarantee of property allocation',
        'A confirmation of price',
        'A legal commitment by Devi Real Estates',
      ],
    },
    {
      paragraphs: ['An enquiry is simply a request for further information or communication.'],
    },
    {
      heading: '7. Third-Party Properties and Partners',
      paragraphs: [
        'Some properties listed on the website may be owned, developed, marketed, or managed by third parties.',
        'Where applicable, Devi Real Estates may facilitate communication between prospective customers and property owners, developers, agents, or other authorised representatives.',
        'The terms of any actual property transaction will be governed by the relevant agreement between the parties.',
      ],
    },
    {
      heading: '8. Intellectual Property',
      paragraphs: [
        'Unless otherwise stated, the content of this website, including website design, text, graphics, logos, images, branding, layout, software, and other original materials belongs to Devi Real Estates or its respective licensors.',
        'You may not reproduce, distribute, modify, or commercially use such content without prior permission.',
      ],
    },
    {
      heading: '9. External Links',
      paragraphs: [
        'Our website may contain links to third-party websites or services.',
        'These links are provided for convenience. Devi Real Estates does not control and is not responsible for the content, availability, security, or privacy practices of third-party websites.',
      ],
    },
    {
      heading: '10. Limitation of Liability',
      paragraphs: [
        'To the extent permitted by applicable law, Devi Real Estates shall not be responsible for losses arising solely from reliance on information displayed on the website without independent verification.',
        'Users are responsible for conducting appropriate due diligence before purchasing, renting, booking, or investing in any property.',
        'Nothing in these Terms is intended to exclude liability that cannot legally be excluded under applicable law.',
      ],
    },
    {
      heading: '11. Changes to the Website',
      paragraphs: [
        'We may modify, suspend, remove, or update any part of the website or its content at any time without prior notice.',
      ],
    },
    {
      heading: '12. Changes to These Terms',
      paragraphs: [
        'We may update these Terms & Conditions from time to time. The updated version will be published on this page with a revised "Last Updated" date.',
      ],
    },
    {
      heading: '13. Governing Law',
      paragraphs: [
        'These Terms & Conditions shall be governed by the applicable laws of India.',
        'Subject to applicable law, disputes shall be subject to the jurisdiction of the appropriate courts and authorities having jurisdiction over the relevant matter.',
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

const TermsConditions: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms & Conditions | Devi Real Estates';
  }, []);

  return (
    <LegalPageLayout documentData={termsData}>
      <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-8">
        <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed bg-orange-50/50 p-4 rounded-xl border border-orange-100/60">
          Welcome to Devi Real Estates. By accessing or using this website, you agree to comply with these Terms & Conditions. If you do not agree with these terms, please do not use the website.
        </p>

        {/* Section 1 */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            1. About the Website
          </h2>
          <p>
            Devi Real Estates operates this website to provide information about properties, real-estate projects, and related services.
          </p>
          <p>
            The website may contain property listings, images, descriptions, prices, specifications, location information, project information, and contact/enquiry facilities.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            2. Property Information
          </h2>
          <p>We make reasonable efforts to present useful and accurate property information.</p>
          <p>However, property information may change from time to time, including:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Price',
              'Availability',
              'Property specifications',
              'Area or dimensions',
              'Amenities',
              'Location details',
              'Project status',
              'Construction status',
              'Possession timelines',
              'Offers and promotions',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="font-medium text-slate-800">
            Users should independently verify important property information before making any financial or legal decision.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            3. No Guarantee of Availability
          </h2>
          <p>
            The presence of a property on our website does not guarantee that the property remains available.
          </p>
          <p>
            Properties may be sold, booked, rented, withdrawn, or modified without prior notice.
          </p>
          <p>
            Please contact Devi Real Estates to confirm current availability and details.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            4. Prices
          </h2>
          <p>Prices displayed on the website may be subject to change.</p>
          <p>Unless specifically stated otherwise, displayed prices may not include additional charges such as:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Registration charges',
              'Stamp duty',
              'Taxes',
              'Maintenance charges',
              'Development charges',
              'Parking charges',
              'Legal or documentation charges',
              'Other applicable costs',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>The final price and applicable charges should be confirmed before entering into a transaction.</p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            5. Website Use
          </h2>
          <p>You agree to use this website only for lawful purposes. You must not:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Use the website for fraudulent purposes</li>
            <li>Submit false information</li>
            <li>Attempt to gain unauthorised access to the website</li>
            <li>Copy or reproduce website content without permission</li>
            <li>Interfere with website security or functionality</li>
            <li>Use automated systems to scrape or misuse website information</li>
            <li>Upload malicious code or harmful material</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            6. Enquiries
          </h2>
          <p>Submitting an enquiry does not constitute:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>A booking</li>
            <li>A purchase agreement</li>
            <li>A rental agreement</li>
            <li>A guarantee of property allocation</li>
            <li>A confirmation of price</li>
            <li>A legal commitment by Devi Real Estates</li>
          </ul>
          <p>An enquiry is simply a request for further information or communication.</p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            7. Third-Party Properties and Partners
          </h2>
          <p>
            Some properties listed on the website may be owned, developed, marketed, or managed by third parties.
          </p>
          <p>
            Where applicable, Devi Real Estates may facilitate communication between prospective customers and property owners, developers, agents, or other authorised representatives.
          </p>
          <p>
            The terms of any actual property transaction will be governed by the relevant agreement between the parties.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            8. Intellectual Property
          </h2>
          <p>
            Unless otherwise stated, the content of this website, including website design, text, graphics, logos, images, branding, layout, software, and other original materials belongs to Devi Real Estates or its respective licensors.
          </p>
          <p>
            You may not reproduce, distribute, modify, or commercially use such content without prior permission.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            9. External Links
          </h2>
          <p>
            Our website may contain links to third-party websites or services. These links are provided for convenience. Devi Real Estates does not control and is not responsible for the content, availability, security, or privacy practices of third-party websites.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            10. Limitation of Liability
          </h2>
          <p>
            To the extent permitted by applicable law, Devi Real Estates shall not be responsible for losses arising solely from reliance on information displayed on the website without independent verification.
          </p>
          <p>
            Users are responsible for conducting appropriate due diligence before purchasing, renting, booking, or investing in any property.
          </p>
          <p>
            Nothing in these Terms is intended to exclude liability that cannot legally be excluded under applicable law.
          </p>
        </section>

        {/* Section 11 & 12 & 13 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            11. Changes to Website and Terms
          </h2>
          <p>
            We may modify, suspend, remove, or update any part of the website or these Terms & Conditions at any time without prior notice. The updated version will be published on this page with a revised "Last Updated" date.
          </p>
        </section>

        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            12. Governing Law & Jurisdiction
          </h2>
          <p>
            These Terms & Conditions shall be governed by the applicable laws of India. Subject to applicable law, disputes shall be subject to the jurisdiction of the appropriate courts and authorities having jurisdiction over the relevant matter.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default TermsConditions;
