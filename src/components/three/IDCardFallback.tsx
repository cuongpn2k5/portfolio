import React, { useState, useRef } from 'react';
import { User, QrCode } from 'lucide-react';
import type { ProfileData } from '../../types';

interface IDCardFallbackProps {
  profile: ProfileData;
}

export const IDCardFallback: React.FC<IDCardFallbackProps> = ({ profile }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 15;
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Flat Black Fabric Lanyard Strap extending from top matching Image 2 */}
      <div className="w-10 h-32 bg-[#111114] rounded-t-sm shadow-md relative overflow-hidden flex items-center justify-center border-x border-neutral-700/60">
        <div className="absolute inset-y-0 w-full flex flex-col justify-around text-[10px] text-white/90 font-black tracking-widest uppercase select-none -rotate-90">
          <span>ID CARD</span>
        </div>
      </div>

      {/* Realistic Crimp Clasp & Swivel Snap Hook */}
      <div className="w-11 h-4 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xs border border-neutral-700 shadow-sm flex items-center justify-center -mt-0.5 z-10" />
      <div className="w-7 h-5 bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 rounded-md border border-zinc-100 shadow-md flex items-center justify-center -mt-1 z-10">
        <div className="w-3.5 h-1.5 bg-neutral-900 rounded-full" />
      </div>

      {/* Card Container with 3D Tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y + (isFlipped ? 180 : 0)}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
        }}
        className="w-[322px] h-[483px] sm:w-[345px] sm:h-[517.5px] cursor-pointer select-none relative -mt-1 group shadow-2xl"
        title="Click to flip ID Card"
        role="region"
        aria-label="Interactive ID Badge"
      >
        {/* White Rounded Card Body */}
        <div className="w-full h-full rounded-3xl p-3 bg-[#f8f8fa] border-2 border-neutral-300 shadow-xl relative flex flex-col justify-between overflow-hidden text-neutral-900">
          {/* Top Punch Hole */}
          <div className="w-12 h-2.5 bg-neutral-900 rounded-full mx-auto mb-2" />

          {/* Front Face */}
          {!isFlipped ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Large Black-and-White Portrait Photo Area */}
              <div className="w-full h-[270px] rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {profile.portraitUrl ? (
                  <img
                    src={profile.portraitUrl}
                    alt={`Portrait of ${profile.name}`}
                    className="absolute inset-0 h-full w-full object-cover grayscale contrast-105"
                  />
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-400 shadow-md">
                      <User className="w-14 h-14" />
                    </div>
                    <div className="w-48 h-20 bg-neutral-800/80 rounded-t-full mt-2 border-t border-neutral-700/40" />
                  </>
                )}

                <div className="absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded bg-black/60 text-neutral-300 border border-neutral-700">
                  MONOCHROME
                </div>
              </div>

              {/* Lower Info Typography */}
              <div className="text-center py-2 space-y-1">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950">
                  {profile.name.toUpperCase()}
                </h3>
                <div className="w-16 h-0.5 bg-neutral-300 mx-auto" />
                <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase">
                  {profile.role}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  {profile.education.status}
                </p>
              </div>

              {/* Bottom Credential Tag */}
              <div className="pt-1 text-center">
                <span className="text-[9px] font-mono px-3 py-1 rounded-full bg-neutral-200 text-neutral-700 font-semibold">
                  ID: PNC-2026 // VERIFIED
                </span>
              </div>
            </div>
          ) : (
            /* Back Face */
            <div className="flex-1 rounded-2xl p-4 bg-[#f8f8fa] flex flex-col justify-between text-neutral-800">
              {/* Magnetic Strip */}
              <div className="w-full h-8 bg-neutral-900 rounded -mx-1" />

              <div className="my-auto space-y-3 text-center py-2">
                <div className="text-sm font-bold tracking-widest text-neutral-900">
                  P N C
                </div>
                <div className="text-[10px] font-mono text-neutral-500">
                  AUTHORIZED DEVELOPER IDENTIFIER
                </div>

                <div className="w-24 h-24 mx-auto p-2 bg-neutral-900 rounded-xl flex items-center justify-center">
                  <QrCode className="w-full h-full text-white" />
                </div>

                <p className="text-[10px] text-neutral-600 font-mono">
                  ISSUED 2026 • SOFTWARE ENGINEERING
                </p>
              </div>

              <div className="text-center text-[9px] font-mono text-neutral-400">
                CLICK TO FLIP FRONT
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};
