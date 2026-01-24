'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import SearchForm from './components/SearchForm';
import FlightResults, { type FlightOffer } from './components/FlightResults';
import PriceChart from './components/PriceChart';
import FilterSidebar from './components/FilterSidebar';
import Slideshow from './components/Slideshow';
import Header from './components/Header';
import { slides } from './data/slides';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
  const [carrierNames, setCarrierNames] = useState<Record<string, string>>({});
  const [isInitialSearchDone, setIsInitialSearchDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Lifted state for filters
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [stops, setStops] = useState<'any' | 'direct' | '1' | '2+'>('any');
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);

  // Lifted state for search inputs (to persist values)
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (forcedParams?: any) => {
    const sOrigin = forcedParams?.origin || origin;
    const sDest = forcedParams?.dest || destination;
    const sDepDate = forcedParams?.depDate || departureDate;
    const sRetDate = forcedParams?.retDate || returnDate;
    const sTripType = forcedParams?.tripType || tripType;
    const sTravelers = forcedParams?.travelers || travelers;
    const sStops = forcedParams?.stops || stops;

    // Extract code from "City (CODE)" format if present
    const originCode = sOrigin.match(/\(([^)]+)\)/)?.[1] || sOrigin;
    const destinationCode = sDest.match(/\(([^)]+)\)/)?.[1] || sDest;

    if (!originCode || !destinationCode || !sDepDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (sTripType === 'roundtrip' && !sRetDate) {
      alert('Please select a return date');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        origin: originCode,
        destination: destinationCode,
        date: sDepDate,
        adults: sTravelers.toString(),
        nonStop: (sStops === 'direct').toString()
      });

      if (sTripType === 'roundtrip' && sRetDate) {
        params.append('returnDate', sRetDate);
      }

      const response = await fetch(`/api/search?${params}`);
      const result = await response.json();

      if (result.error) throw new Error(result.error);

      const data = result.data || [];
      const dictionaries = result.dictionaries || {};

      setSearchResults(Array.isArray(data) ? data : []);
      setCarrierNames(dictionaries.carriers || {});

      // Update URL
      updateUrl({
        origin: sOrigin,
        dest: sDest,
        depDate: sDepDate,
        retDate: sTripType === 'roundtrip' ? sRetDate : null,
        tripType: sTripType,
        stops: sStops,
        travelers: sTravelers.toString()
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize state from URL params and auto-search
  useEffect(() => {
    const pTripType = searchParams.get('tripType');
    const pStops = searchParams.get('stops');
    const pOrigin = searchParams.get('origin');
    const pDest = searchParams.get('dest');
    const pDepDate = searchParams.get('depDate');
    const pRetDate = searchParams.get('retDate');
    const pTravelers = searchParams.get('travelers');

    let shouldSearch = false;
    const params: any = {};

    if (pTripType === 'roundtrip' || pTripType === 'oneway') { setTripType(pTripType); params.tripType = pTripType; }
    if (pStops === 'any' || pStops === 'direct' || pStops === '1' || pStops === '2+') { setStops(pStops); params.stops = pStops; }
    if (pOrigin) { setOrigin(pOrigin); params.origin = pOrigin; }
    if (pDest) { setDestination(pDest); params.dest = pDest; }
    if (pDepDate) { setDepartureDate(pDepDate); params.depDate = pDepDate; shouldSearch = true; }
    if (pRetDate) { setReturnDate(pRetDate); params.retDate = pRetDate; }
    if (pTravelers) { setTravelers(parseInt(pTravelers)); params.travelers = parseInt(pTravelers); }

    if (shouldSearch && !isInitialSearchDone) {
      setIsInitialSearchDone(true);
      handleSearch(params);
    }
  }, []);

  // Sync state to URL helper
  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Update URL when sidebar filters change
  const handleTripTypeChange = (type: 'roundtrip' | 'oneway') => {
    setTripType(type);
    updateUrl({ tripType: type });
  };

  const handleStopsChange = (s: 'any' | 'direct' | '1' | '2+') => {
    setStops(s);
    updateUrl({ stops: s });
  };

  // Extract all unique carriers with their names
  const allCarriers = Array.from(new Set(
    searchResults.flatMap(offer =>
      offer.itineraries.flatMap(itinerary =>
        itinerary.segments.map(segment => segment.carrierCode)
      )
    )
  )).map(code => {
    const name = carrierNames[code] || code;
    return {
      code,
      name: name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Reset selected carriers when search results change
  useEffect(() => {
    if (allCarriers.length > 0) {
      setSelectedCarriers(allCarriers.map(c => c.code));
    }
  }, [searchResults]);

  const hasResults = searchResults.length > 0;

  // Filter results client-side
  const filteredResults = searchResults.filter((offer: FlightOffer) => {
    // Filter by stops
    const segmentCount = offer.itineraries[0].segments.length;
    let stopsMatch = true;
    if (stops === 'direct') stopsMatch = segmentCount === 1;
    else if (stops === '1') stopsMatch = segmentCount <= 2;
    else if (stops === '2+') stopsMatch = segmentCount > 2;

    // Filter by carrier
    const offerCarriers = offer.itineraries.flatMap(itinerary =>
      itinerary.segments.map(segment => segment.carrierCode)
    );
    const carrierMatch = selectedCarriers.length === 0 ||
      offerCarriers.some(code => selectedCarriers.includes(code));

    return stopsMatch && carrierMatch;
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
              onSearchTriggered={handleSearch}
              isLoading={isLoading}
              origin={origin} setOrigin={setOrigin}
              destination={destination} setDestination={setDestination}
              departureDate={departureDate} setDepartureDate={setDepartureDate}
              returnDate={returnDate} setReturnDate={setReturnDate}
              tripType={tripType} setTripType={handleTripTypeChange}
              stops={stops} setStops={handleStopsChange}
              travelers={travelers} setTravelers={setTravelers}
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
                onSearchTriggered={handleSearch}
                isLoading={isLoading}
                variant="dark"
                layout="horizontal"
                hideFilters={true}

                // Controlled State
                tripType={tripType} setTripType={handleTripTypeChange}
                stops={stops} setStops={handleStopsChange}

                origin={origin} setOrigin={setOrigin}
                destination={destination} setDestination={setDestination}
                departureDate={departureDate} setDepartureDate={setDepartureDate}
                returnDate={returnDate} setReturnDate={setReturnDate}
                travelers={travelers} setTravelers={setTravelers}
              />
            </div>

            <div className="w-full h-full max-w-7xl mx-auto flex justify-center items-start gap-8 pt-8 px-6 overflow-hidden">

              {/* Left Column: Filters (Transparent) */}
              <div className="w-56 h-full overflow-y-auto z-40 shrink-0 mt-13">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Filters:</h2>
                <FilterSidebar
                  tripType={tripType}
                  setTripType={handleTripTypeChange}
                  stops={stops}
                  setStops={handleStopsChange}
                  carriers={allCarriers}
                  selectedCarriers={selectedCarriers}
                  setSelectedCarriers={setSelectedCarriers}
                />
              </div>

              {/* Middle Column: Results */}
              <div className="flex-1 h-full overflow-y-auto px-2 pb-20 no-scrollbar">
                <FlightResults results={filteredResults} carrierNames={carrierNames} />
              </div>

              {/* Right Column: Chart (Transparent) */}
              <div className="w-72 h-full overflow-y-auto z-40 shrink-0 mt-13">
                <h2 className="text-lg font-bold text-gray-900 mb-6 px-4">Price Trends:</h2>
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
