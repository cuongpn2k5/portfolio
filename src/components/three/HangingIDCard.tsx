import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import type { ProfileData } from '../../types';
import { IDCard3D } from './IDCard3D';
import { IDCardFallback } from './IDCardFallback';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIntroTransition } from '../../hooks/useIntroTransition';
import { CARD_GRAVITY } from './cardPhysics';

interface HangingIDCardProps {
  profile: ProfileData;
  entrancePending?: boolean;
}

class CardSceneBoundary extends React.Component<
  { profile: ProfileData; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-card-scene-fallback className="w-full h-full flex items-center justify-center pointer-events-auto">
          <IDCardFallback profile={this.props.profile} />
        </div>
      );
    }
    return this.props.children;
  }
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const HangingIDCard: React.FC<HangingIDCardProps> = ({ profile, entrancePending: pendingEntrance }) => {
  const [hasWebGL] = useState<boolean>(() => checkWebGLSupport());
  const prefersReducedMotion = useReducedMotion();
  const [isInteractive, setIsInteractive] = useState(false);
  const { cardEntranceTrigger, isIntroActive } = useIntroTransition();
  // Remember the pending entrance while Rapier initializes asynchronously.
  const [entrancePending] = useState(pendingEntrance ?? isIntroActive);

  // Use accessible fallback if WebGL is unavailable or user requested reduced motion
  if (!hasWebGL || prefersReducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center pointer-events-auto">
        <IDCardFallback profile={profile} />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full select-none ${
        isInteractive ? 'pointer-events-auto cursor-grab' : 'pointer-events-none'
      }`}
    >
      <CardSceneBoundary profile={profile}>
        <Suspense fallback={<IDCardFallback profile={profile} />}>
          <Canvas
            camera={{ position: [0, 0, 7.8], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full !touch-none"
          >
            {/* Refined Studio Lighting */}
            <ambientLight intensity={1.6} />
            <directionalLight position={[4, 6, 5]} intensity={2.4} color="#ffffff" />
            <directionalLight position={[-4, 2, 4]} intensity={1.1} color="#f2f2fa" />
            <directionalLight position={[0, -4, 3]} intensity={0.6} color="#ffffff" />
            <pointLight position={[0, 4, 3]} intensity={1.2} color="#ffffff" />

            {/* Keep asynchronous Rapier initialization inside the Canvas. */}
            <Suspense fallback={null}>
              {/* The drop is stepped explicitly by the existing fixed-step loop. */}
              <Physics paused gravity={[0, -CARD_GRAVITY, 0]} timeStep={1 / 240}>
                <IDCard3D
                  profile={profile}
                  entranceTrigger={cardEntranceTrigger}
                  isIntroActive={isIntroActive}
                  entrancePending={entrancePending}
                  onInteractionChange={setIsInteractive}
                />
              </Physics>
            </Suspense>
          </Canvas>
        </Suspense>
      </CardSceneBoundary>
    </div>
  );
};
