import React from 'react';
import { ArrowRight } from 'lucide-react';

const FooterRedesign: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/dre-logo.png" 
                alt="Devi Real Estates Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Devi Real Estates dedicated to revolutionizing the real estate experience. Through innovation and excellence.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mb-5">
              <a href="https://www.facebook.com/share/16ovnVhmA8/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/mananivasampvt" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Pages</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Home</a></li>
              <li><a href="/about" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="/buy" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Properties</a></li>
              <li><a href="/contact" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Contact</a></li>
              <li><a href="/privacy-policy" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Privacy</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Property Types</h4>
            <ul className="space-y-3">
              <li><a href="/buy" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Houses for Sale</a></li>
              <li><a href="/buy" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Flats for Sale</a></li>
              <li><a href="/rent" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Houses for Rent</a></li>
              <li><a href="/commercial" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Commercial</a></li>
              <li><a href="/land" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Land</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="text-gray-500 text-sm">+91 99129 91671</li>
              <li className="text-gray-500 text-sm">info.devirealestates@gmail.com</li>
              <li className="text-gray-500 text-sm leading-relaxed">
                Geetha paatashala road, Thimmapuram
                <br />
                Kakinada, Andhra Pradesh
                <br />
                533005
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-20 md:pb-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 text-sm">
              © All rights reserved. Devi Real Estates.
            </p>
            <p className="text-gray-400 text-sm">
              Powered by Devi Real Estates.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterRedesign;
