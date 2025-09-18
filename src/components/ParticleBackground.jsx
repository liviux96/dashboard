"use client";

import { useEffect, useRef } from "react";

const MAX_PARTICLES = 120;

function createParticles(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.8 + 0.6,
    velocityX: (Math.random() - 0.5) * 0.22,
    velocityY: (Math.random() - 0.5) * 0.22,
    alpha: Math.random() * 0.35 + 0.1,
  }));
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

      const targetCount = Math.min(
        MAX_PARTICLES,
        Math.max(30, Math.floor((innerWidth + innerHeight) / 18)),
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

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(176, 186, 255, ${particle.alpha})`;
        context.fill();
      });

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
