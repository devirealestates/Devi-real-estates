import jsPDF from 'jspdf';

export interface LegalSection {
  heading?: string;
  subheading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocumentData {
  title: string;
  lastUpdated: string;
  description?: string;
  sections: LegalSection[];
  contactInfo?: {
    company: string;
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
}

export const exportLegalDocumentToPDF = (docData: LegalDocumentData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      // Add page number in footer before adding new page
      addFooter();
      doc.addPage();
      y = margin + 5;
    }
  };

  const addFooter = () => {
    const pageCount = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Devi Real Estates • ${docData.title} • Page ${doc.getNumberOfPages()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Header Brand Banner
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DEVI REAL ESTATES', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Geetha paatashala road, Thimmapuram, Kakinada, AP - 533005 | +91 99129 91671', margin, 18);

  y = 35;

  // Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(docData.title, margin, y);
  y += 6;

  // Last updated
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Last Updated: ${docData.lastUpdated}`, margin, y);
  y += 7;

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Description / Intro
  if (docData.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // slate-700
    const descLines = doc.splitTextToSize(docData.description, contentWidth);
    checkPageBreak(descLines.length * 4.8);
    doc.text(descLines, margin, y);
    y += descLines.length * 4.8 + 4;
  }

  // Render Sections
  docData.sections.forEach((section) => {
    checkPageBreak(12);

    if (section.heading) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      const headingLines = doc.splitTextToSize(section.heading, contentWidth);
      doc.text(headingLines, margin, y);
      y += headingLines.length * 5 + 2;
    }

    if (section.subheading) {
      checkPageBreak(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const subLines = doc.splitTextToSize(section.subheading, contentWidth);
      doc.text(subLines, margin, y);
      y += subLines.length * 4.5 + 2;
    }

    if (section.paragraphs) {
      section.paragraphs.forEach((p) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const pLines = doc.splitTextToSize(p, contentWidth);
        checkPageBreak(pLines.length * 4.8 + 2);
        doc.text(pLines, margin, y);
        y += pLines.length * 4.8 + 3;
      });
    }

    if (section.bullets && section.bullets.length > 0) {
      section.bullets.forEach((bullet) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const bulletText = `•  ${bullet}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 4);
        checkPageBreak(bulletLines.length * 4.8 + 2);
        doc.text(bulletLines, margin + 3, y);
        y += bulletLines.length * 4.8 + 2;
      });
      y += 2;
    }

    y += 3;
  });

  // Contact Info Box
  if (docData.contactInfo) {
    checkPageBreak(35);
    y += 4;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(docData.contactInfo.company, margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Phone: ${docData.contactInfo.phone}`, margin + 4, y + 12);
    doc.text(`Email: ${docData.contactInfo.email}`, margin + 4, y + 17);
    doc.text(`Address: ${docData.contactInfo.address}`, margin + 4, y + 22);
    if (docData.contactInfo.website) {
      doc.text(`Website: ${docData.contactInfo.website}`, margin + 4, y + 27);
    }
    y += 38;
  }

  // Add final footers to all pages
  const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Devi Real Estates • ${docData.title} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const fileName = `${docData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
};
