'use client';

import { useState, useEffect } from 'react';
import { Slideshow, SearchForm, Header } from './components';
import { slides } from './data/slides';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen font-sans flex flex-col overflow-hidden">
      <Header />

      <Slideshow slides={slides} currentSlide={currentSlide} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8">

        <div className="w-full max-w-6xl animate-slide-up mt-10">
          <SearchForm />
        </div>

      </div>

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 transition-all duration-1000">
        <span className="text-white/90 font-medium text-sm drop-shadow-md tracking-wide">
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
    </main>
  );
}
