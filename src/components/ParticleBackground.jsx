"use client";

import { useEffect, useRef } from "react";

const MAX_PARTICLES = 120;
const MIN_PARTICLES = 80;

const COLOR_PALETTE = [
  { r: 206, g: 180, b: 255 }, // lavender
  { r: 148, g: 247, b: 255 }, // cyan / mint
  { r: 255, g: 153, b: 233 }, // magenta
  { r: 255, g: 219, b: 173 }, // pale gold
];

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => {
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 1,
      velocityX: (Math.random() - 0.5) * 0.12,
      velocityY: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.25 + 0.08,
      color,
    };
  });
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const context = canvas.getContext("2d");

    function resizeCanvas() {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(ratio, ratio);

      const estimatedCount = Math.floor((innerWidth + innerHeight) / 22);
      const targetCount = Math.max(
        MIN_PARTICLES,
        Math.min(MAX_PARTICLES, estimatedCount),
      );

      if (particlesRef.current.length !== targetCount) {
        particlesRef.current = createParticles(targetCount, innerWidth, innerHeight);
      } else {
        particlesRef.current.forEach((particle) => {
          if (particle.x > innerWidth || particle.y > innerHeight) {
            particle.x = Math.random() * innerWidth;
            particle.y = Math.random() * innerHeight;
          }
        });
      }
    }

    function step() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const { r, g, b } = particle.color;
        const fill = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`;
        context.beginPath();
        context.shadowColor = `rgba(${r}, ${g}, ${b}, ${particle.alpha * 1.6})`;
        context.shadowBlur = 12;
        context.fillStyle = fill;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.shadowBlur = 0;
      context.shadowColor = "transparent";

      frameRef.current = requestAnimationFrame(step);
    }

    resizeCanvas();
    step();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
