
import React from 'react';

interface LogoProps {
  className?: string;
}

export const InfinityLogo: React.FC<LogoProps> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="infinityGradient" x1="0" y1="100" x2="200" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Outer Glow Halo */}
    <path d="M50,100 C50,70 90,70 100,100 C110,130 150,130 150,100 C150,70 110,70 100,100 C90,130 50,130 50,100 Z" 
          stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.4" filter="url(#glow)" />

    {/* Main Infinity Stroke */}
    <path d="M50,100 C50,60 90,60 100,100 C110,140 150,140 150,100 C150,60 110,60 100,100 C90,140 50,140 50,100 Z" 
          stroke="url(#infinityGradient)" strokeWidth="14" strokeLinecap="round" fill="none" />
          
    {/* Highlights */}
    <path d="M50,100 C50,60 90,60 100,100" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="10 30" />
    
    {/* Animated Particles */}
    <circle cx="150" cy="100" r="6" fill="#a855f7" filter="url(#glow)">
       <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="100" r="6" fill="#06b6d4" filter="url(#glow)">
       <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);
