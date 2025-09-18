"use client";

import { useEffect, useRef } from "react";

const MAX_PARTICLES = 140;
const MIN_PARTICLES = 100;

const COLOR_PALETTE = [
  { r: 125, g: 249, b: 255 }, // electric cyan
  { r: 255, g: 44, b: 223 }, // magenta
  { r: 155, g: 93, b: 229 }, // violet
  { r: 45, g: 226, b: 230 }, // mint
  { r: 253, g: 224, b: 71 }, // pale gold
];

function randomParticleSize() {
  const roll = Math.random();
  if (roll > 0.82) {
    return Math.random() * 1.5 + 3.5;
  }
  return Math.random() * 2 + 1;
}

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => {
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 22 + 18; // px per second
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: randomParticleSize(),
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      twinkleDuration: Math.random() * 1.8 + 1.2,
      twinkleOffset: Math.random() * Math.PI * 2,
      glow: Math.random() * 10 + 14,
      color,
    };
  });
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef();
  const lastTimestampRef = useRef();

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

    function step(timestamp) {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const deltaSeconds = Math.min(
        (timestamp - lastTimestampRef.current) / 1000,
        0.05,
      );
      lastTimestampRef.current = timestamp;

      const width = window.innerWidth;
      const height = window.innerHeight;
      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, width, height);

      context.globalCompositeOperation = "lighter";

      particlesRef.current.forEach((particle) => {
        particle.x += particle.velocityX * deltaSeconds;
        particle.y += particle.velocityY * deltaSeconds;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const { r, g, b } = particle.color;
        const phase =
          ((timestamp / 1000) / particle.twinkleDuration) * Math.PI * 2 +
          particle.twinkleOffset;
        const alpha = 0.4 + ((Math.sin(phase) + 1) / 2) * 0.6;
        const fill = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        context.beginPath();
        context.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        context.shadowBlur = particle.glow;
        context.fillStyle = fill;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.shadowBlur = 0;
      context.shadowColor = "transparent";
      context.globalCompositeOperation = "source-over";

      frameRef.current = requestAnimationFrame(step);
    }

    resizeCanvas();
    frameRef.current = requestAnimationFrame(step);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resizeCanvas);
      lastTimestampRef.current = undefined;
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
