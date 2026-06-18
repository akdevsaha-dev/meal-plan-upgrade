"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveVideoCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const warpBadgeRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: 0, y: 0 });
  const badgePosRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const isClickingRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Sync state with refs to use inside requestAnimationFrame without triggering re-renders
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isClickingRef.current = isClicking;
  }, [isClicking]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update target coordinate ref for interpolation
    mouseRef.current = { x, y };

    // Apply high-performance 3D tilt transformation directly to DOM (no React re-renders)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / rect.height) * -8;
    const rotateY = ((x - centerX) / rect.width) * 8;

    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;

    // Apply spotlight glow style directly
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12), transparent 75%)`;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
    }
    if (badgeRef.current) {
      badgeRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsClicking(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
    
    // Reset properties directly
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
    if (badgeRef.current) {
      badgeRef.current.style.opacity = "0";
    }
  };

  const handleMouseDown = () => {
    setIsClicking(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.5;
    }
  };

  const handleMouseUp = () => {
    setIsClicking(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  };

  // Smooth lerp (linear interpolation) animation loop for the floating cursor
  useEffect(() => {
    let animId: number;
    
    // Align initial position
    badgePosRef.current = { ...mouseRef.current };

    const updateBadge = () => {
      // Badge tracks the pointer with 15% distance closing on each frame
      const dx = mouseRef.current.x - badgePosRef.current.x;
      const dy = mouseRef.current.y - badgePosRef.current.y;
      
      badgePosRef.current.x += dx * 0.15;
      badgePosRef.current.y += dy * 0.15;

      if (badgeRef.current) {
        const targetScale = isClickingRef.current ? 0.8 : isHoveredRef.current ? 1 : 0.5;
        // Use translate3d for hardware-accelerated rendering
        badgeRef.current.style.transform = `translate3d(${badgePosRef.current.x}px, ${badgePosRef.current.y}px, 0) translate(-50%, -50%) scale(${targetScale})`;
      }

      animId = requestAnimationFrame(updateBadge);
    };

    animId = requestAnimationFrame(updateBadge);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full rounded-[2.5rem] bg-neutral-950 overflow-hidden cursor-none shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] border border-neutral-200/5 transition-transform duration-500 ease-out select-none"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Video Content */}
      <video
        ref={videoRef}
        src="/videos/authout.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: isClicking ? "scale(1.05)" : "scale(1)",
        }}
      />

      {/* Glassmorphic border glow overlay */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 pointer-events-none z-20" />

      {/* Radial Highlight Reflection Tracking the Cursor */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500"
      />

      {/* Custom Floating Cursor Follower Badge */}
      <div
        ref={badgeRef}
        className="pointer-events-none absolute z-30 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[9px] tracking-[0.25em] font-semibold uppercase text-white select-none opacity-0 transition-opacity duration-300"
        style={{
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%) scale(0.5)",
        }}
      >
        <span className="animate-pulse">{isClicking ? "WARP" : "CATER"}</span>
      </div>

      {/* Warp Indicator Overlay */}
      <div
        ref={warpBadgeRef}
        className="absolute bottom-6 right-8 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm text-[8px] tracking-widest uppercase font-bold text-white transition-all duration-300 pointer-events-none"
        style={{
          opacity: isClicking ? 1 : 0,
          transform: `translateY(${isClicking ? 0 : 8}px)`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
        <span>WARP SPEED 2.5X</span>
      </div>
    </div>
  );
}
