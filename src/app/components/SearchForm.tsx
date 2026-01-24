'use client';

import { useState, useRef, useEffect } from 'react';

import { FlightOffer } from './FlightResults';
import { airports, Airport } from '../data/airports';

interface SearchFormProps {
    onSearchResults: (results: FlightOffer[]) => void;
    variant?: 'light' | 'dark';
    layout?: 'horizontal' | 'vertical';
    // Controlled props (optional, but used for state lifting)
    tripType?: 'roundtrip' | 'oneway';
    setTripType?: (type: 'roundtrip' | 'oneway') => void;
    // Stops filter
    stops?: 'any' | 'direct' | '1' | '2+';
    setStops?: (stops: 'any' | 'direct' | '1' | '2+') => void;

    // Controlled text inputs
    origin?: string;
    setOrigin?: (val: string) => void;
    destination?: string;
    setDestination?: (val: string) => void;
    departureDate?: string;
    setDepartureDate?: (val: string) => void;
    returnDate?: string;
    setReturnDate?: (val: string) => void;
    travelers?: number;
    setTravelers?: (val: number | ((prev: number) => number)) => void;

    onSearchTriggered?: () => void;
    isLoading?: boolean;
    hideFilters?: boolean;
}

export default function SearchForm({
    onSearchResults,
    variant = 'light',
    layout = 'horizontal',
    tripType: controlledTripType,
    setTripType: controlledSetTripType,
    stops: controlledStops,
    setStops: controlledSetStops,
    // Controlled inputs
    origin: controlledOrigin,
    setOrigin: controlledSetOrigin,
    destination: controlledDestination,
    setDestination: controlledSetDestination,
    departureDate: controlledDepartureDate,
    setDepartureDate: controlledSetDepartureDate,
    returnDate: controlledReturnDate,
    setReturnDate: controlledSetReturnDate,
    travelers: controlledTravelers,
    setTravelers: controlledSetTravelers,

    onSearchTriggered,
    isLoading: controlledIsLoading,
    hideFilters = false
}: SearchFormProps) {
    // Local state fallback (if not controlled)
    const [localTripType, setLocalTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
    const [localStops, setLocalStops] = useState<'any' | 'direct' | '1' | '2+'>('any');
    const [localOrigin, setLocalOrigin] = useState('');
    const [localDestination, setLocalDestination] = useState('');
    const [localDepartureDate, setLocalDepartureDate] = useState('');
    const [localReturnDate, setLocalReturnDate] = useState('');
    const [localTravelers, setLocalTravelers] = useState(1);
    const [localIsLoading, setLocalIsLoading] = useState(false);

    // Use controlled state if available, otherwise local
    const tripType = controlledTripType ?? localTripType;
    const setTripType = controlledSetTripType ?? setLocalTripType;
    const stops = controlledStops ?? localStops;
    const setStops = controlledSetStops ?? setLocalStops;

    const origin = controlledOrigin ?? localOrigin;
    const setOrigin = controlledSetOrigin ?? setLocalOrigin;
    const destination = controlledDestination ?? localDestination;
    const setDestination = controlledSetDestination ?? setLocalDestination;
    const departureDate = controlledDepartureDate ?? localDepartureDate;
    const setDepartureDate = controlledSetDepartureDate ?? setLocalDepartureDate;
    const returnDate = controlledReturnDate ?? localReturnDate;
    const setReturnDate = controlledSetReturnDate ?? setLocalReturnDate;
    const travelers = controlledTravelers ?? localTravelers;
    const setTravelers = controlledSetTravelers ?? setLocalTravelers;
    const isLoading = controlledIsLoading ?? localIsLoading;
    const setIsLoading = setLocalIsLoading; // Dummy if controlled, but we should use it consistently

    const filterTextColor = variant === 'dark' ? 'text-gray-700' : 'text-white';
    const filterBorderColor = variant === 'dark' ? 'border-gray-700' : 'border-white';

    const isVertical = layout === 'vertical';

    // Auto-suggestion state
    const [suggestions, setSuggestions] = useState<Airport[]>([]);
    const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setSuggestions([]);
                setActiveField(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'origin' | 'destination') => {
        const value = e.target.value;
        if (field === 'origin') setOrigin(value);
        else setDestination(value);

        setActiveField(field);

        if (value.length > 0) {
            const filtered = airports.filter(airport =>
                airport.city.toLowerCase().includes(value.toLowerCase()) ||
                airport.code.toLowerCase().includes(value.toLowerCase()) ||
                airport.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectLocation = (airport: Airport) => {
        if (activeField === 'origin') {
            setOrigin(`${airport.city} (${airport.code})`);
        } else if (activeField === 'destination') {
            setDestination(`${airport.city} (${airport.code})`);
        }
        setSuggestions([]);
        setActiveField(null);
    };

    const handleSwapLocations = () => {
        setOrigin(destination);
        setDestination(origin);
    };

    const handleSearch = async () => {
        if (onSearchTriggered) {
            onSearchTriggered();
            return;
        }

        // Extract code from "City (CODE)" format if present, otherwise use raw input
        const originCode = origin.match(/\(([^)]+)\)/)?.[1] || origin;
        const destinationCode = destination.match(/\(([^)]+)\)/)?.[1] || destination;

        if (!originCode || !destinationCode || !departureDate) {
            alert('Please fill in all fields');
            return;
        }

        if (tripType === 'roundtrip' && !returnDate) {
            alert('Please select a return date');
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                origin: originCode,
                destination: destinationCode,
                date: departureDate,
                adults: travelers.toString(),
                nonStop: (stops === 'direct').toString() // Using legacy param for direct, filtering for others happens client side or needs new API logic
            });

            if (tripType === 'roundtrip' && returnDate) {
                params.append('returnDate', returnDate);
            }

            const response = await fetch(`/api/search?${params}`);
            const data = await response.json();

            console.log('Flight Search Results:', data);
            if (onSearchResults) {
                // If API returns an error object, handle it gracefully
                if (data.error) {
                    throw new Error(data.error);
                }
                onSearchResults(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Something went wrong. Please check your inputs and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if we are in "results mode" (light background) to style texts dark
    // For now assuming we pass a prop or infer from context? 
    // Actually, the user asked for specific colors. Let's add a prop.
    // Re-reading implementation plan: I intended to add props.
    // Since I can't change the interface in this specific replacement block easily without context,
    // I made a mistake in the previous thought. I need to update the interface first or together.
    // The instructions said "Make the background... for the results...".
    // I will use a prop `variant` which defaults to 'light' (white text) and can be 'dark' (gray text).

    return (
        <div className={`relative w-full ${isVertical ? 'max-w-xs' : 'max-w-5xl'} mx-auto flex flex-col items-center`} ref={wrapperRef}>

            {!hideFilters && (
                <div className={`flex ${isVertical ? 'flex-col items-start gap-2 w-full' : 'items-center gap-4'} mb-4 font-medium shadow-black/20 drop-shadow-md`}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'roundtrip' ? filterBorderColor : `${filterBorderColor} opacity-60 group-hover:opacity-100`}`}>
                            {tripType === 'roundtrip' && <div className={`w-2.5 h-2.5 rounded-full ${variant === 'dark' ? 'bg-gray-700' : 'bg-white'}`} />}
                        </div>
                        <input
                            type="radio"
                            name="tripType"
                            className="hidden"
                            checked={tripType === 'roundtrip'}
                            onChange={() => setTripType('roundtrip')}
                        />
                        <span className={`${tripType === 'roundtrip' ? filterTextColor : `${filterTextColor} opacity-80`}`}>Round-trip</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'oneway' ? filterBorderColor : `${filterBorderColor} opacity-60 group-hover:opacity-100`}`}>
                            {tripType === 'oneway' && <div className={`w-2.5 h-2.5 rounded-full ${variant === 'dark' ? 'bg-gray-700' : 'bg-white'}`} />}
                        </div>
                        <input
                            type="radio"
                            name="tripType"
                            className="hidden"
                            checked={tripType === 'oneway'}
                            onChange={() => setTripType('oneway')}
                        />
                        <span className={`${tripType === 'oneway' ? filterTextColor : `${filterTextColor} opacity-80`}`}>One-way</span>
                    </label>

                    {!isVertical && <div className={`h-5 w-px mx-2 ${variant === 'dark' ? 'bg-gray-400' : 'bg-white/40'}`}></div>}

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${stops === 'direct' ? `${filterBorderColor} ${variant === 'dark' ? 'bg-gray-700' : 'bg-white'}` : `${filterBorderColor} opacity-70 group-hover:opacity-100`}`}>
                            {stops === 'direct' && <svg className={`w-3.5 h-3.5 font-bold ${variant === 'dark' ? 'text-white' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <input
                            type="checkbox" // Keep simple toggle for horizontal view or switch to full control? Use stops === 'direct' vs any for simplicity here
                            className="hidden"
                            checked={stops === 'direct'}
                            onChange={() => setStops(stops === 'direct' ? 'any' : 'direct')}
                        />
                        <span className={`${filterTextColor} font-medium group-hover:text-white transition-colors text-sm shadow-black/50 drop-shadow-sm opacity-90`}>Direct only</span>
                    </label>
                </div>
            )}

            <div className={`relative w-full bg-white ${isVertical ? 'rounded-3xl flex-col h-auto p-2 pb-16 shadow-lg' : 'rounded-full h-20 flex items-center'} z-10 border-gray-200 border`}>

                <div className={`${isVertical ? 'w-full px-6 py-4 border-b' : 'flex-[1.2] px-8 border-r rounded-l-full h-full flex flex-col justify-center'} border-gray-200 relative group cursor-pointer hover:bg-gray-50 transition-colors`}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">From</label>
                    <input
                        type="text"
                        placeholder="Departure"
                        className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold placeholder-gray-400 text-lg p-0"
                        value={origin}
                        onChange={(e) => handleLocationChange(e, 'origin')}
                        onFocus={() => setActiveField('origin')}
                    />
                    {activeField === 'origin' && suggestions.length > 0 && (
                        <ul className={`absolute left-0 mt-2 w-[300px] bg-white rounded-xl shadow-2xl overflow-hidden py-1 z-50 border border-gray-100 max-h-60 overflow-y-auto ${isVertical ? 'top-full' : 'top-full'}`}>
                            {suggestions.map((airport) => (
                                <li
                                    key={airport.code}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none flex flex-col"
                                    onClick={() => handleSelectLocation(airport)}
                                >
                                    <span className="font-bold text-gray-900">{airport.city} ({airport.code})</span>
                                    <span className="text-xs text-gray-500">{airport.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={`switch-button z-20 bg-white border border-gray-100 rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-blue-500 transition-colors ${isVertical
                    ? 'absolute left-1/2 -translate-x-1/2 top-[calc(50%-1.75rem)]' // Vertical: Absolute centered
                    : '-ml-4 -mr-4 relative' // Horizontal: Relative with negative margins to sit between flex items
                    } ${isVertical ? 'hidden' : ''}`} // Keep hidden in vertical for now unless requested
                    onClick={handleSwapLocations}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>

                <div className={`${isVertical ? 'w-full px-6 py-4 border-b' : 'flex-[1.2] px-8 border-r h-full flex flex-col justify-center'} border-gray-200 relative group cursor-pointer hover:bg-gray-50 transition-colors`}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">To</label>
                    <input
                        type="text"
                        placeholder="Destination"
                        className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold placeholder-gray-400 text-lg p-0"
                        value={destination}
                        onChange={(e) => handleLocationChange(e, 'destination')}
                        onFocus={() => setActiveField('destination')}
                    />
                    {activeField === 'destination' && suggestions.length > 0 && (
                        <ul className={`absolute left-0 mt-2 w-[300px] bg-white rounded-xl shadow-2xl overflow-hidden py-1 z-50 border border-gray-100 max-h-60 overflow-y-auto ${isVertical ? 'top-full' : 'top-full'}`}>
                            {suggestions.map((airport) => (
                                <li
                                    key={airport.code}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none flex flex-col"
                                    onClick={() => handleSelectLocation(airport)}
                                >
                                    <span className="font-bold text-gray-900">{airport.city} ({airport.code})</span>
                                    <span className="text-xs text-gray-500">{airport.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={`${tripType === 'roundtrip' ? (isVertical ? 'w-full' : 'flex-[1.6]') : (isVertical ? 'w-full' : 'flex-[0.8]')} ${isVertical ? 'px-6 py-4 border-b' : 'px-8 border-r h-full flex items-center'} border-gray-200 relative group cursor-pointer hover:bg-gray-50 transition-colors`}>
                    <div className={`flex gap-4 w-full ${isVertical ? 'flex-col gap-4' : ''}`}>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 block whitespace-nowrap">DEPARTURE DATE</label>
                            <input
                                type="date"
                                className="w-full bg-transparent border-none outline-none text-gray-900 font-medium placeholder-gray-400 text-lg p-0 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-30 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                        </div>
                        {tripType === 'roundtrip' && (
                            <div className={`flex-1 ${isVertical ? 'border-t pt-4' : 'border-l pl-4'} border-gray-200 animate-fade-in`}>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 block whitespace-nowrap">RETURN DATE</label>
                                <input
                                    type="date"
                                    className="w-full bg-transparent border-none outline-none text-gray-900 font-medium placeholder-gray-400 text-lg p-0 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-30 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    value={returnDate}
                                    min={departureDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${isVertical ? 'w-full px-6 py-4' : 'flex-[0.8] pl-8 pr-20 rounded-r-full h-full flex flex-col justify-center'} relative group cursor-pointer hover:bg-gray-50 transition-colors`}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Travelers</label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setTravelers(prev => Math.max(1, prev - 1))}
                            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            -
                        </button>
                        <div className="text-gray-900 font-semibold text-lg min-w-[1ch] text-center">{travelers}</div>
                        <button
                            onClick={() => setTravelers(prev => Math.min(9, prev + 1))}
                            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className={`absolute ${isVertical ? 'bottom-2 right-2 w-12 h-12' : 'right-2 top-1/2 -translate-y-1/2 w-16 h-16'} bg-[#3b82f6] hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className={`${isVertical ? 'w-6 h-6' : 'w-8 h-8'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    )}
                </button>
            </div>
        </div>
    );
}
