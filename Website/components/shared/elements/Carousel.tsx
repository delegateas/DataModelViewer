'use client'

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

export interface CarouselItem {
  image?: string;
  title: string;
  text: string;
  type: string;
}

interface CarouselProps {
  items: CarouselItem[];
  currentIndex?: number;
  slideDirection?: 'left' | 'right' | null;
  className?: string;
}

const Carousel = ({ items, currentIndex = 0, slideDirection = null, className }: CarouselProps) => {
  const [animationState, setAnimationState] = useState<'idle' | 'sliding'>('idle');
  const [prevIndex, setPrevIndex] = useState(currentIndex);

  useEffect(() => {
    if (currentIndex !== prevIndex && slideDirection) {
      setAnimationState('sliding');
      
      const timer = setTimeout(() => {
        setPrevIndex(currentIndex);
        setAnimationState('idle');
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (currentIndex !== prevIndex) {
      setPrevIndex(currentIndex);
    }
  }, [currentIndex, prevIndex, slideDirection]);

  const currentItem = items[currentIndex] || { title: '', text: '' };

  return (
    <Box className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* Gradient overlay for text readability */}
      <Box className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 to-black/90" />
      
      {/* Content container */}
      <Box 
        className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-white"
        key={currentIndex} // This will trigger re-render with new content
      >
        <Box
          className={`transform transition-all duration-500 ease-out ${
            animationState === 'sliding'
              ? slideDirection === 'right'
                ? 'animate-slideInLeft'
                : 'animate-slideInRight'
              : ''
          }`}
        >
          <Typography variant='subtitle1' className='text-sm font-semibold mb-2' color='accent'>
            {currentItem.type}
          </Typography>
          <Typography variant='h6' className='font-bold mb-2'>
            {currentItem.title}
          </Typography>
          <Typography variant='body2' className='text-gray-200 mb-8'>
            {currentItem.text}
          </Typography>
        </Box>
      </Box>

      {/* Pagination dots - stationary, outside animated content */}
      <Box className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {items.map((_, index) => (
          <Box
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white opacity-100'
                : 'bg-white/40 opacity-60'
            }`}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Carousel;
