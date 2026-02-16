import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, AlertCircle } from 'lucide-react';
import { getContactInfo } from '../../utils/storage';

export function ContactPage() {
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    setContactInfo(getContactInfo());
  }, []);

  if (!contactInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
      {/* Hero Section with Animated Background */}
      <section className="relative bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white py-20 overflow-hidden">
        {/* Animated Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Phone className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
            <div className="w-24 h-1 bg-white mx-auto mb-4 rounded-full"></div>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              We're here to help 24/7. Reach out to us for emergencies or inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Hotline - Featured Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 mb-12">
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <Phone className="text-red-600 w-12 h-12" />
                  </div>
                </div>
                <div className="text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">Emergency Hotline</h2>
                  <p className="text-5xl md:text-6xl font-bold tracking-wider">{contactInfo.nationalEmergency}</p>
                  <p className="text-red-100 mt-2 text-lg">For immediate fire and rescue emergencies</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6" />
                  <span className="font-bold text-lg">Available 24/7</span>
                </div>
                <p className="text-sm text-red-100">
                  Our team is always ready to respond to your emergency calls
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards Grid - Modern Design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Local Hotline Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Hotline</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">{contactInfo.localHotline}</p>
              <p className="text-gray-600">Direct line to Station 1 Cogon</p>
            </div>
          </div>

          {/* Email Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Address</h3>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-green-600 hover:text-green-700 font-semibold break-all block mb-2"
              >
                {contactInfo.email}
              </a>
              <p className="text-gray-600">For general inquiries and concerns</p>
            </div>
          </div>

          {/* Facebook Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Facebook className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Facebook Page</h3>
              <a
                href={`https://${contactInfo.facebookPage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-semibold break-all block mb-2"
              >
                {contactInfo.facebookPage}
              </a>
              <p className="text-gray-600">Follow us for updates</p>
            </div>
          </div>

          {/* Location Card - Spans 2 columns */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 md:col-span-2">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Location</h3>
                  <p className="text-lg text-gray-700 mb-2">{contactInfo.location}</p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(contactInfo.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    <MapPin size={16} />
                    View on Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Office Hours Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Office Hours</h3>
              <p className="text-2xl font-bold text-teal-600 mb-2">{contactInfo.officeHours}</p>
              <p className="text-gray-600">We're always ready to respond</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fire Emergency Guide - Interactive Design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-red-600 p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <AlertCircle className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Fire Emergency Guide</h2>
                <p className="text-red-100">What to do in case of a fire emergency</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* If You Discover a Fire */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">🔥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">If You Discover a Fire:</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    'Activate the nearest fire alarm and alert others',
                    `Call ${contactInfo.nationalEmergency} or ${contactInfo.localHotline} immediately`,
                    'If safe to do so, use a fire extinguisher on small fires',
                    'Evacuate the building using the nearest safe exit',
                    'Never use elevators during a fire'
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-4 group">
                      <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed pt-2">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* During Evacuation */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">🚪</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">During Evacuation:</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    'Stay low to avoid smoke inhalation',
                    'Check doors for heat before opening',
                    'Close doors behind you to contain the fire',
                    'Proceed to the designated assembly point',
                    'Never re-enter the building until cleared by authorities'
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-4 group">
                      <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed pt-2">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
              <div className="relative bg-white/90 backdrop-blur-sm p-6 m-[2px] rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <AlertCircle className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-2">⚠️ Remember: Your safety is the top priority!</p>
                    <p className="text-gray-700">
                      Never risk your life to save property. Get out, stay out, and call for help.
                      Our firefighters are trained professionals who will handle the situation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
