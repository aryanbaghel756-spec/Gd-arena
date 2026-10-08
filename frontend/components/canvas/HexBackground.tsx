'use client';

import React, { useEffect, useRef } from 'react';

interface HexBackgroundProps {
  activeSpeakerColor?: string;
  isSpeaking?: boolean;
}

export function HexBackground({ activeSpeakerColor, isSpeaking = false }: HexBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = true;
    let lastFrameTime = performance.now();
    const fpsLimit = 60;
    const frameInterval = 1000 / fpsLimit;

    // Detect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse tracking with lerp
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false
    };

    // Hexagon geometric constants
    const radius = 34; // hex outer radius
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;
    const rowStep = hexHeight * 0.75;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        drawStaticGrid();
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    }

    function onMouseLeave() {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    }

    function onVisibilityChange() {
      isTabVisible = !document.hidden;
      if (isTabVisible && !prefersReducedMotion) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    resize();

    // Helper: draw single flat-top regular hexagon
    function drawHexagon(cx: number, cy: number, r: number) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    // Static fallback for reduced motion
    function drawStaticGrid() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / hexWidth) + 3;
      const rows = Math.ceil(height / rowStep) + 3;

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 30, 45, 0.08)';

      for (let r = 0; r < rows; r++) {
        const cy = r * rowStep;
        const xOffset = r % 2 === 1 ? hexWidth / 2 : 0;
        for (let c = 0; c < cols; c++) {
          const cx = c * hexWidth + xOffset;
          drawHexagon(cx, cy, radius - 2);
          ctx.stroke();
        }
      }
    }

    let time = 0;

    function render(now: number) {
      if (!isTabVisible || !ctx) return;

      const delta = now - lastFrameTime;
      if (delta >= frameInterval) {
        lastFrameTime = now - (delta % frameInterval);

        time += 0.018;

        // Smooth mouse lerp
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;

        ctx.clearRect(0, 0, width, height);

        // Center pulse origin
        const pulseCycle = (time * 0.4) % 1; // 0 to 1 loop every ~2.5s
        const pulseRadius = pulseCycle * (Math.max(width, height) * 0.85);
        const pulseThickness = 140;

        const cols = Math.ceil(width / hexWidth) + 2;
        const rows = Math.ceil(height / rowStep) + 2;

        const centerX = width * 0.5;
        const centerY = height * 0.45;

        // Slow cycling RGB shimmer angle (accent strictly on edges)
        const rgbHue = Math.floor((time * 22) % 360);

        const mouseRadius = 220; // 220px falloff required

        for (let r = 0; r < rows; r++) {
          const cy = r * rowStep;
          const xOffset = r % 2 === 1 ? hexWidth / 2 : 0;

          for (let c = 0; c < cols; c++) {
            const cx = c * hexWidth + xOffset;

            // Distance to mouse
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const distMouse = Math.sqrt(dx * dx + dy * dy);
            const mouseProximity = Math.max(0, 1 - distMouse / mouseRadius);

            // Distance to center pulse
            const cdx = cx - centerX;
            const cdy = cy - centerY;
            const distCenter = Math.sqrt(cdx * cdx + cdy * cdy);
            const distToPulse = Math.abs(distCenter - pulseRadius);
            const pulseFactor = Math.max(0, 1 - distToPulse / pulseThickness) * (1 - pulseCycle);

            // Combine activity
            const speechBoost = isSpeaking ? 0.35 : 0;
            const totalActivity = mouseProximity + pulseFactor * 0.6 + speechBoost;

            // Base subtle lattice opacity
            const baseAlpha = 0.045;

            // Mouse glow intensity
            if (mouseProximity > 0.05) {
              // Radial fill inside hex near cursor
              const fillAlpha = Math.min(0.28, mouseProximity * 0.22);
              const fillGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 1.2);
              fillGrad.addColorStop(0, `rgba(255, 196, 0, ${fillAlpha * 0.9})`); // Yellow core
              fillGrad.addColorStop(0.65, `rgba(255, 30, 45, ${fillAlpha * 0.6})`); // Red falloff
              fillGrad.addColorStop(1, 'rgba(184, 0, 16, 0)');

              ctx.fillStyle = fillGrad;
              drawHexagon(cx, cy, radius - 1.5);
              ctx.fill();
            }

            // Draw Hexagon Stroke
            drawHexagon(cx, cy, radius - 2);

            if (mouseProximity > 0.2) {
              // Bright lit near cursor: yellow/red
              const strokeAlpha = Math.min(0.85, 0.2 + mouseProximity * 0.65);
              ctx.lineWidth = 1.35;
              ctx.strokeStyle = `rgba(255, 196, 0, ${strokeAlpha})`;
              ctx.stroke();

              // Extra corner glow accent
              if (mouseProximity > 0.5) {
                ctx.lineWidth = 2.2;
                ctx.strokeStyle = `rgba(255, 30, 45, ${mouseProximity * 0.5})`;
                ctx.stroke();
              }
            } else if (pulseFactor > 0.15) {
              // Wave pulse traveling across grid
              const pulseAlpha = Math.min(0.45, pulseFactor * 0.35);
              ctx.lineWidth = 1.1;
              ctx.strokeStyle = `rgba(255, 30, 45, ${pulseAlpha})`;
              ctx.stroke();
            } else {
              // Ambient lattice: predominantly deep red (#ff1e2d / #b80010)
              // with subtle slow-cycling RGB shimmer accent on occasional hexes (1 in 7)
              const isShimmerHex = (c * 7 + r * 11) % 9 === 0;

              if (isShimmerHex) {
                // Subtle RGB edge shimmer accent (non-dominant)
                ctx.lineWidth = 1;
                ctx.strokeStyle = `hsla(${rgbHue}, 70%, 55%, 0.12)`;
                ctx.stroke();
              } else {
                ctx.lineWidth = 0.85;
                ctx.strokeStyle = `rgba(255, 30, 45, ${baseAlpha})`;
                ctx.stroke();
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSpeakerColor, isSpeaking]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, #11090d 0%, #07070a 65%, #050406 100%)'
        }}
      />
      {/* Screen Vignette for cinematic focus */}
      <div className="screen-vignette" />
      {/* Fine Film Grain Overlay */}
      <div className="film-grain" />
    </>
  );
}
