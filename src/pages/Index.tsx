import React from 'react';
import HeaderRedesign from '@/components/HeaderRedesign';
import HeroRedesign from '@/components/HeroRedesign';
import NewListings from '@/components/NewListings';
import AboutSection from '@/components/AboutSection';
import FeaturedListings from '@/components/FeaturedListings';
import PopularCities from '@/components/PopularCities';
import OurAgents from '@/components/OurAgents';
import Testimonials from '@/components/Testimonials';
import OurBlogs from '@/components/OurBlogs';
import CTASection from '@/components/CTASection';
import FooterRedesign from '@/components/FooterRedesign';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeaderRedesign />
      <HeroRedesign />
      <NewListings />
      <AboutSection />
      <FeaturedListings />
      <PopularCities />
      <OurAgents />
      <Testimonials />
      <OurBlogs />
      <CTASection />
      <FooterRedesign />
    </div>
  );
};

export default Index;
