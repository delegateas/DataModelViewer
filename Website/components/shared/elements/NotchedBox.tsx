'use client'

import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface NotchedBoxProps extends Omit<BoxProps, 'component'> {
  notchContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  backgroundImage?: string;
  variant?: 'default' | 'outlined';
}

const NotchedBox = ({
  notchContent,
  className,
  children,
  backgroundImage,
  variant = 'default'
}: NotchedBoxProps) => {

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [notchWidth, setNotchWidth] = React.useState(0); // as a fraction of width (0..1)
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [prevBackgroundImage, setPrevBackgroundImage] = React.useState<string | undefined>(backgroundImage);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  // Generate unique ID for this component instance
  const uniqueId = React.useMemo(() => `notch-${Math.random().toString(36).substr(2, 9)}`, []);

  React.useEffect(() => {
    if (backgroundImage !== prevBackgroundImage) {
      setIsTransitioning(true);
      setPrevBackgroundImage(backgroundImage);
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match transition duration
      
      return () => clearTimeout(timer);
    }
  }, [backgroundImage, prevBackgroundImage]);

  React.useEffect(() => {
    const updateNotchWidth = () => {
      if (contentRef.current && containerRef.current) {
        const contentWidthPx = contentRef.current.clientWidth + 16; // 8px horizontal padding both sides
        const containerWidthPx = containerRef.current.clientWidth || 1;
        setNotchWidth(Math.min(1, contentWidthPx / containerWidthPx));
      }
    };

    updateNotchWidth();
    window.addEventListener('resize', updateNotchWidth);
    return () => window.removeEventListener('resize', updateNotchWidth);
  }, [notchContent]);

  // Compute normalized radii (objectBoundingBox uses 0..1 units)
  const cw = containerRef.current?.clientWidth || 1;
  const ch = containerRef.current?.clientHeight || 1;

  // 16px corner radius in both axes, normalized
  const rx = Math.min(16 / cw, 0.49);
  const ry = Math.min(16 / ch, 0.49);

  // Notch size: width is based on content; height fixed to 40px (normalized)
  const notchH = Math.min(48 / ch, 1); // normalize 40px
  const notchW = Math.min(notchWidth, 1);

  // Inner notch radii cannot exceed half the notch dimensions
  const irx = Math.min(rx, Math.max(0, notchW / 2 - 0.001));
  const iry = Math.min(ry, Math.max(0, notchH / 2 - 0.001));

  // X where the notch starts from the right
  const startX = 1 - notchW;

  // Helpful guard so top edge before the notch never goes negative
  const preNotchTopX = Math.max(startX - irx, rx);

  // Build the notched path
  const d = [
    `M ${rx},0`,
    `H ${preNotchTopX}`,
    // Inner top-left corner of notch (concave)
    `A ${irx} ${iry} 0 0 1 ${startX} ${iry}`,
    `V ${Math.max(notchH - iry, iry)}`,
    // Inner bottom-left corner of notch (concave)
    `A ${irx} ${iry} 0 0 0 ${startX + irx} ${notchH}`,
    `H ${1 - rx}`,
    // Inner bottom-right corner of notch (concave back to right wall)
    `A ${irx} ${iry} 0 0 1 1 ${notchH + iry}`,
    `V ${1 - ry}`,
    // Outer bottom-right (convex)
    `A ${rx} ${ry} 0 0 1 ${1 - rx} 1`,
    `H ${rx}`,
    // Outer bottom-left (convex)
    `A ${rx} ${ry} 0 0 1 0 ${1 - ry}`,
    `V ${ry}`,
    // Outer top-left (convex)
    `A ${rx} ${ry} 0 0 1 ${rx} 0`,
    `Z`
  ].join(' ');

  // Build inset stroke path (slightly smaller for inward stroke)
  const strokeInset = 0.003; // Inset amount
  const strokeRx = Math.max(rx - strokeInset, 0.001);
  const strokeRy = Math.max(ry - strokeInset, 0.001);
  const strokeNotchH = Math.max(notchH - strokeInset, strokeInset);
  const strokeNotchW = Math.max(notchW - strokeInset * 2, strokeInset);
  const strokeStartX = 1 - strokeNotchW;
  const strokeIrx = Math.min(strokeRx, Math.max(0, strokeNotchW / 2 - 0.001));
  const strokeIry = Math.min(strokeRy, Math.max(0, strokeNotchH / 2 - 0.001));
  const strokePreNotchTopX = Math.max(strokeStartX - strokeIrx, strokeRx);

  const strokePath = [
    `M ${strokeRx},${strokeInset}`,
    `H ${strokePreNotchTopX}`,
    // Inner top-left corner of notch (concave)
    `A ${strokeIrx} ${strokeIry} 0 0 1 ${strokeStartX} ${strokeIry}`,
    `V ${Math.max(strokeNotchH - strokeIry, strokeIry)}`,
    // Inner bottom-left corner of notch (concave)
    `A ${strokeIrx} ${strokeIry} 0 0 0 ${strokeStartX + strokeIrx} ${strokeNotchH + strokeInset}`,
    `H ${1 - strokeRx}`,
    // Inner bottom-right corner of notch (concave back to right wall)
    `A ${strokeIrx} ${strokeIry} 0 0 1 ${1 - strokeInset} ${strokeNotchH + strokeIry + strokeInset}`,
    `V ${1 - strokeRy}`,
    // Outer bottom-right (convex)
    `A ${strokeRx} ${strokeRy} 0 0 1 ${1 - strokeRx} ${1 - strokeInset}`,
    `H ${strokeRx}`,
    // Outer bottom-left (convex)
    `A ${strokeRx} ${strokeRy} 0 0 1 ${strokeInset} ${1 - strokeRy}`,
    `V ${strokeRy + strokeInset}`,
    // Outer top-left (convex)
    `A ${strokeRx} ${strokeRy} 0 0 1 ${strokeRx} ${strokeInset}`,
    `Z`
  ].join(' ');

  return (
    <Box className="relative h-96">
      {/* SVG-based NotchedBox */}
      <Box
        ref={containerRef}
        className={`absolute inset-0 ${className}`}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <clipPath id={`${uniqueId}-clip`} clipPathUnits="objectBoundingBox">
              <path d={d} />
            </clipPath>
          </defs>
          
          {/* Main shape */}
          <path
            d={d}
            fill={variant === 'outlined' ? 'var(--mui-palette-background-paper)' : (backgroundImage ? 'none' : '#4F46E5')}
            stroke="none"
          />
          
          {/* Separate stroke for outlined variant */}
          {variant === 'outlined' && (
            <path
              d={strokePath}
              fill="none"
              stroke="var(--mui-palette-border-main)"
              strokeWidth="0.0025"
            />
          )}
        </svg>

        {/* Background image for default variant */}
        {variant === 'default' && backgroundImage && (
          <>
            {/* Previous background for crossfade effect */}
            {isTransitioning && prevBackgroundImage && prevBackgroundImage !== backgroundImage && (
              <Box
                component="img"
                src={prevBackgroundImage}
                alt="Previous Background"
                className="absolute inset-0 w-full h-full object-center object-cover"
                sx={{ 
                  opacity: 1, 
                  zIndex: 1,
                  clipPath: `url(#${uniqueId}-clip)`
                }}
              />
            )}
            
            {/* Current background */}
            <Box
              component="img"
              src={backgroundImage}
              alt="Notched Background Image"
              className="absolute inset-0 w-full h-full object-center object-cover transition-opacity duration-500 ease-in-out"
              sx={{
                opacity: isTransitioning ? 0 : 1,
                zIndex: 2,
                clipPath: `url(#${uniqueId}-clip)`
              }}
              onLoad={() => setIsTransitioning(false)}
            />
          </>
        )}
      </Box>

      {/* Hidden content ref to measure width */}
      <Box ref={contentRef} className="absolute top-0 right-0 w-auto mr-2 mt-1 z-30">
        {notchContent}
      </Box>

      {/* Content container - clipped to shape */}
      <Box 
        className="absolute inset-0 z-10 p-0"
        sx={{ clipPath: `url(#${uniqueId}-clip)` }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default NotchedBox;
