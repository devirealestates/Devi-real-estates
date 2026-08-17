import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { exportLegalDocumentToPDF, LegalDocumentData } from '@/lib/legalPdfExport';
import { useToast } from '@/hooks/use-toast';

interface LegalPageLayoutProps {
  documentData: LegalDocumentData;
  children: React.ReactNode;
}

const legalNavLinks = [
  { name: 'Privacy Policy', path: '/privacy-policy' },
  { name: 'Terms & Conditions', path: '/terms-and-conditions' },
  { name: 'Disclaimer', path: '/disclaimer' },
  { name: 'RERA & Property Info', path: '/rera-disclaimer' },
];

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ documentData, children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      exportLegalDocumentToPDF(documentData);
      toast({
        title: "PDF Downloaded",
        description: `${documentData.title} has been downloaded to your device.`,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to browser print
      window.print();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col selection:bg-orange-500 selection:text-white">
      <HeaderRedesign />

      {/* Hero / Header Section */}
      <section className="pt-16 sm:pt-28 pb-3 sm:pb-6 bg-gradient-to-b from-white via-orange-50/30 to-slate-50 border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mb-2 sm:mb-3">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Legal</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-medium truncate">{documentData.title}</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/80 text-orange-700 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Shield className="w-3 h-3" />
              Official Legal Document
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight font-display">
              {documentData.title}
            </h1>
            
            {/* Last Updated + Download & Print Icons placed aside the date */}
            <div className="flex items-center justify-between gap-3 mt-2">
              <p className="text-slate-500 text-xs sm:text-sm">
                Last Updated: <span className="font-semibold text-slate-700">{documentData.lastUpdated}</span>
              </p>

              {/* Action Icon Buttons: PDF Download & Print side-by-side with date */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                  title="Download as PDF"
                  aria-label="Download as PDF"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                  title="Print Document"
                  aria-label="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Legal Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-3 sm:pt-4 sm:mt-4 border-t border-slate-200/70 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {legalNavLinks.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-5 sm:py-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-10 lg:p-12 shadow-sm border border-slate-200/80">
            {children}

            {/* Official Contact Box */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">
                Contact Devi Real Estates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
                <a 
                  href="tel:+919912991671"
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-orange-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Phone</span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">+91 99129 91671</p>
                  </div>
                </a>

                <a 
                  href="mailto:info.devirealestates@gmail.com"
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-orange-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Email</span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 truncate">info.devirealestates@gmail.com</p>
                  </div>
                </a>

                <a 
                  href="https://www.google.com/maps?q=17.034576646816706,82.25008959739333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-orange-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Office</span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">Geetha paatashala road, Thimmapuram, Kakinada - 533005</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterRedesign />
    </div>
  );
};

export default LegalPageLayout;
