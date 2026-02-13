import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const featuredListings = [
  {
    id: 1,
    name: 'Serenity Haven',
    description:
      'Discover Serenity Haven, a secluded retreat with 4 bedrooms, 3 bathrooms, and 2,500 square feet of luxurious living space nestled in a serene forest setting.',
    price: '₹ 30,00,000',
    period: '/Monthly',
    image:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Riverside Villa',
    description:
      'Experience tranquility at Riverside Villa, offering 2500 square feet of living space. This charming home includes 3 bedrooms and 2 bathrooms, perfect for comfortable living.',
    price: '₹ 45,00,000',
    period: '/Monthly',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Serene Suburban',
    description:
      'Situated in a tranquil suburban area, this home features a generous 1800 square feet of living space, including 3 bedrooms and 2 bathrooms.',
    price: '₹ 22,00,000',
    period: '/Monthly',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const FeaturedListings: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white" ref={sectionRef}>
      <style>{`
        @keyframes featuredTypewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes featuredBlinkCaret {
          from, to { border-color: transparent; }
          50% { border-color: #1f2937; }
        }
        @keyframes featuredRevealUp {
          0% {
            clip-path: inset(100% 0 0 0);
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
            opacity: 1;
          }
        }
        .featured-typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #1f2937;
          width: 0;
        }
        .featured-typewriter.visible {
          animation: 
            featuredTypewriter 1.5s steps(17, end) forwards,
            featuredBlinkCaret 0.75s step-end infinite;
        }
        .featured-reveal {
          opacity: 0;
          clip-path: inset(100% 0 0 0);
          transform: translateY(20px);
        }
        .featured-reveal.visible {
          animation: featuredRevealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h2 
          className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 mb-12 featured-typewriter ${isVisible ? 'visible' : ''}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Featured Listings
        </h2>

        {/* Listings */}
        <div className="space-y-8">
          {featuredListings.map((listing, index) => (
            <div 
              key={listing.id}
              className={`featured-reveal ${isVisible ? 'visible' : ''}`}
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              <div
                className="flex flex-col md:flex-row gap-6 lg:gap-10 cursor-pointer group"
                onClick={() => navigate('/buy')}
              >
                {/* Image */}
                <div className="md:w-2/5 overflow-hidden rounded-2xl aspect-[4/3] md:aspect-auto md:h-64 flex-shrink-0">
                  <img
                    src={listing.image}
                    alt={listing.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-display">
                    {listing.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg">
                    {listing.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {listing.price}
                    </span>
                    <span className="text-gray-400 text-sm">{listing.period}</span>
                  </div>
                </div>
              </div>
              {/* Divider */}
              {index < featuredListings.length - 1 && (
                <hr className="my-8 border-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Explore Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate('/buy')}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            Explore All Properties <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
