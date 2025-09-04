'use client'

import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface NotchedBoxProps extends Omit<BoxProps, 'component'> {
  notchContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const NotchedBox = ({
  notchContent,
  className,
  children
}: NotchedBoxProps) => {

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [notchWidth, setNotchWidth] = React.useState(0); // as a fraction of width (0..1)
  const containerRef = React.useRef<HTMLDivElement>(null);

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
  const notchH = Math.min(40 / ch, 1); // normalize 40px
  const notchW = Math.min(notchWidth, 1);

  // Inner notch radii cannot exceed half the notch dimensions
  const irx = Math.min(rx, Math.max(0, notchW / 2 - 0.001));
  const iry = Math.min(ry, Math.max(0, notchH / 2 - 0.001));

  // X where the notch starts from the right
  const startX = 1 - notchW;

  // Helpful guard so top edge before the notch never goes negative
  const preNotchTopX = Math.max(startX - irx, rx);

  // Build a single path:
  // - Start near top-left outer corner
  // - Go right to the notch, round into the notch (concave),
  //   across the notch bottom, round back out to the right edge (concave),
  //   then down/right/bottom/left with outer rounded corners.
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

  return (
    <Box className="relative">
      <Box
        ref={containerRef}
        component="img"
        src="/welcomeback-data-stockimage.webp"
        alt="Notched Background Image"
        className={`${className} rounded-2xl object-center object-cover`}
        sx={{ clipPath: "url(#notch-clip)" }}
      />
      <svg width={0} height={0} aria-hidden>
        <defs>
          <clipPath id="notch-clip" clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        </defs>
      </svg>

      {/* Hidden content ref to measure width */}
      <Box ref={contentRef} className="absolute top-0 right-0 w-auto mr-2 mt-1">
        {notchContent}
      </Box>
    </Box>
  );
};

export default NotchedBox;
