import React, { useEffect, useRef } from 'react';

export const ThreeRibbon: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', handleResize);

    // 3D Nodes for multi-ribbon torus structure
    const nodeCount = 70;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      angle += 0.015;

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.32;

      // Draw two intertwining iridescent ribbons
      for (let ribbon = 0; ribbon < 2; ribbon++) {
        const ribbonOffset = ribbon * Math.PI;
        ctx.beginPath();
        let prevX = 0;
        let prevY = 0;

        for (let i = 0; i <= nodeCount; i++) {
          const t = (i / nodeCount) * Math.PI * 2;
          // Torus knot mathematical curve
          const p = 2;
          const q = 3;
          const r = 0.5 + 0.2 * Math.sin(q * t + angle + ribbonOffset);
          
          const x3d = r * Math.cos(p * t + angle) + mouseX * 0.2;
          const y3d = r * Math.sin(p * t + angle) + mouseY * 0.2;
          const z3d = 0.4 * Math.sin(q * t + angle * 0.8);

          // Perspective projection
          const fov = 1.6;
          const proj = fov / (fov + z3d);
          const px = centerX + x3d * scale * proj;
          const py = centerY + y3d * scale * proj;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            const xc = (prevX + px) / 2;
            const yc = (prevY + py) / 2;
            ctx.quadraticCurveTo(prevX, prevY, xc, yc);
          }

          prevX = px;
          prevY = py;

          // Glowing nodes
          if (i % 6 === 0) {
            ctx.save();
            const nodeGradient = ctx.createRadialGradient(px, py, 1, px, py, 8 * proj);
            if (ribbon === 0) {
              nodeGradient.addColorStop(0, 'rgba(118, 87, 246, 0.9)');
              nodeGradient.addColorStop(1, 'rgba(71, 139, 255, 0)');
            } else {
              nodeGradient.addColorStop(0, 'rgba(83, 214, 176, 0.9)');
              nodeGradient.addColorStop(1, 'rgba(255, 123, 114, 0)');
            }
            ctx.fillStyle = nodeGradient;
            ctx.beginPath();
            ctx.arc(px, py, 8 * proj, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Gradient stroke
        const grad = ctx.createLinearGradient(centerX - scale, centerY - scale, centerX + scale, centerY + scale);
        if (ribbon === 0) {
          grad.addColorStop(0, '#7657F6'); // Violet
          grad.addColorStop(0.5, '#478BFF'); // Electric Blue
          grad.addColorStop(1, '#53D6B0'); // Mint
        } else {
          grad.addColorStop(0, '#FF7B72'); // Coral
          grad.addColorStop(0.6, '#7657F6'); // Violet
          grad.addColorStop(1, '#478BFF'); // Blue
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 4 * window.devicePixelRatio;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = ribbon === 0 ? 'rgba(118, 87, 246, 0.45)' : 'rgba(255, 123, 114, 0.35)';
        ctx.shadowBlur = 18;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        aria-label="3D dynamic Inkloom brand governance ribbon"
      />
    </div>
  );
};
