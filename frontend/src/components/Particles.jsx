import React, { useEffect, useRef } from 'react';

const Particles = ({ color = 'rgba(255,255,255,0.8)' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;
    const DPR = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    ctx.scale(DPR, DPR);

    let particles = [];
    const density = Math.max(Math.floor((width * height) / 12000), 30);
    const linkDistance = Math.min(Math.max(width, height) / 6, 160);

    const mouse = { x: null, y: null, radius: 100 };

    function random(min, max) { return Math.random() * (max - min) + min; }

    function initParticles() {
      particles = [];
      for (let i = 0; i < density; i++) {
        particles.push({
          x: random(0, width),
          y: random(0, height),
          vx: random(-0.4, 0.4),
          vy: random(-0.4, 0.4),
          r: random(1.2, 2.6),
        });
      }
    }

    function resize() {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      const DPR = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      ctx.scale(DPR, DPR);
      initParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // update & draw particles
      for (let p of particles) {
        // move
        p.x += p.vx;
        p.y += p.vy;

        // bounds
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // mouse repulsion
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius + p.r) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.vx += (dx / dist) * force * 0.6;
            p.vy += (dy / dist) * force * 0.6;
          }
        }

        // gentle damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // draw particle
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxLink = linkDistance * (0.6 + (Math.sin(Date.now() / 1000 + i) + 1) / 3);

          // if either near mouse, reduce link strength (disconnect effect)
          let nearMouseFactor = 1;
          if (mouse.x !== null) {
            const da = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            const db = Math.hypot(b.x - mouse.x, b.y - mouse.y);
            if (da < mouse.radius * 0.9 || db < mouse.radius * 0.9) nearMouseFactor = 0.18;
          }

          if (dist < maxLink * nearMouseFactor) {
            const alpha = (1 - dist / (maxLink * nearMouseFactor)) * 0.8;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha * 0.9;
            ctx.lineWidth = 0.8;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    function handleMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function handleLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [color]);

  return (
    <canvas ref={canvasRef} className="particles-canvas absolute inset-0 w-full h-full pointer-events-none" />
  );
};

export default Particles;
