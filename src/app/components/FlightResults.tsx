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
    carrierNames?: Record<string, string>;
}

export default function FlightResults({ results, carrierNames = {} }: FlightResultsProps) {
    if (!results || results.length === 0) {
        return null;
    }

    const formatDuration = (duration: string) => {
        return duration.replace('PT', '').toLowerCase();
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const [visibleCount, setVisibleCount] = useState(6);

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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">
                Found {results.length} Flights:
            </h2>
            <div className="grid gap-6">
                {visibleResults.map((offer) => {
                    return (
                        <div
                            key={offer.id}
                            className="bg-white rounded-xl flex border-gray-200 border overflow-hidden transition-all duration-200 group"
                        >
                            <div className="flex-grow p-6 sm:p-8 flex flex-col gap-8">
                                {offer.itineraries.map((itinerary, index) => {
                                    const firstSegment = itinerary.segments[0];
                                    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
                                    const isOutbound = index === 0;

                                    return (
                                        <div key={index} className="relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {isOutbound ? 'Outbound' : 'Inbound'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 sm:gap-10">
                                                <div className="flex flex-col min-w-[60px]">
                                                    <span className="text-sm font-bold text-slate-500 leading-none">{formatTime(firstSegment.departure.at)}</span>
                                                    <span className="text-2xl font-bold text-slate-900 uppercase tracking-widest mt-1">{firstSegment.departure.iataCode}</span>
                                                </div>

                                                <div className="flex-grow flex flex-col items-center">
                                                    <div className="flex items-center justify-center gap-3 mb-1">
                                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                            {formatDuration(itinerary.duration)}
                                                        </span>
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                                                            <img
                                                                src={`https://pics.avs.io/al_40/40/${firstSegment.carrierCode}.png`}
                                                                alt={carrierNames[firstSegment.carrierCode] || firstSegment.carrierCode}
                                                                title={carrierNames[firstSegment.carrierCode] || firstSegment.carrierCode}
                                                                className="w-full h-full object-contain p-1"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    const parent = e.currentTarget.parentElement;
                                                                    if (parent) {
                                                                        const span = document.createElement('span');
                                                                        span.className = 'text-[10px] font-black italic text-accent';
                                                                        span.innerText = firstSegment.carrierCode;
                                                                        parent.appendChild(span);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                                        {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop` : 'Direct'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-end min-w-[60px]">
                                                    <span className="text-sm font-bold text-slate-500 leading-none">{formatTime(lastSegment.arrival.at)}</span>
                                                    <span className="text-2xl font-bold text-slate-900 uppercase tracking-widest mt-1">{lastSegment.arrival.iataCode}</span>
                                                </div>
                                            </div>

                                            {index === 0 && offer.itineraries.length > 1 && (
                                                <div className="absolute -bottom-4 left-0 right-0 border-b border-dashed border-slate-200"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="w-[180px] sm:w-[240px] shrink-0 border-l border-slate-200 flex flex-col items-center justify-center p-8 bg-slate-50/20">
                                <div className="text-3xl font-bold text-slate-900 mb-8 leading-none tracking-tight">
                                    {offer.price.total} {offer.price.currency === 'EUR' ? '€' : offer.price.currency}
                                </div>
                                <button className="w-full bg-accent hover:bg-accent/90 text-white font-black py-3 px-6 rounded-sm transition-all duration-200 active:scale-95 text-xs uppercase tracking-[0.2em] cursor-pointer">
                                    Select
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-white cursor-pointer text-accent font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 text-sm tracking-wide"
                    >
                        Load More Flights
                    </button>
                </div>
            )}
        </div>
    );
}
