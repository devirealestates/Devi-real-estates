import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  const handleGetInTouch = () => {
    const phoneNumber = '919912991671'; // Without + and spaces
    const message = encodeURIComponent('Hi, I am interested in buying/renting a property. Can you help me?');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[400px] sm:h-[450px]">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Beautiful home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display leading-tight mb-6">
              Are you looking to buy
              <br />
              or rent a property?
            </h2>
            <button
              onClick={handleGetInTouch}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-300"
            >
              Get In Touch <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
