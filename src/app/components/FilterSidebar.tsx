'use client';

interface FilterSidebarProps {
    tripType: 'roundtrip' | 'oneway';
    setTripType: (type: 'roundtrip' | 'oneway') => void;
    stops: 'any' | 'direct' | '1' | '2+';
    setStops: (stops: 'any' | 'direct' | '1' | '2+') => void;
}

export default function FilterSidebar({ tripType, setTripType, stops, setStops }: FilterSidebarProps) {
    const filterTextColor = 'text-gray-700';
    const filterBorderColor = 'border-gray-700';

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-3 font-medium">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Trip Type</div>

                <label className="flex items-center gap-3 cursor-pointer group">
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
                    <span className={`${tripType === 'roundtrip' ? filterTextColor : `${filterTextColor} opacity-60`}`}>Round-trip</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
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
                    <span className={`${tripType === 'oneway' ? filterTextColor : `${filterTextColor} opacity-60`}`}>One-way</span>
                </label>
            </div>

            <div className="flex flex-col gap-3 font-medium">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Stops</div>

                {[
                    { value: 'any', label: 'Any number of stops' },
                    { value: 'direct', label: 'Direct flights only' },
                    { value: '1', label: '1 Stop max' },
                    { value: '2+', label: '2+ Stops' }
                ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
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
                        <span className={`${stops === option.value ? filterTextColor : `${filterTextColor} opacity-60`}`}>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
