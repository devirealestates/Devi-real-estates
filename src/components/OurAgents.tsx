import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Agent {
  id: string;
  name: string;
  role: string;
  image: string;
  description?: string;
}

// Individual agent card with flip animation
const AgentCard: React.FC<{
  agent: Agent;
  index: number;
}> = ({ agent, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`group cursor-pointer transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0 rotate-0' 
          : index % 2 === 0 
            ? 'opacity-0 -translate-x-8 -rotate-3' 
            : 'opacity-0 translate-x-8 rotate-3'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100">
        <img
          src={agent.image}
          alt={agent.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{agent.name}</h3>
      <p className="text-gray-500 text-sm">{agent.role}</p>
    </div>
  );
};

const OurAgents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates from the teamMembers collection
    const q = query(collection(db, 'teamMembers'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agent[];
      
      setAgents(agentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching agents:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading agents...</div>
          </div>
        </div>
      </section>
    );
  }

  if (agents.length === 0) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-display mb-12">
            Our Agents
          </h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">No agents available at the moment.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-display">
            Our Agents
          </h2>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-full text-xs sm:text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
            View All Agents <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
          {agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurAgents;
