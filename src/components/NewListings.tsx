import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const newListings = [
  {
    id: 1,
    name: 'Serenity Haven',
    price: '₹ 30,00,000',
    location: 'Kakinada',
    area: '2500 Sq.Ft',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Riverside Villa',
    price: '₹ 45,00,000',
    location: 'Rajahmundry',
    area: '2500 Sq.Ft',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Serene Suburban',
    price: '₹ 22,00,000',
    location: 'Visakhapatnam',
    area: '1800 Sq.Ft',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const NewListings: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isCardsVisible, setIsCardsVisible] = useState(false);

  useEffect(() => {
    const headerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsHeaderVisible(true);
        headerObserver.disconnect();
      }
    }, { threshold: 0.1 });

    const cardsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsCardsVisible(true);
        cardsObserver.disconnect();
      }
    }, { threshold: 0.05 });

    if (sectionRef.current) {
      headerObserver.observe(sectionRef.current);
    }
    if (cardsRef.current) {
      cardsObserver.observe(cardsRef.current);
    }

    return () => {
      headerObserver.disconnect();
      cardsObserver.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-white">
      {/* Typewriter animation styles */}
      <style>{`
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #1f2937; }
        }
        .typewriter-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #1f2937;
          width: 0;
        }
        .typewriter-text.animate {
          animation: 
            typewriter 1.5s steps(12, end) forwards,
            blink-caret 0.75s step-end infinite;
        }
        @keyframes revealUp {
          from { 
            clip-path: inset(100% 0 0 0);
            transform: translateY(30px);
          }
          to { 
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
          }
        }
        .card-reveal {
          clip-path: inset(100% 0 0 0);
          transform: translateY(30px);
        }
        .card-reveal.animate {
          animation: revealUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .text-reveal {
          clip-path: inset(100% 0 0 0);
          transform: translateY(20px);
        }
        .text-reveal.animate {
          animation: revealUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-16">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 font-display tracking-tight">
            <span className={`typewriter-text ${isHeaderVisible ? 'animate' : ''}`}>
              New Listings
            </span>
          </h2>
          <div className="max-w-lg">
            <p 
              className={`text-gray-500 text-lg leading-relaxed mb-6 text-reveal ${isHeaderVisible ? 'animate' : ''}`}
              style={{ animationDelay: '1s' }}
            >
              From chic urban apartments to serene countryside retreats.<br />
              Start your search today and find the perfect place to call home.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className={`inline-flex items-center gap-2 px-8 py-3.5 border border-orange-500 text-orange-500 rounded-full text-base font-medium hover:bg-orange-500 hover:text-white transition-colors duration-300 text-reveal ${isHeaderVisible ? 'animate' : ''}`}
              style={{ animationDelay: '1.2s' }}
            >
              Explore All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards Section */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {newListings.map((listing, index) => (
            <div
              key={listing.id}
              className={`group cursor-pointer card-reveal ${isCardsVisible ? 'animate' : ''}`}
              onClick={() => navigate('/buy')}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{listing.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {listing.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{listing.price}</p>
                  <p className="text-gray-500 text-sm mt-1">{listing.area}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewListings;
