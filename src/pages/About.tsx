import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeaderRedesign from '@/components/HeaderRedesign';
import FooterRedesign from '@/components/FooterRedesign';
import { ArrowRight, DollarSign, Star, Users, Scale, Award, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

const About = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSections, setVisibleSections] = useState<boolean[]>([false, false, false, false, false, false, false]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections(prev => {
                const newArr = [...prev];
                newArr[index] = true;
                return newArr;
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const collectionRef = collection(db, 'teamMembers');
      const querySnapshot = await getDocs(collectionRef);
      const teamData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          role: data.role || 'Team Member',
          description: data.description || '',
          image: data.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400'
        };
      }) as TeamMember[];
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { value: '48+', label: 'Our core team spread all over the world.' },
    { value: '436+', label: 'Projects We Completed daily like to us.' },
    { value: '12+', label: 'District/Cities represented in to sit agency.' },
  ];

  const values = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Affordable Price',
      description: 'Offering competitive rates that make quality accessible to all.',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Innovative Excellence',
      description: 'Inspiring change with creative solutions and a passion for excellence.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Quality Crafts',
      description: 'Exceptional craftsmanship and attention to detail in every creation.',
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'Clear Legality',
      description: 'Ensuring transparency and compliance in all legal matters.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Experienced Agents',
      description: 'Skilled professionals delivering expert guidance and support.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Honest Opinion',
      description: 'Transparent and sincere perspectives you can trust.',
    },
  ];

  const agents = teamMembers.length > 0 ? teamMembers.slice(0, 4) : [
    { id: '1', name: 'Michael Rodriguez', role: 'Agent', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' },
    { id: '2', name: 'Andrew Johnson', role: 'Broker', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400' },
    { id: '3', name: 'Esther Howard', role: 'Broker', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400' },
    { id: '4', name: 'Bessie Cooper', role: 'Marketing Expert', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400' },
  ];

  const jobs = [
    { title: 'Real Estate Broker', type: 'Full Time', location: 'Remote', salary: '$200-40K' },
    { title: 'Property Manager', type: 'Part Time', location: 'Remote', salary: '$20K-35K' },
    { title: 'Realtor Agent', type: 'Part Time', location: 'Remote', salary: '$20K-40K' },
    { title: 'Operations Manager', type: 'Full Time', location: 'In House', salary: '$20K-40K' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes aboutReveal {
          from { 
            clip-path: inset(100% 0 0 0);
            transform: translateY(30px);
            opacity: 0;
          }
          to { 
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
            opacity: 1;
          }
        }
        .about-reveal {
          opacity: 0;
          clip-path: inset(100% 0 0 0);
          transform: translateY(30px);
        }
        .about-reveal.visible {
          animation: aboutReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <HeaderRedesign />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2070" 
            alt="About Us" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <p className="text-gray-300 text-sm mb-4">Home / About</p>
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            About Us
          </h1>
        </div>
      </section>

      {/* Welcome Section */}
      <section 
        ref={el => sectionRefs.current[0] = el}
        className="py-16 sm:py-20 lg:py-24 bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-8 leading-tight about-reveal ${visibleSections[0] ? 'visible' : ''}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Welcome to Devi Real Estates! As a design, build, and development firm, our goal is to shape communities that enrich, fortify the surrounding neighborhoods
          </h2>
          <button 
            onClick={() => navigate('/buy')}
            className={`inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-all duration-300 about-reveal ${visibleSections[0] ? 'visible' : ''}`}
            style={{ animationDelay: '0.2s' }}
          >
            Explore All Properties <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <p className="text-gray-500 text-sm font-medium">In Numbers</p>
            <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <p className="text-4xl sm:text-5xl font-light text-orange-500 mb-2">{stat.value}</p>
                  <p className="text-gray-500 text-sm max-w-[200px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section 
        ref={el => sectionRefs.current[1] = el}
        className="relative py-20 lg:py-32 bg-gray-900 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className={`about-reveal ${visibleSections[1] ? 'visible' : ''}`}>
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Our Mission:<br />Building the Future
              </h2>
            </div>
            <div 
              className={`text-gray-400 text-sm leading-relaxed about-reveal ${visibleSections[1] ? 'visible' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              <p className="mb-4">
                At Devi Real Estates, our mission is clear: to redefine the landscape of real estate by creating vibrant communities that inspire and endure. We're not just building structures; we're shaping the future with thoughtful designs that meet the needs of today while shaping the future of living.
              </p>
            </div>
          </div>
        </div>
        <div 
          className={`absolute bottom-0 right-0 w-full lg:w-1/2 h-64 lg:h-full about-reveal ${visibleSections[1] ? 'visible' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800" 
            alt="Mission" 
            className="w-full h-full object-cover object-center lg:object-right opacity-30 lg:opacity-100"
          />
        </div>
      </section>

      {/* Values Section */}
      <section 
        ref={el => sectionRefs.current[2] = el}
        className="py-16 sm:py-20 lg:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 text-center mb-16 about-reveal ${visibleSections[2] ? 'visible' : ''}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            The Values That Drive<br />Everything We Do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`text-center about-reveal ${visibleSections[2] ? 'visible' : ''}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CEO's Words Section */}
      <section 
        ref={el => sectionRefs.current[3] = el}
        className="py-16 sm:py-20 lg:py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div 
              className={`about-reveal ${visibleSections[3] ? 'visible' : ''}`}
            >
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600" 
                alt="CEO" 
                className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl shadow-lg"
              />
            </div>
            <div 
              className={`about-reveal ${visibleSections[3] ? 'visible' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              <h2 
                className="text-3xl sm:text-4xl font-medium text-gray-900 mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                CEO's Words
              </h2>
              <p className="text-gray-600 font-medium mb-4">Dear Devi Real Estates Community,</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                It is with great pride and dedication that I lead our team at Devi Real Estates.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Every decision we make, every project we undertake, is guided by our commitment to excellence, innovation, and sustainability. We strive to create spaces that inspire, uplift, and stand the test of time.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Thank you for entrusting us with your dreams and aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Agents Section */}
      <section 
        ref={el => sectionRefs.current[4] = el}
        className="py-16 sm:py-20 lg:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 
              className={`text-3xl sm:text-4xl font-medium text-gray-900 about-reveal ${visibleSections[4] ? 'visible' : ''}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Our Agents
            </h2>
            <button 
              onClick={() => navigate('/contact')}
              className={`inline-flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors about-reveal ${visibleSections[4] ? 'visible' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              View All Agents <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {(loading ? Array(4).fill(null) : agents).map((agent, index) => (
              <div 
                key={agent?.id || index}
                className={`about-reveal ${visibleSections[4] ? 'visible' : ''}`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {loading ? (
                  <div className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                      <img 
                        src={agent.image} 
                        alt={agent.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
                    <p className="text-gray-500 text-sm">{agent.role}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Section */}
      <section 
        ref={el => sectionRefs.current[5] = el}
        className="py-16 sm:py-20 lg:py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <p className="text-orange-500 text-sm font-medium mb-4">Career</p>
              <h2 
                className={`text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 leading-tight about-reveal ${visibleSections[5] ? 'visible' : ''}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Discover Your Career Path at Devi Real Estates
              </h2>
            </div>
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 transition-colors about-reveal ${visibleSections[5] ? 'visible' : ''}`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-gray-500 text-sm">{job.type} • {job.location} • {job.salary}</p>
                    </div>
                    <button className="inline-flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors">
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={el => sectionRefs.current[6] = el}
        className="relative py-20 lg:py-32 overflow-hidden"
      >
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            alt="Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight about-reveal ${visibleSections[6] ? 'visible' : ''}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Are you looking to buy<br />or rent a property?
          </h2>
          <button 
            onClick={() => navigate('/contact')}
            className={`inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-full text-sm font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 about-reveal ${visibleSections[6] ? 'visible' : ''}`}
            style={{ animationDelay: '0.2s' }}
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <FooterRedesign />
    </div>
  );
};

export default About;
