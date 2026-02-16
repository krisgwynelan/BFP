import React, { useState, useEffect } from "react";
import { Target, Eye, ShieldCheck, FileText } from "lucide-react";

export function AboutPage() {
  const images = ["/Fire.jpg", "/Wall.jpg", "/Cogon.jpg", "/HELP.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">

        {/* 🔥 Top Section */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-20">

          {/* Text Side */}
          <div>
            <h2 className="md:text-3xl font-extrabold leading-tight text-gray-900 mb-6">
              STATION 1 COGON FIRE STATION - <br />
              <span className="text-red-600">BUREAU OF FIRE PROTECTION</span>
            </h2>

            <p className="text-gray-600 mb-5 text-lg">
              The Bureau of Fire Protection – Cagayan de Oro City is the primary
              government agency responsible for fire prevention, suppression,
              and auxiliary services.
            </p>

            <p className="text-gray-600 mb-5 text-lg">
              We serve residents, businesses, and institutions by providing
              24/7 emergency response and fire safety education.
            </p>

            <p className="text-gray-600 text-lg">
              Our dedicated team works tirelessly to prevent fires, respond to
              emergencies, and promote fire safety awareness throughout the city.
            </p>
          </div>

          {/* Slideshow Side */}
          <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-2xl group">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  currentIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
                } group-hover:scale-105 transform transition-transform duration-700`}
              />
            ))}

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? "bg-red-600 scale-125" : "bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 🛡 Who Are We */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="flex justify-center items-center gap-3 mb-4">
            <ShieldCheck className="w-9 h-9 text-red-600" />
            <h3 className="text-3xl font-bold text-gray-900">Who Are We</h3>
          </div>

          <p className="text-gray-600 text-lg mb-4">
            We are a team of highly trained and dedicated fire protection
            professionals committed to safeguarding lives and properties.
          </p>

          <p className="text-gray-600 text-lg">
            Our firefighters, rescue personnel, and administrative staff work
            around the clock to provide comprehensive fire protection services.
          </p>
        </div>

        {/* 🎯 Mission, Vision & Mandate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center hover:shadow-2xl transition">
            <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h4>
            <p className="text-gray-600 text-lg">
              To prevent and suppress destructive fires, investigate causes,
              enforce fire code, and provide emergency medical and rescue services.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center hover:shadow-2xl transition">
            <div className="bg-blue-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h4>
            <p className="text-gray-600 text-lg">
              A modern, professional fire service organization recognized
              for excellence in fire protection and emergency response.
            </p>
          </div>

          {/* Mandate */}
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center hover:shadow-2xl transition">
            <div className="bg-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Mandate</h4>
            <p className="text-gray-600 text-lg">
              Enforce Republic Act 9514 (Fire Code of the Philippines),
              prevent and suppress all destructive fires, and ensure public
              safety through fire prevention programs, inspections, and
              emergency response operations.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
