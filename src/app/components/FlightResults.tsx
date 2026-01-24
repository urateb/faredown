import { useState, useEffect } from 'react';
import PriceChart from './PriceChart';

export interface FlightOffer {
    id: string;
    price: {
        total: string;
        currency: string;
    };
    itineraries: {
        duration: string;
        segments: {
            departure: {
                iataCode: string;
                at: string;
            };
            arrival: {
                iataCode: string;
                at: string;
            };
            carrierCode: string;
            number: string;
            numberOfStops: number;
        }[];
    }[];
}

interface FlightResultsProps {
    results: FlightOffer[];
}

export default function FlightResults({ results }: FlightResultsProps) {
    if (!results || results.length === 0) {
        return null;
    }

    // Helper to format duration like PT2H30M -> 2h 30m
    const formatDuration = (duration: string) => {
        return duration.replace('PT', '').toLowerCase();
    };

    // Helper to format date
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const [visibleCount, setVisibleCount] = useState(6);

    // Reset visible count when results change
    useEffect(() => {
        setVisibleCount(6);
    }, [results]);

    const visibleResults = results.slice(0, visibleCount);
    const hasMore = visibleCount < results.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-0 animate-slide-up pb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 drop-shadow-sm">
                Found {results.length} Flights:
            </h2>
            <div className="grid gap-4">
                {visibleResults.map((offer) => {
                    return (
                        <div
                            key={offer.id}
                            className="bg-white rounded-lg flex border-gray-200 border shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            {/* Left Section: Information */}
                            <div className="flex-grow p-4 sm:p-5 flex flex-col gap-4">
                                {offer.itineraries.map((itinerary, index) => {
                                    const firstSegment = itinerary.segments[0];
                                    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
                                    const isOutbound = index === 0;

                                    return (
                                        <div key={index} className="relative">
                                            {/* Label (Outbound/Inbound) */}
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                                    {isOutbound ? 'Outbound' : 'Inbound'}
                                                </span>
                                                {/* Pin icon placeholder */}
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                            </div>

                                            {/* Flight Row */}
                                            <div className="flex items-center justify-between gap-2 sm:gap-6">
                                                {/* Departure */}
                                                <div className="flex flex-col min-w-[50px]">
                                                    <span className="text-xl font-bold text-slate-900 leading-tight">{formatTime(firstSegment.departure.at)}</span>
                                                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{firstSegment.departure.iataCode}</span>
                                                </div>

                                                {/* Visual Path */}
                                                <div className="flex-grow flex flex-col items-center">
                                                    <div className="flex items-center justify-center gap-2 mb-0.5">
                                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                            {formatDuration(itinerary.duration)}
                                                        </span>
                                                        <div className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                                                            {/* Carrier logo placeholder */}
                                                            <div className="flex flex-col items-center leading-[0.5]">
                                                                <span className="text-[6px] font-black italic text-sky-800">{firstSegment.carrierCode}</span>
                                                                <div className="w-3 h-[1px] bg-sky-200 mt-0.5"></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative w-full flex items-center">
                                                        <div className="h-[1px] flex-grow bg-slate-200"></div>
                                                        <div className="h-[1px] flex-grow bg-slate-200"></div>
                                                    </div>

                                                    <span className="text-[11px] font-bold text-slate-500 mt-0.5">
                                                        {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop` : 'Direct'}
                                                    </span>
                                                </div>

                                                {/* Arrival */}
                                                <div className="flex flex-col items-end min-w-[50px]">
                                                    <span className="text-xl font-bold text-slate-900 leading-tight">{formatTime(lastSegment.arrival.at)}</span>
                                                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{lastSegment.arrival.iataCode}</span>
                                                </div>
                                            </div>

                                            {/* Divider between itineraries */}
                                            {index === 0 && offer.itineraries.length > 1 && (
                                                <div className="absolute -bottom-2 left-0 right-0 border-b border-dashed border-slate-200"></div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Bottom Info Row */}
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        <span className="text-[11px] font-bold">0</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        <span className="text-[11px] font-bold">0</span>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Right Section: Price & Select */}
                            <div className="w-[180px] sm:w-[220px] shrink-0 border-l border-slate-100 flex flex-col items-center justify-center p-6 bg-slate-50/30">
                                <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 drop-shadow-sm leading-none">
                                    {offer.price.total} {offer.price.currency === 'EUR' ? '€' : offer.price.currency}
                                </div>
                                <button className="w-full bg-[#009677] hover:bg-[#008569] text-white font-black py-2.5 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-emerald-900/10 active:scale-95 text-sm uppercase tracking-wider">
                                    Select
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:shadow-lg border border-gray-100 hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
                    >
                        Load More Flights
                    </button>
                </div>
            )}
        </div>
    );
}
