"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltedCard({
  children,
  className = "",
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Valores del mouse
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Configuramos la física del resorte para que el movimiento sea suave
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transformamos la posición del mouse en grados de rotación
  // Ajusta los valores "-5" y "5" para hacer el efecto más o menos exagerado
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      {/* Esto ayuda a que el efecto 3D se note más */}
      <div style={{ transform: "translateZ(50px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
}
