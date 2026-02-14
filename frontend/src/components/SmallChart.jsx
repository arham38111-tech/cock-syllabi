import React, { useEffect, useRef } from 'react';

const SmallChart = ({ data = [], color = '#2563EB', height = 80 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = height;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, w, h);

    if (!data || data.length === 0) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(1, max - min);

    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * (w - 8) + 4;
      const y = h - ((val - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '22');
    grad.addColorStop(1, color + '04');
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }, [data, color, height]);

  return <canvas ref={ref} style={{ width: '100%', height }} />;
};

export default SmallChart;
