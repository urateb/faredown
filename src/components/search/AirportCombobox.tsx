'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { cn } from '@/lib/cn';
import type { Place } from '@/lib/flights/types';
import { describePlace, formatPlaceLabel } from '@/lib/places/parse';

interface AirportComboboxProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * Airport picker following the ARIA combobox pattern.
 *
 * The list is navigable with the arrow keys and announced via
 * `aria-activedescendant`, so focus never leaves the text field and screen
 * readers still track the highlighted option. Free text is accepted too — a
 * bare IATA code typed straight into the field is a valid search.
 */
export function AirportCombobox({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
}: AirportComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [typed, setTyped] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const errorId = useId();

  const { places, isLoading } = usePlaceSearch(typed);
  const showList = isOpen && places.length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function select(place: Place) {
    onChange(formatPlaceLabel(place));
    setTyped('');
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!showList) {
        setIsOpen(true);
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => (current + delta + places.length) % places.length);
      return;
    }

    if (event.key === 'Enter' && showList && activeIndex >= 0) {
      event.preventDefault();
      const place = places[activeIndex];
      if (place) select(place);
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Tab') setIsOpen(false);
  }

  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={id}
        className="text-ink-400 mb-0.5 block text-xs font-bold tracking-wide uppercase"
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setTyped(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setTyped(value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="text-ink-50 placeholder:text-ink-400 w-full border-none bg-transparent p-0 text-sm font-semibold outline-none"
      />

      {error && (
        <p id={errorId} className="text-up-400 mt-0.5 text-xs font-medium">
          {error}
        </p>
      )}

      {showList && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="border-ink-700 absolute top-full left-0 z-50 mt-2 max-h-72 w-[min(22rem,80vw)] overflow-y-auto rounded-xl border bg-white py-1 shadow-[0_16px_40px_-12px_rgb(40_70_110_/_0.3)]"
        >
          {places.map((place, index) => (
            <li
              key={`${place.iataCode}-${place.kind}`}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                select(place);
              }}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                index === activeIndex ? 'bg-ink-800' : 'bg-transparent',
              )}
            >
              <span className="bg-ink-800 text-ink-300 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                {place.kind === 'city' ? <CityIcon /> : <PlaneIcon />}
              </span>
              <span className="min-w-0">
                <span className="text-ink-50 block truncate text-sm font-semibold">
                  {place.cityName}{' '}
                  <span className="text-ink-400 font-mono text-xs">{place.iataCode}</span>
                </span>
                <span className="text-ink-400 block truncate text-xs">{describePlace(place)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {isLoading
          ? 'Searching airports'
          : showList
            ? `${places.length} airport suggestions available`
            : ''}
      </span>
    </div>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  );
}

function CityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M3 21V8l6-4v3l6-3v5h6v12H3zm2-2h4v-3H5v3zm0-5h4v-3H5v3zm6 5h3v-3h-3v3zm0-5h3v-3h-3v3zm0-5h3V6h-3v3zm5 10h3v-3h-3v3zm0-5h3v-3h-3v3z" />
    </svg>
  );
}
