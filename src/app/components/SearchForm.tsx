'use client';

import { useState } from 'react';

export default function SearchForm() {
    const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [directFlights, setDirectFlights] = useState(false);

    return (
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">

            <div className="flex items-center gap-6 mb-4 text-white font-medium shadow-black/20 drop-shadow-md">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'roundtrip' ? 'border-white' : 'border-white/60 group-hover:border-white'}`}>
                        {tripType === 'roundtrip' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <input
                        type="radio"
                        name="tripType"
                        className="hidden"
                        checked={tripType === 'roundtrip'}
                        onChange={() => setTripType('roundtrip')}
                    />
                    <span className={tripType === 'roundtrip' ? 'text-white' : 'text-white/80'}>Round-trip</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'oneway' ? 'border-white' : 'border-white/60 group-hover:border-white'}`}>
                        {tripType === 'oneway' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <input
                        type="radio"
                        name="tripType"
                        className="hidden"
                        checked={tripType === 'oneway'}
                        onChange={() => setTripType('oneway')}
                    />
                    <span className={tripType === 'oneway' ? 'text-white' : 'text-white/80'}>One-way</span>
                </label>
            </div>

            <div className="relative w-full bg-white rounded-full h-20 shadow-xl flex items-center px-2 z-10">

                <div className="flex-1 px-8 border-r border-gray-200 relative group cursor-pointer hover:bg-gray-50 rounded-l-full h-full flex flex-col justify-center transition-colors">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">From</label>
                    <input
                        type="text"
                        placeholder="Departure"
                        className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold placeholder-gray-400 text-lg p-0"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                    />
                </div>

                <div className="absolute left-[26%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 bg-white border border-gray-100 rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>

                <div className="flex-1 px-8 border-r border-gray-200 relative group cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-colors">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">To</label>
                    <input
                        type="text"
                        placeholder="Destination"
                        className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold placeholder-gray-400 text-lg p-0"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </div>

                <div className="flex-[0.8] px-8 border-r border-gray-200 relative group cursor-pointer hover:bg-gray-50 h-full flex flex-col justify-center transition-colors">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Dates</label>
                    <div className="text-gray-400 font-medium text-lg">Add dates</div>
                </div>

                <div className="flex-[0.8] pl-8 pr-20 relative group cursor-pointer hover:bg-gray-50 rounded-r-full h-full flex flex-col justify-center transition-colors">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Travelers</label>
                    <div className="text-gray-900 font-semibold text-lg">1 traveler</div>
                </div>

                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#3b82f6] hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </div>

            <div className="w-full flex justify-start mt-4 pl-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${directFlights ? 'bg-white border-white' : 'border-white/70 group-hover:border-white'}`}>
                        {directFlights && <svg className="w-3.5 h-3.5 text-blue-500 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={directFlights}
                        onChange={() => setDirectFlights(!directFlights)}
                    />
                    <span className="text-white/90 font-medium group-hover:text-white transition-colors text-sm shadow-black/50 drop-shadow-sm">Direct flights only</span>
                </label>
            </div>
        </div>
    );
}
