'use client';

import Image from 'next/image';

interface Slide {
    url: string;
    alt: string;
    location: string;
}

interface SlideshowProps {
    slides: Slide[];
    currentSlide: number;
}

export default function Slideshow({ slides, currentSlide }: SlideshowProps) {
    return (
        <div className="absolute inset-0 overflow-hidden z-0 bg-black">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={slide.url}
                        alt={slide.alt}
                        fill
                        className="object-cover object-center"
                        priority={index === 0}
                        quality={90}
                    />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
            ))}
        </div>
    );
}
