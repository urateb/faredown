'use client';

import { useState } from 'react';

interface FilterSidebarProps {
    tripType: 'roundtrip' | 'oneway';
    setTripType: (type: 'roundtrip' | 'oneway') => void;
    stops: 'any' | 'direct' | '1' | '2+';
    setStops: (stops: 'any' | 'direct' | '1' | '2+') => void;
    carriers: { code: string; name: string }[];
    selectedCarriers: string[];
    setSelectedCarriers: (carriers: string[] | ((prev: string[]) => string[])) => void;
}

export default function FilterSidebar({
    tripType,
    setTripType,
    stops,
    setStops,
    carriers,
    selectedCarriers,
    setSelectedCarriers
}: FilterSidebarProps) {
    const filterTextColor = 'text-gray-700';
    const filterBorderColor = 'border-gray-700';

    const [showAllCarriers, setShowAllCarriers] = useState(false);

    const toggleCarrier = (carrierCode: string) => {
        if (selectedCarriers.includes(carrierCode)) {
            setSelectedCarriers(selectedCarriers.filter(c => c !== carrierCode));
        } else {
            setSelectedCarriers([...selectedCarriers, carrierCode]);
        }
    };

    const visibleCarriers = showAllCarriers ? carriers : carriers.slice(0, 5);

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-3 font-medium">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Trip Type</div>

                <label className="flex items-center gap-3 cursor-pointer group px-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'roundtrip' ? filterBorderColor : `${filterBorderColor} opacity-60 group-hover:opacity-100`}`}>
                        {tripType === 'roundtrip' && <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />}
                    </div>
                    <input
                        type="radio"
                        name="tripType"
                        className="hidden"
                        checked={tripType === 'roundtrip'}
                        onChange={() => setTripType('roundtrip')}
                    />
                    <span className={`text-sm ${tripType === 'roundtrip' ? filterTextColor : `${filterTextColor} opacity-60`}`}>Round-trip</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group px-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'oneway' ? filterBorderColor : `${filterBorderColor} opacity-60 group-hover:opacity-100`}`}>
                        {tripType === 'oneway' && <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />}
                    </div>
                    <input
                        type="radio"
                        name="tripType"
                        className="hidden"
                        checked={tripType === 'oneway'}
                        onChange={() => setTripType('oneway')}
                    />
                    <span className={`text-sm ${tripType === 'oneway' ? filterTextColor : `${filterTextColor} opacity-60`}`}>One-way</span>
                </label>
            </div>

            <div className="flex flex-col gap-3 font-medium">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Stops</div>

                {[
                    { value: 'any', label: 'Any number of stops' },
                    { value: 'direct', label: 'Direct flights only' },
                    { value: '1', label: '1 Stop max' },
                    { value: '2+', label: '2+ Stops' }
                ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group px-1">
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${stops === option.value ? `${filterBorderColor}` : `${filterBorderColor} opacity-70 group-hover:opacity-100`}`}>
                            {stops === option.value && <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />}
                        </div>
                        <input
                            type="radio"
                            name="stops"
                            className="hidden"
                            checked={stops === option.value}
                            onChange={() => setStops(option.value as any)}
                        />
                        <span className={`text-sm ${stops === option.value ? filterTextColor : `${filterTextColor} opacity-60`}`}>{option.label}</span>
                    </label>
                ))}
            </div>

            {carriers.length > 0 && (
                <div className="flex flex-col gap-3 font-medium">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Airlines</div>

                    {visibleCarriers.map((carrier) => (
                        <label key={carrier.code} className="flex items-center gap-3 cursor-pointer group px-1">
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${selectedCarriers.includes(carrier.code) ? `${filterBorderColor}` : `${filterBorderColor} opacity-40 group-hover:opacity-100`}`}>
                                {selectedCarriers.includes(carrier.code) && (
                                    <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={selectedCarriers.includes(carrier.code)}
                                onChange={() => toggleCarrier(carrier.code)}
                            />
                            <div className="flex items-center gap-2">
                                <img
                                    src={`https://pics.avs.io/al_20/20/${carrier.code}.png`}
                                    alt={carrier.name}
                                    className="w-4 h-4 rounded-sm"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <span className={`text-sm ${selectedCarriers.includes(carrier.code) ? filterTextColor : `${filterTextColor} opacity-40`}`}>{carrier.name}</span>
                            </div>
                        </label>
                    ))}

                    {carriers.length > 5 && (
                        <button
                            onClick={() => setShowAllCarriers(!showAllCarriers)}
                            className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2 hover:text-accent/90 transition-colors text-left px-1 cursor-pointer"
                        >
                            {showAllCarriers ? '- View Less' : `+ View More (${carriers.length - 5} more)`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
