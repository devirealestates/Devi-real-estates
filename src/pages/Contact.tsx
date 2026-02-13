import React, { useState } from 'react';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create WhatsApp message
    const whatsappMessage = `Hi, I would like to inquire about a property on your website.
    
Name: ${formData.name}
Email: ${formData.email}
Message: ${formData.message}`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/918985816481?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderRedesign />
      
      {/* Hero Section - 80% viewport height */}
      <section className="relative h-[80vh] min-h-[500px] flex items-end pb-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075" 
            alt="Luxury Modern Home" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 
            className="text-6xl sm:text-7xl lg:text-8xl font-medium text-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Contact Us
          </h1>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Left Side Label */}
          <div className="mb-12">
            <h3 
              className="text-xl font-medium text-gray-600"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Contact
            </h3>
          </div>

          {/* Form Section */}
          <div>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-12 text-center"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Question not answered yet?<br />We are here to help!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 px-0 py-3 text-gray-900 placeholder-gray-400 transition-colors"
                  style={{ outline: 'none' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 px-0 py-3 text-gray-900 placeholder-gray-400 transition-colors"
                  style={{ outline: 'none' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 px-0 py-3 text-gray-900 placeholder-gray-400 resize-none transition-colors"
                  style={{ outline: 'none' }}
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            alt="Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Are you looking to buy<br />or rent a property?
          </h2>
          <button 
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full text-sm font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <FooterRedesign />
    </div>
  );
};

export default Contact;
