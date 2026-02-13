import React from 'react';
import { ArrowRight } from 'lucide-react';

const agents = [
  {
    name: 'Michael Rodriguez',
    role: 'Agent',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Andrew Johnson',
    role: 'Retailer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Esther Howard',
    role: 'Retailer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Bessie Cooper',
    role: 'Marketing Expert',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

const OurAgents: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-display">
            Our Agents
          </h2>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
            View All Agents <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
          {agents.map((agent, index) => (
            <div key={index} className="group cursor-pointer">
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurAgents;
