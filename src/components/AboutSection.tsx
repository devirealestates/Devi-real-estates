import React, { useEffect, useRef, useState } from 'react';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isMissionVisible, setIsMissionVisible] = useState(false);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);

  useEffect(() => {
    const missionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsMissionVisible(true);
        missionObserver.disconnect();
      }
    }, { threshold: 0.1 });

    const featuresObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsFeaturesVisible(true);
        featuresObserver.disconnect();
      }
    }, { threshold: 0.1 });

    if (sectionRef.current) {
      missionObserver.observe(sectionRef.current);
    }
    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }

    return () => {
      missionObserver.disconnect();
      featuresObserver.disconnect();
    };
  }, []);

  const features = [
    {
      title: 'Affordable Price',
      description: 'Offering competitive rates that make quality accessible to all.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" stroke="white" strokeWidth="1.5" fill="none"/>
          <text x="24" y="29" textAnchor="middle" fill="white" fontSize="16" fontWeight="300">$</text>
          <circle cx="38" cy="38" r="8" fill="#f97316"/>
        </svg>
      ),
    },
    {
      title: 'Clear Legality',
      description: 'Ensuring transparent and compliant legal processes.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 6L30 12H36V18L42 24L36 30V36H30L24 42L18 36H12V30L6 24L12 18V12H18L24 6Z" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M20 24L23 27L28 20" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: 'Experienced Agents',
      description: 'Guided by professionals with expertise in the industry.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="16" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
          <circle cx="34" cy="16" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
          <circle cx="24" cy="34" r="6" fill="#f97316"/>
          <line x1="14" y1="21" x2="24" y2="28" stroke="white" strokeWidth="1.5" strokeDasharray="2 2"/>
          <line x1="34" y1="21" x2="24" y2="28" stroke="white" strokeWidth="1.5" strokeDasharray="2 2"/>
        </svg>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="bg-gray-950 text-white">
      {/* Animation styles */}
      <style>{`
        @keyframes aboutRevealUp {
          from { 
            clip-path: inset(100% 0 0 0);
            transform: translateY(30px);
          }
          to { 
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
          }
        }
        .about-reveal {
          clip-path: inset(100% 0 0 0);
          transform: translateY(30px);
        }
        .about-reveal.animate {
          animation: aboutRevealUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          <div className="lg:w-1/5">
            <p 
              className={`text-white text-base font-medium about-reveal ${isMissionVisible ? 'animate' : ''}`}
            >
              About us
            </p>
          </div>
          <div className="lg:w-4/5">
            <h2 
              className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light italic leading-tight font-display about-reveal ${isMissionVisible ? 'animate' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              Our mission is simple, to provide unparalleled expertise, guidance, and support to our clients across their real estate journey.
            </h2>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-gray-800">
        <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-16">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-5 about-reveal ${isFeaturesVisible ? 'animate' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-base leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
