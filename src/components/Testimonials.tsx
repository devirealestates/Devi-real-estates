import React, { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll every 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
        setIsAnimating(false);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      setIsAnimating(false);
    }, 300);
  };

  const testimonial = testimonials[current];

  return (
    <section 
      ref={sectionRef}
      className="bg-orange-500 text-white py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`flex items-center justify-between mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
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
        <div 
          className={`max-w-4xl transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <p 
            className={`text-xl sm:text-2xl lg:text-3xl font-medium leading-relaxed mb-10 font-display transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
            }`}
          >
            {testimonial.quote}
          </p>
          <div 
            className={`flex items-center gap-4 transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
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

        {/* Progress Indicators */}
        <div 
          className={`flex gap-2 mt-8 transition-all duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrent(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current 
                  ? 'w-8 bg-white' 
                  : 'w-4 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
