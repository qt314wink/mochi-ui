import React, { useRef, useEffect } from 'react';

// Dynamic gradient mesh background using 2D canvas
// Slow-moving pastel color fields that respond to cursor position
export const AtmosphereCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouse);

    let time = 0;
    const draw = () => {
      time += 0.003;
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Create gradient based on time and mouse position
      const cx1 = w * (0.3 + Math.sin(time) * 0.1 + mx * 0.1);
      const cy1 = h * (0.3 + Math.cos(time * 0.7) * 0.1 + my * 0.1);
      const cx2 = w * (0.7 + Math.cos(time * 0.8) * 0.1 + (1 - mx) * 0.1);
      const cy2 = h * (0.6 + Math.sin(time * 0.6) * 0.1 + (1 - my) * 0.1);

      const grad = ctx.createRadialGradient(cx1, cy1, w * 0.2, cx2, cy2, w * 0.8);

      // Pastel palette that shifts over time
      const r1 = 200 + Math.sin(time) * 30;
      const g1 = 220 + Math.cos(time * 0.8) * 20;
      const b1 = 240 + Math.sin(time * 1.2) * 15;

      const r2 = 240 + Math.cos(time * 0.9) * 15;
      const g2 = 210 + Math.sin(time * 1.1) * 25;
      const b2 = 220 + Math.cos(time * 0.7) * 20;

      const r3 = 220 + Math.sin(time * 1.3) * 20;
      const g3 = 240 + Math.cos(time) * 15;
      const b3 = 200 + Math.sin(time * 0.9) * 30;

      grad.addColorStop(0, `rgb(${r1 | 0}, ${g1 | 0}, ${b1 | 0})`);
      grad.addColorStop(0.5, `rgb(${r2 | 0}, ${g2 | 0}, ${b2 | 0})`);
      grad.addColorStop(1, `rgb(${r3 | 0}, ${g3 | 0}, ${b3 | 0})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Add subtle noise texture
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const s = Math.random() * 2;
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
};

export default AtmosphereCanvas;
