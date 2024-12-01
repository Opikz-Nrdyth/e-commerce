import React, { useEffect, useRef } from "react";

const CursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;
    const trail = [];
    const trailLength = 20;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawTrail = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trail.push({ x: mouseX, y: mouseY });
      if (trail.length > trailLength) {
        trail.shift();
      }

      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);

      for (let i = 1; i < trail.length; i++) {
        const p1 = trail[i - 1];
        const p2 = trail[i];
        const midPoint = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      }

      const gradient = ctx.createLinearGradient(
        trail[trail.length - 1].x,
        trail[trail.length - 1].y,
        trail[0].x,
        trail[0].y
      );
      gradient.addColorStop(0, "#ff8e2b");
      gradient.addColorStop(1, "#fff");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      animationFrameId = requestAnimationFrame(drawTrail);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    drawTrail();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        zIndex: "100",
        top: 0,
        left: 0,
        pointerEvents: "none",
        opacity: 0.4,
      }}
    />
  );
};

export default CursorTrail;
