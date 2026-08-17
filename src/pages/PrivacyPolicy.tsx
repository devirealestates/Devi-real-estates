import React, { useEffect } from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import { LegalDocumentData } from '@/lib/legalPdfExport';

const privacyPolicyData: LegalDocumentData = {
  title: 'Privacy Policy',
  lastUpdated: 'August 17, 2026',
  description: 'Devi Real Estates ("Devi Real Estates", "we", "us", or "our") respects your privacy and is committed to protecting the personal information you provide when using our website and services. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you when you use our website.',
  sections: [
    {
      heading: '1. Information We Collect',
      paragraphs: ['When you interact with our website, we may collect information that you voluntarily provide to us, including:'],
      bullets: [
        'Full name',
        'Mobile number',
        'Email address',
        'Property preferences',
        'Preferred location',
        'Property type',
        'Budget or price range',
        'Buying, selling, renting, or enquiry details',
        'Messages or information submitted through enquiry forms',
        'Any other information you choose to provide when contacting us',
      ],
    },
    {
      paragraphs: ['We may also collect limited technical information automatically when you use our website, such as browser type, device type, IP address, pages visited, and general website usage information, where applicable.'],
    },
    {
      heading: '2. How We Use Your Information',
      paragraphs: ['We may use the information you provide to:'],
      bullets: [
        'Respond to your property enquiries',
        'Contact you regarding properties you are interested in',
        'Provide information about available properties',
        'Arrange property visits or appointments',
        'Understand your property requirements',
        'Provide real-estate assistance and services',
        'Improve our website and services',
        'Respond to customer support requests',
        'Maintain records of enquiries and communications',
        'Comply with applicable legal and regulatory requirements',
      ],
    },
    {
      paragraphs: ['We will not use your personal information for purposes unrelated to the services or enquiries for which it was collected, except where required or permitted by applicable law.'],
    },
    {
      heading: '3. Property Enquiries and Contact',
      paragraphs: [
        'When you submit an enquiry through our website, you understand that Devi Real Estates may contact you using the phone number, email address, or other contact information you provide.',
        'Communication may occur through:',
      ],
      bullets: [
        'Phone calls',
        'SMS',
        'Email',
        'WhatsApp',
        'Other communication methods reasonably necessary to respond to your enquiry',
      ],
    },
    {
      paragraphs: ['You may request that we stop contacting you for promotional purposes.'],
    },
    {
      heading: '4. Sharing of Information',
      paragraphs: [
        'We may share relevant enquiry information with our authorised employees, representatives, property consultants, developers, owners, agents, or service partners when reasonably necessary to respond to your property enquiry or provide the requested service.',
        'We do not intend to sell your personal information as a commercial product.',
        'Information may also be disclosed when required by law, regulation, legal process, government authority, or to protect our legal rights and security.',
      ],
    },
    {
      heading: '5. Data Security',
      paragraphs: [
        'We take reasonable measures to protect the personal information provided to us against unauthorised access, misuse, alteration, disclosure, or loss.',
        'However, no internet transmission or electronic storage system can be guaranteed to be completely secure. Therefore, while we take reasonable precautions, we cannot guarantee absolute security of information transmitted through the internet.',
      ],
    },
    {
      heading: '6. Data Retention',
      paragraphs: ['We may retain personal information for as long as reasonably necessary to:'],
      bullets: [
        'Respond to your enquiry',
        'Provide requested services',
        'Maintain business and communication records',
        'Comply with legal or regulatory obligations',
        'Resolve disputes',
        'Protect our legal rights',
      ],
    },
    {
      paragraphs: ['When information is no longer reasonably required, we may delete or anonymise it, subject to applicable legal requirements.'],
    },
    {
      heading: '7. Third-Party Services',
      paragraphs: [
        'Our website may use third-party services for functions such as hosting, communication, analytics, maps, forms, or other website functionality.',
        'These third-party services may process certain information according to their own privacy policies and applicable terms.',
        'Where applicable, links to third-party websites are provided for convenience. Devi Real Estates is not responsible for the privacy practices of websites that we do not control.',
      ],
    },
    {
      heading: '8. Cookies and Similar Technologies',
      paragraphs: [
        'Our website may use cookies or similar technologies where necessary for website functionality, security, performance, analytics, or other legitimate purposes.',
        'Cookies are small data files stored by your browser that can help a website remember information or understand how visitors use the website.',
        'If we introduce non-essential analytics, advertising, or tracking technologies, we may update this Privacy Policy and provide appropriate information or controls where required.',
      ],
    },
    {
      heading: '9. Your Choices and Requests',
      paragraphs: ['You may contact us to:'],
      bullets: [
        'Ask what personal information we hold about you',
        'Request correction of inaccurate information',
        'Request deletion of personal information where applicable',
        'Withdraw consent where processing is based on consent',
        'Request that we stop promotional communications',
      ],
    },
    {
      paragraphs: ['Requests will be handled subject to applicable law and legitimate business or legal requirements.'],
    },
    {
      heading: "10. Children's Privacy",
      paragraphs: [
        'Our website is intended for general audiences and is not specifically directed toward children.',
        'We do not knowingly request or collect personal information from children for purposes that are not permitted under applicable law.',
      ],
    },
    {
      heading: '11. Changes to This Privacy Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time to reflect changes to our website, services, technology, or applicable laws.',
        'Any updated version will be published on this page with a revised "Last Updated" date.',
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

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | Devi Real Estates';
  }, []);

  return (
    <LegalPageLayout documentData={privacyPolicyData}>
      <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-8">
        <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed bg-orange-50/50 p-4 rounded-xl border border-orange-100/60">
          Devi Real Estates ("Devi Real Estates", "we", "us", or "our") respects your privacy and is committed to protecting the personal information you provide when using our website and services.
        </p>

        <p>
          This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you when you use our website.
        </p>

        {/* Section 1 */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            1. Information We Collect
          </h2>
          <p>
            When you interact with our website, we may collect information that you voluntarily provide to us, including:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Full name',
              'Mobile number',
              'Email address',
              'Property preferences',
              'Preferred location',
              'Property type',
              'Budget or price range',
              'Buying, selling, renting, or enquiry details',
              'Messages or information submitted through enquiry forms',
              'Any other information you choose to provide when contacting us',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-500 text-xs sm:text-sm">
            We may also collect limited technical information automatically when you use our website, such as browser type, device type, IP address, pages visited, and general website usage information, where applicable.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            2. How We Use Your Information
          </h2>
          <p>We may use the information you provide to:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0 my-3">
            {[
              'Respond to your property enquiries',
              'Contact you regarding properties you are interested in',
              'Provide information about available properties',
              'Arrange property visits or appointments',
              'Understand your property requirements',
              'Provide real-estate assistance and services',
              'Improve our website and services',
              'Respond to customer support requests',
              'Maintain records of enquiries and communications',
              'Comply with applicable legal and regulatory requirements',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            We will not use your personal information for purposes unrelated to the services or enquiries for which it was collected, except where required or permitted by applicable law.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            3. Property Enquiries and Contact
          </h2>
          <p>
            When you submit an enquiry through our website, you understand that Devi Real Estates may contact you using the phone number, email address, or other contact information you provide.
          </p>
          <p className="font-medium text-slate-800">Communication may occur through:</p>
          <div className="flex flex-wrap gap-2 my-2">
            {['Phone calls', 'SMS', 'Email', 'WhatsApp', 'Other reasonable methods'].map((method, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 font-medium text-xs rounded-full border border-orange-100">
                {method}
              </span>
            ))}
          </div>
          <p>You may request that we stop contacting you for promotional purposes.</p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            4. Sharing of Information
          </h2>
          <p>
            We may share relevant enquiry information with our authorised employees, representatives, property consultants, developers, owners, agents, or service partners when reasonably necessary to respond to your property enquiry or provide the requested service.
          </p>
          <p className="font-medium text-slate-800">
            We do not intend to sell your personal information as a commercial product.
          </p>
          <p>
            Information may also be disclosed when required by law, regulation, legal process, government authority, or to protect our legal rights and security.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            5. Data Security
          </h2>
          <p>
            We take reasonable measures to protect the personal information provided to us against unauthorised access, misuse, alteration, disclosure, or loss.
          </p>
          <p>
            However, no internet transmission or electronic storage system can be guaranteed to be completely secure. Therefore, while we take reasonable precautions, we cannot guarantee absolute security of information transmitted through the internet.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            6. Data Retention
          </h2>
          <p>We may retain personal information for as long as reasonably necessary to:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Respond to your enquiry</li>
            <li>Provide requested services</li>
            <li>Maintain business and communication records</li>
            <li>Comply with legal or regulatory obligations</li>
            <li>Resolve disputes</li>
            <li>Protect our legal rights</li>
          </ul>
          <p>
            When information is no longer reasonably required, we may delete or anonymise it, subject to applicable legal requirements.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            7. Third-Party Services
          </h2>
          <p>
            Our website may use third-party services for functions such as hosting, communication, analytics, maps, forms, or other website functionality.
          </p>
          <p>
            These third-party services may process certain information according to their own privacy policies and applicable terms.
          </p>
          <p>
            Where applicable, links to third-party websites are provided for convenience. Devi Real Estates is not responsible for the privacy practices of websites that we do not control.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            8. Cookies and Similar Technologies
          </h2>
          <p>
            Our website may use cookies or similar technologies where necessary for website functionality, security, performance, analytics, or other legitimate purposes.
          </p>
          <p>
            Cookies are small data files stored by your browser that can help a website remember information or understand how visitors use the website.
          </p>
          <p>
            If we introduce non-essential analytics, advertising, or tracking technologies, we may update this Privacy Policy and provide appropriate information or controls where required.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            9. Your Choices and Requests
          </h2>
          <p>You may contact us to:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Ask what personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of personal information where applicable</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Request that we stop promotional communications</li>
          </ul>
          <p>
            Requests will be handled subject to applicable law and legitimate business or legal requirements.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            10. Children's Privacy
          </h2>
          <p>
            Our website is intended for general audiences and is not specifically directed toward children.
          </p>
          <p>
            We do not knowingly request or collect personal information from children for purposes that are not permitted under applicable law.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            11. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes to our website, services, technology, or applicable laws.
          </p>
          <p>
            Any updated version will be published on this page with a revised "Last Updated" date.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            12. Contact Us
          </h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us.
          </p>
          <p className="text-xs text-slate-400 italic">
            By using our website and submitting information through our enquiry forms, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
