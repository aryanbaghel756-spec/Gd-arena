import React, { useEffect, useRef } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';

/**
 * HexagonGridBackground
 * Renders a subtle, animated honeycomb/hexagonal lattice on an HTML5 canvas.
 * - Low opacity (0.04 - 0.12)
 * - Deep technical aesthetic with soft ambient depth
 * - Reacts gracefully to AI / user speech activity
 * - Mouse parallax/illumination glow
 */
export function HexagonGridBackground() {
  const canvasRef = useRef(null);
  const { activeSpeakerId, isStudentSpeaking } = useDiscussion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width * 0.5, y: height * 0.4, targetX: width * 0.5, targetY: height * 0.4 };

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function handleMouseMove(e) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Hexagon geometric constants
    const radius = 32;
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 2 * radius;
    const rowStep = hexHeight * 0.75;

    // Glowing energy nodes in the grid
    const pulseNodes = [
      { col: 4, row: 3, phase: 0, speed: 0.02, color: 'rgba(244, 63, 94, ' },   // Magenta
      { col: 12, row: 8, phase: 1.5, speed: 0.015, color: 'rgba(139, 92, 246, ' }, // Violet
      { col: 18, row: 4, phase: 3.0, speed: 0.025, color: 'rgba(244, 63, 94, ' },  // Magenta
      { col: 8, row: 14, phase: 4.5, speed: 0.018, color: 'rgba(59, 130, 246, ' },  // Tech blue
      { col: 22, row: 12, phase: 2.2, speed: 0.02, color: 'rgba(139, 92, 246, ' }, // Violet
    ];

    let time = 0;

    function drawHexagon(cx, cy, r) {
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

    function render() {
      time += 0.015;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isSpeakingActive = Boolean(activeSpeakerId || isStudentSpeaking);
      const activityMultiplier = isSpeakingActive ? 1.5 : 1.0;

      const cols = Math.ceil(width / hexWidth) + 2;
      const rows = Math.ceil(height / rowStep) + 2;

      // Draw hex grid lines
      ctx.lineWidth = 1;

      for (let r = 0; r < rows; r++) {
        const y = r * rowStep;
        const xOffset = (r % 2 === 1) ? hexWidth / 2 : 0;

        for (let c = 0; c < cols; c++) {
          const x = c * hexWidth + xOffset;

          // Distance to mouse
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const mouseRadius = 260;
          const mouseGlow = Math.max(0, 1 - Math.sqrt(distSq) / mouseRadius);

          // Subtle wave pulse across grid
          const wave = Math.sin(time * 0.8 * activityMultiplier + (x * 0.003) + (y * 0.003)) * 0.02;
          let alpha = 0.035 + wave + (mouseGlow * 0.09);

          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.015, Math.min(0.2, alpha))})`;
          drawHexagon(x, y, radius - 2);
          ctx.stroke();

          // If close to cursor, fill with faint magenta/violet tint
          if (mouseGlow > 0.3) {
            ctx.fillStyle = `rgba(244, 63, 94, ${mouseGlow * 0.04})`;
            ctx.fill();
          }
        }
      }

      // Draw pulsing energy nodes
      pulseNodes.forEach(node => {
        const x = node.col * hexWidth + ((node.row % 2) * hexWidth) / 2;
        const y = node.row * rowStep;

        if (x < width + 50 && y < height + 50) {
          const pulse = (Math.sin(time * 1.5 * activityMultiplier + node.phase) + 1) * 0.5;
          const currentAlpha = 0.08 + pulse * 0.18 * (isSpeakingActive ? 1.3 : 1.0);

          // Radial glow
          const gradient = ctx.createRadialGradient(x, y, 4, x, y, radius * 2.2);
          gradient.addColorStop(0, `${node.color}${currentAlpha})`);
          gradient.addColorStop(1, `${node.color}0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Hexagon highlight
          ctx.strokeStyle = `${node.color}${currentAlpha * 1.2})`;
          ctx.lineWidth = 1.2;
          drawHexagon(x, y, radius - 2);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSpeakerId, isStudentSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
