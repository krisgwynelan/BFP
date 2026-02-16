import { Link } from 'react-router';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">BFP CDO</h3>
            <p className="text-sm mb-4">
              Bureau of Fire Protection - Cagayan de Oro City. Committed to protecting our
              community through fire prevention, suppression, and emergency services.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/BFPCagayanDeOro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/officers" className="hover:text-white transition-colors">Officers</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Emergency Contacts</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <div>
                  <div className="font-semibold text-white">National Emergency</div>
                  <div>911</div>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <div>
                  <div className="font-semibold text-white">Local Hotline</div>
                  <div>(088) 856-FIRE</div>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <div>bfp.station1.cogon@bfp.gov.ph</div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <div>Capt. Vicente Roa, Brgy. 33, Cagayan de Oro City</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Bureau of Fire Protection - Cagayan de Oro City. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
