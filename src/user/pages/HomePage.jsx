import { Link } from 'react-router';
import { WeeklyReportsSlideshow } from '../components/WeeklyReportsSlideshow';
import { getWeeklyReports } from '../../utils/storage';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import Fire from '/Fire.jpg'; // Local hero image

export function HomePage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(getWeeklyReports());
  }, []);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative h-screen flex items-center overflow-visible">
        {/* Background Image */}
        <img
          src={Fire}
          alt="Fire Station"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

        {/* Left Corner Content */}
        <div className="relative z-10 container mx-auto px-2 flex h-full items-start">
          <div className="max-w-4xl text-white space-y-6 mt-50">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
              <span className="text-lg font-semibold drop-shadow-lg">
                Protecting Our Community
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-2xl">
              BFP - STATION 1 <br />
              COGON FIRE STATION
            </h2>

            <h3 className="text-xl md:text-2xl font-light drop-shadow-lg">
              Capt. Vicente Roa, Brgy. 33, Cagayan De Oro City
            </h3>

            <p className="text-lg md:text-xl text-gray-200 drop-shadow-lg max-w-3xl">
              Committed to preventing and suppressing destructive fires,
              safeguarding lives and properties, and promoting fire safety
              awareness throughout Northern Mindanao.
            </p>

            <div className="pt-4">
              <Link
                to="/about"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform hover:scale-105"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WEEKLY UPDATES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <WeeklyReportsSlideshow reports={reports} />
      </section>

      {/* ================= QUICK INFO ================= */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Fire Prevention</h3>
              <p className="text-gray-600">
                Proactive measures to prevent fires and protect our community
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">24/7 Response</h3>
              <p className="text-gray-600">
                Round-the-clock emergency response services for all fire incidents
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Fire Safety Education</h3>
              <p className="text-gray-600">
                Training and awareness programs for schools and communities
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
