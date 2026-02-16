import { useEffect, useState } from 'react';
import { RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers } from '../../utils/storage';

export function OfficersPage() {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    setOfficers(getOfficers());
  }, []);

  // Sort officers by rank hierarchy
  const rankHierarchy = [
    'Chief Fire Officer',
    'Chief Fire Inspector',
    'Senior Fire Inspector',
    'Fire Inspector',
    'Senior Fire Officer III',
    'Senior Fire Officer II',
    'Senior Fire Officer I',
    'Fire Officer III',
    'Fire Officer II',
    'Fire Officer I'
  ];

  const sortedOfficers = [...officers].sort((a, b) => {
    const rankA = rankHierarchy.indexOf(a.rank);
    const rankB = rankHierarchy.indexOf(b.rank);
    return rankA - rankB;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl text-center font-bold mb-2">Our Officers</h1>
          <p className="text-2xl text-center text-red-100">
            Meet the dedicated team of BFP Station 1 Cogon
          </p>
        </div>
      </section>

      {/* Officers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {sortedOfficers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No officers information available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedOfficers.map((officer) => (
              <div
                key={officer.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div className="p-6 text-center">
                  {/* Profile Image */}
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    <img
                      src={officer.profileImage}
                      alt={officer.fullName}
                      className="w-full h-full rounded-full object-cover border-4 border-red-100 group-hover:border-red-300 transition-colors"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {RANK_ABBREVIATIONS[officer.rank] || officer.rank}
                    </div>
                  </div>

                  {/* Officer Details */}
                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                    {officer.fullName}
                  </h3>
                  
                  <p className="text-sm text-red-600 font-semibold mb-3">
                    {officer.rank}
                  </p>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-gray-700 font-medium mb-3">
                      {officer.roleAssignment}
                    </p>
                    
                    {officer.contactNumber && (
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{officer.contactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Contact Our Officers</h3>
            <p className="text-gray-700">
              For official inquiries or emergency services, please contact our station directly at
              <span className="font-semibold text-red-600"> (088) 856-FIRE</span> or call the
              national emergency hotline at <span className="font-semibold text-red-600">911</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
