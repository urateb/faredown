'use client';

import { useState, useEffect } from 'react';
import { Slideshow, SearchForm, Header, FlightResults, type FlightOffer } from './components';
import { slides } from './data/slides';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const hasResults = searchResults.length > 0;

  return (
    <main className={`relative min-h-screen font-sans flex flex-col overflow-hidden transition-colors duration-500 ${hasResults ? 'bg-[#f5f7f9] overflow-y-auto' : ''}`}>
      <Header darkLogo={hasResults} />

      {!hasResults && <Slideshow slides={slides} currentSlide={currentSlide} />}

      <div className={`relative z-10 flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 transition-all duration-700 ${hasResults ? 'justify-start pt-28' : 'justify-center'}`}>

        {!hasResults && (
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-5xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              Fly High, Pay Low
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              Please choose your destination below:
            </p>
          </div>
        )}

        <div className={`w-full max-w-6xl animate-slide-up animation-delay-200 relative z-50 transition-all duration-500 ${hasResults ? 'mt-0' : 'mt-4'}`}>
          <SearchForm onSearchResults={setSearchResults} variant={hasResults ? 'dark' : 'light'} />
        </div>

        {/* Results Section */}
        {hasResults && (
          <div className="w-full relative z-40">
            <FlightResults results={searchResults} />
          </div>
        )}

      </div>

      {!hasResults && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 transition-all duration-1000">
          <span className="text-white/90 font-medium text-sm tracking-wide">
            {slides[currentSlide].location}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'bg-white opacity-100 scale-125' : 'bg-white opacity-40'
                  }`}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
