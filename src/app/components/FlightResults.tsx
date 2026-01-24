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

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-slide-up pb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 drop-shadow-sm">
                Found {results.length} Flights:
            </h2>
            <div className="grid gap-4">
                {results.map((offer) => {
                    const itinerary = offer.itineraries[0];
                    const firstSegment = itinerary.segments[0];
                    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

                    return (
                        <div
                            key={offer.id}
                            className="bg-white/90 backdrop-blur-md rounded-2xl p-6 hover:scale-[1.01] transition-transform duration-200 border-gray-200 border"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                                {/* Flight Route Info */}
                                <div className="flex items-center gap-8 flex-1">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{formatTime(firstSegment.departure.at)}</div>
                                        <div className="text-3xl font-black text-blue-600">{firstSegment.departure.iataCode}</div>
                                    </div>

                                    <div className="flex flex-col items-center flex-1 min-w-[120px]">
                                        <div className="text-gray-500 font-medium text-sm mb-1">
                                            {formatDuration(itinerary.duration)}
                                        </div>
                                        <div className="w-full h-0.5 bg-gray-300 relative flex items-center justify-center">
                                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full left-0"></div>
                                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full right-0"></div>
                                            <svg className="w-6 h-6 text-blue-500 bg-white px-1 absolute" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                                        </div>
                                        <div className="text-gray-400 text-xs mt-1 font-medium">
                                            {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop` : 'Direct'}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{formatTime(lastSegment.arrival.at)}</div>
                                        <div className="text-3xl font-black text-blue-600">{lastSegment.arrival.iataCode}</div>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="flex flex-col items-end border-l-0 md:border-l border-gray-200 md:pl-6 min-w-[140px]">
                                    <div className="text-gray-500 text-sm font-medium">starting from</div>
                                    <div className="text-3xl font-black text-gray-900">
                                        {offer.price.currency} {offer.price.total}
                                    </div>
                                    <button className="mt-3 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-sm">
                                        Select
                                    </button>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
