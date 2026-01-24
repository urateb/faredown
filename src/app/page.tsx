'use client';

import { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import FlightResults, { type FlightOffer } from './components/FlightResults';
import PriceChart from './components/PriceChart';
import FilterSidebar from './components/FilterSidebar';
import Slideshow from './components/Slideshow';
import Header from './components/Header'; // Re-added Header as it was used in the original code
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

  // Lifted state for filters
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [stops, setStops] = useState<'any' | 'direct' | '1' | '2+'>('any');

  // Lifted state for search inputs (to persist values)
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Filter results client-side based on stops
  const filteredResults = searchResults.filter(offer => {
    const segmentCount = offer.itineraries[0].segments.length;
    if (stops === 'direct') return segmentCount === 1;
    if (stops === '1') return segmentCount <= 2; // Assuming 1 stop means 2 segments
    if (stops === '2+') return segmentCount > 2;
    return true; // 'any'
  });

  return (
    <main className={`relative min-h-screen font-sans flex flex-col overflow-hidden transition-colors duration-500 ${hasResults ? 'bg-[#f5f7f9] overflow-hidden' : ''}`}>
      <Header darkLogo={hasResults} />

      {!hasResults && <Slideshow slides={slides} currentSlide={currentSlide} />}

      <div className={`relative z-10 flex-1 flex flex-col items-center w-full transition-all duration-700 ${hasResults ? 'h-[calc(100vh-80px)] overflow-hidden' : 'justify-center px-4 sm:px-6 lg:px-8'}`}>

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

        {!hasResults && (
          <div className="w-full max-w-6xl animate-slide-up animation-delay-200 relative z-50 mt-4">
            <SearchForm
              onSearchResults={setSearchResults}
              // Pass controlled state even on home to keep in sync if we navigated back/forth (though currently separate views)
              // For now, simpler to leave uncontrolled on home or sync it. 
              // Let's pass it to ensure consistency if we switch back to results mode logic.
              origin={origin} setOrigin={setOrigin}
              destination={destination} setDestination={setDestination}
              departureDate={departureDate} setDepartureDate={setDepartureDate}
              returnDate={returnDate} setReturnDate={setReturnDate}
              tripType={tripType} setTripType={setTripType}
              stops={stops} setStops={setStops}
            />
          </div>
        )}

        {/* Results Layout: 3 Columns */}
        {hasResults && (
          <>
            {/* Top Search Pill (Inputs Only) */}
            <div className="w-full max-w-6xl z-50 mt-4 px-6 animate-fade-in-down">
              <SearchForm
                onSearchResults={setSearchResults}
                variant="dark"
                layout="horizontal"
                hideFilters={true}

                // Controlled State
                tripType={tripType} setTripType={setTripType}
                stops={stops} setStops={setStops} // This ensures the form knows the filter state if it needs to use it for API params

                origin={origin} setOrigin={setOrigin}
                destination={destination} setDestination={setDestination}
                departureDate={departureDate} setDepartureDate={setDepartureDate}
                returnDate={returnDate} setReturnDate={setReturnDate}
              />
            </div>

            <div className="w-full flex-1 grid grid-cols-12 gap-0 pt-8 min-h-0">

              {/* Left Column: Filters (Transparent) */}
              <div className="col-span-2 h-full pl-8 pr-4 pt-4 overflow-y-auto z-40">
                <h2 className="text-lg font-bold text-gray-900 mb-6 px-1">Filters</h2>
                <FilterSidebar
                  tripType={tripType}
                  setTripType={setTripType}
                  stops={stops}
                  setStops={setStops}
                />
              </div>

              {/* Middle Column: Results */}
              <div className="col-span-7 h-full overflow-y-auto px-4 pb-20 no-scrollbar">
                <FlightResults results={filteredResults} />
              </div>

              {/* Right Column: Chart (Transparent) */}
              <div className="col-span-3 h-full pr-8 pl-4 pt-4 overflow-y-auto z-40">
                <h2 className="text-lg font-bold text-gray-900 mb-6 px-4">Price Trends</h2>
                <PriceChart results={filteredResults} />
              </div>
            </div>
          </>
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
