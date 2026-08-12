import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate random stars / atmospheric particles
    const particleCount = prefersReducedMotion ? 40 : 120;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.1,
      speedX: (Math.random() - 0.5) * (prefersReducedMotion ? 0.05 : 0.15),
      speedY: (Math.random() - 0.5) * (prefersReducedMotion ? 0.05 : 0.15),
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Grid lines configuration
    const gridSize = 100;
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle orbital/grid structures
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw faint orbitals
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.max(width, height) * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.02)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.max(width, height) * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.02)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
          p.alpha = Math.max(0.1, Math.min(0.7, p.alpha));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
        
        // Add subtle bloom to larger particles
        if (p.size > 1.2) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
        aria-hidden="true"
      />
      {/* Vignette and Atmospheric Depth Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030712_100%)] opacity-80" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] opacity-90" />
    </>
  );
};
