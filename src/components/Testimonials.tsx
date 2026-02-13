import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      '"Devi Real Estates has been an invaluable partner in our search for the perfect commercial space. Their team is incredibly knowledgeable and dedicated, making the entire process seamless and stress-free."',
    name: 'Ravi Kumar',
    title: 'CEO, Tech Innovations Inc.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
  {
    quote:
      '"The professionalism and expertise of Devi Real Estates made finding our dream home an absolute joy. They understood exactly what we were looking for and delivered beyond our expectations."',
    name: 'Priya Sharma',
    title: 'Business Owner',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
  {
    quote:
      '"I was impressed by how quickly and efficiently the team at Devi Real Estates found the perfect investment property for me. Their market knowledge is unmatched."',
    name: 'Anil Reddy',
    title: 'Real Estate Investor',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
];

const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const testimonial = testimonials[current];

  return (
    <section className="bg-orange-500 text-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Testimonials
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="max-w-4xl transition-opacity duration-500">
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium leading-relaxed mb-10 font-display">
            {testimonial.quote}
          </p>
          <div className="flex items-center gap-4">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
            />
            <div>
              <p className="font-semibold text-base">{testimonial.name}</p>
              <p className="text-white/80 text-sm">{testimonial.title}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
