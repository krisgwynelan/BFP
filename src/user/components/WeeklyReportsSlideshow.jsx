import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function WeeklyReportsSlideshow({ reports }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!isAutoPlaying || reports.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % reports.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, reports.length]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reports.length) % reports.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reports.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (reports.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-12 text-center shadow-lg">
        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg">No weekly reports available</p>
      </div>
    );
  }

  const currentReport = reports[currentIndex];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Event': return 'from-blue-500 to-blue-600';
      case 'Training': return 'from-green-500 to-green-600';
      case 'Advisory': return 'from-yellow-500 to-yellow-600';
      case 'Achievement': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Event': return '🎯';
      case 'Training': return '📚';
      case 'Advisory': return '⚠️';
      case 'Achievement': return '🏆';
      default: return '📄';
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <div className="relative">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header with Wave Pattern */}
        <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">📰</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Weekly Updates</h2>
            </div>
            <p className="text-red-100 text-sm">Stay informed with the latest from BFP Station 1 Cogon</p>
          </div>
        </div>

        {/* Main Slideshow Area */}
        <div className="relative bg-gradient-to-br from-gray-50 to-white">
          <div className="relative h-[500px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                className="absolute inset-0 p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                  {/* Image Section */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                    <img
                      src={currentReport.coverImage}
                      alt={currentReport.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    
                    {/* Floating Category Badge */}
                    <div className={`absolute top-4 right-4 bg-gradient-to-r ${getCategoryColor(currentReport.category)} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm`}>
                      <span className="text-lg">{getCategoryIcon(currentReport.category)}</span>
                      <span className="font-semibold text-sm">{currentReport.category}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <motion.div
                        className="h-full bg-red-500"
                        initial={{ width: '0%' }}
                        animate={{ width: isAutoPlaying ? '100%' : '0%' }}
                        transition={{ duration: 10, ease: 'linear' }}
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col justify-center space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <Calendar size={16} />
                        <span>
                          {new Date(currentReport.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {currentReport.title}
                      </h3>
                      
                      <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full mb-6"></div>
                      
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {currentReport.description}
                      </p>
                    </div>

                    {/* Report Number Indicator */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                        <Tag size={16} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Report {currentIndex + 1} of {reports.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {reports.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-red-600 hover:text-white text-gray-800 p-3 rounded-full transition-all shadow-lg hover:shadow-xl z-10 group"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-red-600 hover:text-white text-gray-800 p-3 rounded-full transition-all shadow-lg hover:shadow-xl z-10 group"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Elegant Thumbnails Section */}
          {reports.length > 1 && (
            <div className="px-8 pb-8 pt-4">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {reports.map((report, index) => (
                  <button
                    key={report.id}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-300 ${
                      index === currentIndex
                        ? 'ring-4 ring-red-600 shadow-xl scale-110'
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="relative w-32 h-24">
                      <img
                        src={report.coverImage}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      
                      {/* Thumbnail Badge */}
                      <div className={`absolute bottom-1.5 left-1.5 right-1.5 bg-gradient-to-r ${getCategoryColor(report.category)} text-white px-2 py-1 rounded-md flex items-center justify-between`}>
                        <span className="text-xs font-semibold truncate">{report.category}</span>
                        <span className="text-xs">{getCategoryIcon(report.category)}</span>
                      </div>
                      
                      {/* Active Indicator */}
                      {index === currentIndex && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </motion.div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Decorative Bottom Wave */}
        <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      </div>
    </div>
  );
}
