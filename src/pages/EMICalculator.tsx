import React, { useState, useEffect } from 'react';
import { Calculator, ArrowLeft, Download, Mail, RotateCcw, Info, TrendingUp, PieChart, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '@/config/emailjs-config';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';

interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
  eligibility?: {
    maxLoanAmount: number;
    isEligible: boolean;
    message: string;
  };
}

interface AmortizationData {
  year: number;
  principal: number;
  interest: number;
  balance: number;
  totalPaid: number;
}

interface BankComparison {
  bankName: string;
  interestRate: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

const EMICalculator = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    propertyPrice: '',
    downPayment: '',
    interestRate: '8.5',
    loanTenure: 20,
    monthlyIncome: '',
    existingEMIs: '',
    prepaymentAmount: '',
    interestType: 'reducing' // reducing or flat
  });

  const [results, setResults] = useState<EMIResult | null>(null);
  const [amortizationData, setAmortizationData] = useState<AmortizationData[]>([]);
  const [bankComparisons, setBankComparisons] = useState<BankComparison[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [prepaymentImpact, setPrepaymentImpact] = useState<any>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Check if EmailJS is configured
  const isEmailJSConfigured = () => {
    return EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY" && 
           EMAILJS_CONFIG.SERVICE_ID !== "YOUR_SERVICE_ID" && 
           EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID";
  };

  // Fallback toast function if useToast is not available
  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    if (toast) {
      toast({ title, description, variant });
    } else {
      // Fallback to browser alert if toast is not available
      alert(`${title}: ${description}`);
    }
  };

  // Sample bank data for comparison
  const bankRates = [
    { name: 'SBI', rate: 8.50 },
    { name: 'HDFC', rate: 8.65 },
    { name: 'ICICI', rate: 8.70 },
    { name: 'Axis Bank', rate: 8.75 },
    { name: 'Kotak', rate: 8.80 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Enhanced number formatting with NaN protection
  const formatNumber = (num: string) => {
    const value = num.replace(/[^\d]/g, '');
    if (!value || value === '') return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('en-IN').format(numValue);
  };

  // Safe number parsing with NaN protection and defaults
  const parseNumber = (str: string) => {
    if (!str || str.trim() === '') return 0;
    const cleanStr = str.replace(/[^\d]/g, '');
    const numValue = Number(cleanStr);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Calculate loan amount with validation and error handling
  const calculateLoanAmount = () => {
    const propertyPrice = parseNumber(formData.propertyPrice);
    const downPayment = parseNumber(formData.downPayment);
    
    // Prevent negative loan amounts and invalid scenarios
    if (propertyPrice <= 0 || downPayment < 0) return 0;
    if (downPayment >= propertyPrice) return 0;
    
    return propertyPrice - downPayment;
  };

  const calculateEMI = () => {
    const loanAmount = calculateLoanAmount();
    const monthlyRate = parseFloat(formData.interestRate) / (12 * 100);
    const numberOfPayments = formData.loanTenure * 12;

    if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      return;
    }

    let monthlyEMI: number;
    let totalInterest: number;

    if (formData.interestType === 'reducing') {
      // Reducing balance EMI calculation
      monthlyEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      totalInterest = (monthlyEMI * numberOfPayments) - loanAmount;
    } else {
      // Flat rate calculation
      totalInterest = (loanAmount * parseFloat(formData.interestRate) * formData.loanTenure) / 100;
      monthlyEMI = (loanAmount + totalInterest) / numberOfPayments;
    }

    const totalPayment = loanAmount + totalInterest;

    // Calculate loan eligibility if income is provided
    let eligibility;
    if (formData.monthlyIncome) {
      const monthlyIncome = parseNumber(formData.monthlyIncome);
      const existingEMIs = parseNumber(formData.existingEMIs || '0');
      const maxEMIAllowed = (monthlyIncome * 0.4) - existingEMIs; // 40% of income
      const maxLoanAmount = (maxEMIAllowed * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) / 
                            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
      
      eligibility = {
        maxLoanAmount,
        isEligible: monthlyEMI <= maxEMIAllowed,
        message: monthlyEMI <= maxEMIAllowed ? 
          'You are eligible for this loan amount!' : 
          `Your maximum eligible EMI is ${formatCurrency(maxEMIAllowed)}`
      };
    }

    const result: EMIResult = {
      monthlyEMI,
      totalInterest,
      totalPayment,
      loanAmount,
      eligibility
    };

    setResults(result);
    generateAmortizationSchedule(loanAmount, monthlyRate, numberOfPayments, monthlyEMI);
    generateBankComparisons(loanAmount, formData.loanTenure);
    
    // Calculate prepayment impact if provided
    if (formData.prepaymentAmount) {
      calculatePrepaymentImpact(loanAmount, monthlyRate, numberOfPayments, monthlyEMI);
    }

    setShowResults(true);
  };

  const generateBankComparisons = (loanAmount: number, tenure: number) => {
    const comparisons: BankComparison[] = bankRates.map(bank => {
      const monthlyRate = bank.rate / (12 * 100);
      const numberOfPayments = tenure * 12;
      const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                  (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      const totalInterest = (emi * numberOfPayments) - loanAmount;
      const totalPayment = loanAmount + totalInterest;
      
      return {
        bankName: bank.name,
        interestRate: bank.rate,
        emi,
        totalInterest,
        totalPayment
      };
    });
    
    setBankComparisons(comparisons);
  };

  const generateAmortizationSchedule = (
    loanAmount: number, 
    monthlyRate: number, 
    numberOfPayments: number, 
    monthlyEMI: number
  ) => {
    const schedule: AmortizationData[] = [];
    let balance = loanAmount;
    let totalPaid = 0;

    for (let year = 1; year <= formData.loanTenure; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12 && balance > 0; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyEMI - interestPayment;
        
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        balance -= principalPayment;
        totalPaid += monthlyEMI;
      }

      schedule.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, balance),
        totalPaid
      });
    }

    setAmortizationData(schedule);
  };

  const calculatePrepaymentImpact = (
    loanAmount: number,
    monthlyRate: number,
    numberOfPayments: number,
    originalEMI: number
  ) => {
    const prepayment = parseNumber(formData.prepaymentAmount);
    const newLoanAmount = loanAmount - prepayment;
    
    if (newLoanAmount <= 0) {
      setPrepaymentImpact({
        newTenure: 0,
        interestSaved: results?.totalInterest || 0,
        newEMI: 0
      });
      return;
    }

    // Calculate new tenure with same EMI
    const newTenureMonths = Math.log(1 + (newLoanAmount * monthlyRate) / originalEMI) / 
                           Math.log(1 + monthlyRate);
    const newTenureYears = newTenureMonths / 12;
    
    // Calculate interest saved
    const originalTotalInterest = (originalEMI * numberOfPayments) - loanAmount;
    const newTotalInterest = (originalEMI * newTenureMonths) - newLoanAmount;
    const interestSaved = originalTotalInterest - newTotalInterest;

    setPrepaymentImpact({
      newTenure: newTenureYears,
      interestSaved,
      newEMI: originalEMI
    });
  };

  const resetForm = () => {
    setFormData({
      propertyPrice: '',
      downPayment: '',
      interestRate: '8.5',
      loanTenure: 20,
      monthlyIncome: '',
      existingEMIs: '',
      prepaymentAmount: '',
      interestType: 'reducing'
    });
    setResults(null);
    setAmortizationData([]);
    setShowResults(false);
    setPrepaymentImpact(null);
  };

  const sendEmailSummary = async () => {
    if (!currentUser) {
      showToast(
        "Authentication Required",
        "Please log in to send EMI summary via email.",
        "destructive"
      );
      return;
    }

    if (!results) {
      showToast(
        "No Data Available",
        "Please calculate EMI first before sending summary.",
        "destructive"
      );
      return;
    }

    setIsEmailSending(true);

    try {
      // Check if EmailJS is properly configured
      if (!isEmailJSConfigured()) {
        // EmailJS not configured - use fallback method
        await sendEmailFallback();
        return;
      }

      // Generate email content
      const emailContent = generateEmailContent();

      // Initialize EmailJS with actual configuration
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

      const templateParams = {
        to_email: currentUser.email,
        to_name: currentUser.displayName || 'Valued Customer',
        subject: 'Your EMI Calculation Summary',
        message: emailContent,
      };

      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);

      showToast(
        "✅ Email Sent Successfully",
        `EMI summary sent to ${currentUser.email}`
      );

    } catch (error) {
      console.error('Email sending failed:', error);
      // Try fallback method if EmailJS fails
      await sendEmailFallback();
    } finally {
      setIsEmailSending(false);
    }
  };

  const sendEmailFallback = async () => {
    try {
      // Create a mailto link as fallback
      const emailContent = generateEmailContent();
      const subject = encodeURIComponent('Your EMI Calculation Summary');
      const body = encodeURIComponent(emailContent);
      const mailtoLink = `mailto:${currentUser?.email}?subject=${subject}&body=${body}`;
      
      // Try to open default email client
      window.open(mailtoLink, '_blank');
      
      showToast(
        "📧 Email Client Opened",
        "Your default email client has been opened with the EMI summary. Please send the email manually.",
      );
    } catch (error) {
      console.error('Fallback email failed:', error);
      // Final fallback - copy to clipboard
      try {
        const emailContent = generateEmailContent();
        await navigator.clipboard.writeText(emailContent);
        showToast(
          "📋 Summary Copied",
          "EMI summary has been copied to clipboard. You can paste it into an email.",
        );
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        showToast(
          "⚙️ Configuration Required",
          "EmailJS not configured. Please check the setup instructions in the documentation.",
          "destructive"
        );
      }
    }
  };

  const generateEmailContent = () => {
    if (!results) return '';

    const timestamp = new Date().toLocaleString();
    const loanAmount = calculateLoanAmount();

    return `
🏠 MORTGAGE EMI SUMMARY REPORT

📅 Generated: ${timestamp}
👤 User: ${currentUser?.email}

💰 LOAN DETAILS:
• Property Price: ${formatCurrency(parseNumber(formData.propertyPrice))}
• Down Payment: ${formatCurrency(parseNumber(formData.downPayment))}
• Loan Amount: ${formatCurrency(loanAmount)}
• Interest Rate: ${formData.interestRate}% per annum
• Loan Tenure: ${formData.loanTenure} years
• Interest Type: ${formData.interestType === 'reducing' ? 'Reducing Balance' : 'Flat Rate'}

📊 MONTHLY EMI BREAKDOWN:
• Monthly EMI: ${formatCurrency(results.monthlyEMI)}
• Total Interest: ${formatCurrency(results.totalInterest)}
• Total Payment: ${formatCurrency(results.totalPayment)}

${formData.monthlyIncome ? `
💼 ELIGIBILITY CHECK:
• Monthly Income: ${formatCurrency(parseNumber(formData.monthlyIncome))}
• Existing EMIs: ${formatCurrency(parseNumber(formData.existingEMIs || '0'))}
• Loan Status: ${results.eligibility?.isEligible ? 'ELIGIBLE ✅' : 'NOT ELIGIBLE ❌'}
${results.eligibility?.message ? `• Note: ${results.eligibility.message}` : ''}
` : ''}

${prepaymentImpact ? `
🎯 PREPAYMENT IMPACT:
• Prepayment Amount: ${formatCurrency(parseNumber(formData.prepaymentAmount))}
• New Loan Tenure: ${prepaymentImpact.newTenure.toFixed(1)} years
• Interest Saved: ${formatCurrency(prepaymentImpact.interestSaved)}
• Time Saved: ${(formData.loanTenure - prepaymentImpact.newTenure).toFixed(1)} years
` : ''}

---
This summary was generated by Prime Vista Homes EMI Calculator.
For more property investment opportunities, visit our website.

⚠️ Note: This calculation is for informational purposes only. Actual loan terms may vary based on lender policies and your credit profile.
    `.trim();
  };

  const generatePDF = async () => {
    if (!results) {
      showToast(
        "No Data Available",
        "Please calculate EMI first before generating PDF.",
        "destructive"
      );
      return;
    }

    setIsPdfGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(220, 38, 38); // Red color
      pdf.text('MORTGAGE EMI SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date and user info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      if (currentUser?.email) {
        pdf.text(`User: ${currentUser.email}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
      }

      // Loan Details Section
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('LOAN DETAILS', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      const loanAmount = calculateLoanAmount();
      const loanDetails = [
        `Property Price: ${formatCurrency(parseNumber(formData.propertyPrice))}`,
        `Down Payment: ${formatCurrency(parseNumber(formData.downPayment))}`,
        `Loan Amount: ${formatCurrency(loanAmount)}`,
        `Interest Rate: ${formData.interestRate}% per annum`,
        `Loan Tenure: ${formData.loanTenure} years`,
        `Interest Type: ${formData.interestType === 'reducing' ? 'Reducing Balance' : 'Flat Rate'}`
      ];

      loanDetails.forEach(detail => {
        pdf.text(detail, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // EMI Results Section
      pdf.setFontSize(14);
      pdf.text('EMI CALCULATION RESULTS', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(220, 38, 38);
      pdf.text(`Monthly EMI: ${formatCurrency(results.monthlyEMI)}`, 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Interest: ${formatCurrency(results.totalInterest)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Payment: ${formatCurrency(results.totalPayment)}`, 20, yPosition);
      yPosition += 15;

      // Eligibility Check Section
      if (results.eligibility && formData.monthlyIncome) {
        pdf.setFontSize(14);
        pdf.text('ELIGIBILITY CHECK', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(`Monthly Income: ${formatCurrency(parseNumber(formData.monthlyIncome))}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Existing EMIs: ${formatCurrency(parseNumber(formData.existingEMIs || '0'))}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(results.eligibility.isEligible ? 0 : 255, results.eligibility.isEligible ? 128 : 0, 0);
        pdf.text(`Status: ${results.eligibility.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(0, 0, 0);
        if (results.eligibility.message) {
          const messageLines = pdf.splitTextToSize(results.eligibility.message, pageWidth - 40);
          messageLines.forEach((line: string) => {
            pdf.text(line, 20, yPosition);
            yPosition += 6;
          });
        }
        yPosition += 10;
      }

      // Prepayment Impact Section
      if (prepaymentImpact) {
        pdf.setFontSize(14);
        pdf.text('PREPAYMENT IMPACT', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(`Prepayment Amount: ${formatCurrency(parseNumber(formData.prepaymentAmount))}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`New Loan Tenure: ${prepaymentImpact.newTenure.toFixed(1)} years`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Interest Saved: ${formatCurrency(prepaymentImpact.interestSaved)}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Time Saved: ${(formData.loanTenure - prepaymentImpact.newTenure).toFixed(1)} years`, 20, yPosition);
        yPosition += 15;
      }

      // Chart Section
      const chartElement = document.getElementById('emi-chart-container');
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 150;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(14);
          pdf.text('PAYMENT BREAKDOWN CHART', 20, yPosition);
          yPosition += 15;
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Prime Vista Homes EMI Calculator', pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('Note: This calculation is for informational purposes only. Actual loan terms may vary.', pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Save PDF
      const fileName = `emi-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      showToast(
        "✅ PDF Generated Successfully",
        `EMI summary downloaded as ${fileName}`
      );

    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast(
        "PDF Generation Failed",
        "Failed to generate PDF. Please try again.",
        "destructive"
      );
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const pieData = results ? [
    { name: 'Principal', value: results.loanAmount, color: '#ef4444' },
    { name: 'Interest', value: results.totalInterest, color: '#f97316' }
  ] : [];

  const COLORS = ['#ef4444', '#f97316'];

  return (
    <div className="min-h-screen bg-white">
      <HeaderRedesign />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end pb-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070" 
            alt="EMI Calculator" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-medium text-white mb-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            EMI Calculator
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl">Calculate your home loan EMI and plan your finances with ease</p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loan Details</h2>
                <div className="space-y-8">
                  {/* Property Price */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="propertyPrice" className="font-medium text-base text-gray-700">Property Price</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total cost of the property you want to purchase</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="propertyPrice"
                      type="text"
                      placeholder="Enter property price"
                      value={formData.propertyPrice ? formatNumber(formData.propertyPrice) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setFormData(prev => ({ ...prev, propertyPrice: value }));
                      }}
                      className="text-lg h-12 border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="downPayment" className="font-medium text-base text-gray-700">Down Payment</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Initial payment made upfront (usually 10-20% of property price)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="downPayment"
                      type="text"
                      placeholder="Enter down payment"
                      value={formData.downPayment ? formatNumber(formData.downPayment) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setFormData(prev => ({ ...prev, downPayment: value }));
                      }}
                      className="text-lg h-12 border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Loan Amount Display */}
                  <div className="py-4 border-b border-gray-200">
                    <Label className="text-sm font-medium text-gray-500">Loan Amount</Label>
                    <p className={`text-2xl font-bold transition-colors mt-1 ${
                      (() => {
                        const loanAmount = calculateLoanAmount();
                        if (loanAmount <= 0 && formData.propertyPrice && formData.downPayment) {
                          const propertyPrice = parseNumber(formData.propertyPrice);
                          const downPayment = parseNumber(formData.downPayment);
                          if (downPayment >= propertyPrice) {
                            return "text-red-700";
                          }
                        }
                        return "text-gray-900";
                      })()
                    }`}>
                      {(() => {
                        const loanAmount = calculateLoanAmount();
                        if (loanAmount <= 0) {
                          if (formData.propertyPrice && formData.downPayment) {
                            const propertyPrice = parseNumber(formData.propertyPrice);
                            const downPayment = parseNumber(formData.downPayment);
                            if (downPayment >= propertyPrice) {
                              return "Down payment cannot exceed property price";
                            }
                          }
                          return "₹0";
                        }
                        return formatCurrency(loanAmount);
                      })()}
                    </p>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="interestRate" className="font-medium text-base text-gray-700">Annual Interest Rate (%)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Current home loan interest rates typically range from 7% to 10%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="8.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                      className="text-lg h-12 border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Loan Tenure */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium text-base text-gray-700">Loan Tenure: <span className="text-gray-900 font-semibold">{formData.loanTenure} years</span></Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Longer tenure = Lower EMI but higher total interest</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Slider
                      value={[formData.loanTenure]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, loanTenure: value[0] }))}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  {/* Interest Type */}
                  <div className="space-y-2">
                    <Label className="font-medium text-base text-gray-700">Interest Calculation Method</Label>
                    <Select value={formData.interestType} onValueChange={(value) => setFormData(prev => ({ ...prev, interestType: value }))}>
                      <SelectTrigger className="h-12 text-base border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reducing">Reducing Balance (Recommended)</SelectItem>
                        <SelectItem value="flat">Flat Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Optional Fields - Loan Eligibility Check */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="eligibility" className="border-b border-gray-200">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loan Eligibility Check (Optional)</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-2 pb-6">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyIncome" className="font-medium text-base text-gray-700">Monthly Income</Label>
                        <Input
                          id="monthlyIncome"
                          type="text"
                          placeholder="Enter monthly income"
                          value={formData.monthlyIncome ? formatNumber(formData.monthlyIncome) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, monthlyIncome: value }));
                          }}
                          className="text-lg h-12 border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="existingEMIs" className="font-medium text-base text-gray-700">Existing EMIs</Label>
                        <Input
                          id="existingEMIs"
                          type="text"
                          placeholder="Enter existing EMI payments"
                          value={formData.existingEMIs ? formatNumber(formData.existingEMIs) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, existingEMIs: value }));
                          }}
                          className="text-lg h-12 border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prepaymentAmount" className="font-medium text-base text-gray-700">One-time Prepayment</Label>
                        <Input
                          id="prepaymentAmount"
                          type="text"
                          placeholder="Enter prepayment amount"
                          value={formData.prepaymentAmount ? formatNumber(formData.prepaymentAmount) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, prepaymentAmount: value }));
                          }}
                          className="text-lg h-12 border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-8">
                <Button 
                  onClick={calculateEMI}
                  className="flex-1 bg-transparent hover:bg-gray-900 text-gray-900 hover:text-white py-6 text-base font-medium rounded-full border-2 border-gray-900 transition-all duration-300"
                  disabled={calculateLoanAmount() <= 0}
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate EMI
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetForm}
                  className="px-6 py-6 rounded-full border-gray-300 hover:bg-gray-100"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {showResults && results ? (
                <>
                  {/* EMI Result Cards */}
                  <div className="grid gap-3">
                    <Card className="shadow-lg border-0 bg-gray-900">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-400">Monthly EMI</p>
                            <p className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(results.monthlyEMI)}</p>
                          </div>
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                      <Card className="shadow-lg border-0">
                        <CardContent className="p-5">
                          <p className="text-sm font-medium text-gray-500">Total Interest</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(results.totalInterest)}</p>
                        </CardContent>
                      </Card>
                      <Card className="shadow-lg border-0">
                        <CardContent className="p-5">
                          <p className="text-sm font-medium text-gray-500">Total Payment</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(results.totalPayment)}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Eligibility Check */}
                  {results.eligibility && (
                    <Card className={`shadow-lg border-0 ${results.eligibility.isEligible ? 'bg-green-50' : 'bg-amber-50'}`}>
                      <CardContent className="p-5">
                        <h3 className="font-semibold mb-2 text-base text-gray-900">Loan Eligibility</h3>
                        <p className={`text-sm ${results.eligibility.isEligible ? 'text-green-700' : 'text-amber-700'}`}>
                          {results.eligibility.message}
                        </p>
                        {!results.eligibility.isEligible && (
                          <p className="text-sm text-gray-600 mt-2">
                            Max eligible loan: {formatCurrency(results.eligibility.maxLoanAmount)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Charts */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2 border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Payment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 p-6">
                      <div className="h-64" id="emi-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#1f2937' : '#9ca3af'} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prepayment Impact */}
                  {prepaymentImpact && (
                    <Card className="shadow-lg border-0 bg-gray-50">
                      <CardHeader className="pb-2 border-b border-gray-200">
                        <CardTitle className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>Prepayment Impact</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">New Loan Tenure:</span>
                            <span className="font-semibold text-base text-gray-900">{prepaymentImpact.newTenure.toFixed(1)} years</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Interest Saved:</span>
                            <span className="font-semibold text-base text-green-600">{formatCurrency(prepaymentImpact.interestSaved)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Time Saved:</span>
                            <span className="font-semibold text-base text-gray-900">{(formData.loanTenure - prepaymentImpact.newTenure).toFixed(1)} years</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Advanced Details */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="amortization" className="border rounded-xl shadow-lg bg-white">
                      <AccordionTrigger className="text-left py-4 px-6">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          <span className="text-base font-medium">Amortization Schedule</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 px-6 pb-6">
                          <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={amortizationData.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                                <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                                <Legend />
                                <Bar dataKey="principal" fill="#1f2937" name="Principal" />
                                <Bar dataKey="interest" fill="#9ca3af" name="Interest" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Year</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-700">Principal</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-700">Interest</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-700">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {amortizationData.map((row) => (
                                  <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-2">{row.year}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(row.principal)}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(row.interest)}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(row.balance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 py-5 text-sm border-gray-300 hover:bg-gray-100 rounded-full"
                            onClick={sendEmailSummary}
                            disabled={isEmailSending || !currentUser}
                          >
                            {isEmailSending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 mr-2" />
                            )}
                            {isEmailSending ? 'Sending...' : 'Email Summary'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {!currentUser 
                              ? "Please log in to send email" 
                              : !isEmailJSConfigured() 
                                ? "Will open email client or copy to clipboard" 
                                : "Send EMI summary to your email"
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      variant="outline" 
                      className="flex-1 py-5 text-sm border-gray-300 hover:bg-gray-100 rounded-full"
                      onClick={generatePDF}
                      disabled={isPdfGenerating}
                    >
                      {isPdfGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calculator className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Ready to Calculate</h3>
                    <p className="text-gray-500">Enter your loan details and click "Calculate EMI" to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-30">
        <Button 
          onClick={calculateEMI}
          className="w-full bg-transparent hover:bg-gray-900 text-gray-900 hover:text-white py-5 text-base font-medium rounded-full border-2 border-gray-900 transition-all duration-300"
          disabled={calculateLoanAmount() <= 0}
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calculate EMI
        </Button>
      </div>

      <FooterRedesign />
    </div>
  );
};

export default EMICalculator;
