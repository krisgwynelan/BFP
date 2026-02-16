import { Link, useLocation } from 'react-router';
import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import Logo from '/BFP-LOGO.png'; // Your local logo path

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/officers', label: 'Officers' },
    { path: '/contact', label: 'Contact Us' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Emergency Hotline Top Bar */}
      <div className="bg-red-700 text-white flex items-center justify-center py-1 px-4 text-sm sm:text-base">
        <Phone size={16} className="mr-2" />
        Emergency Hotline: <span className="font-bold ml-1">911</span>
      </div>

      {/* Main Header */}
      <div className="bg-white text-black">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:py-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4">
              <img
                src={Logo}
                alt="BFP Logo"
                className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-full border-2 border-red-700"
              />
              <div>
                <h1 className="font-bold text-lg md:text-xl">BFP Station 1 Cogon</h1>
                <p className="text-xs md:text-sm text-gray-600">Bureau of Fire Protection</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isActive(link.path)
                      ? 'bg-red-700 text-white font-semibold'
                      : 'text-red-700 hover:bg-red-100 hover:text-red-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-red-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-md transition-colors ${
                    isActive(link.path)
                      ? 'bg-red-700 text-white font-semibold'
                      : 'text-red-700 hover:bg-red-100 hover:text-red-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
