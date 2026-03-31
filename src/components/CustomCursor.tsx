import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

interface CustomCursorProps {
  color: string;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ color }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Motion values for the mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the trailing effect
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, [role="button"], .interactive-cursor');
      setHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Outer Glow / Aura */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: color,
        }}
        animate={{
          scale: hovered ? 2.5 : 1,
          opacity: hovered ? 0.15 : 0.08,
          width: 80,
          height: 80,
        }}
        className="absolute rounded-full blur-[40px]"
      />

      {/* Main Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: color,
        }}
        animate={{
          scale: hovered ? 1.8 : 1,
          width: clicked ? 32 : 44,
          height: clicked ? 32 : 44,
          borderWidth: hovered ? '1px' : '1.5px',
          opacity: 0.6,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="absolute rounded-full border border-solid"
      />

      {/* Center Dot (Minimalist) */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: color,
        }}
        animate={{
          scale: hovered ? 0.5 : 1,
          opacity: hovered ? 0 : 0.8,
          width: 6,
          height: 6,
        }}
        className="absolute rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
      />

      {/* Hover Reveal Liquid Effect */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              x: smoothX,
              y: smoothY,
              translateX: '-50%',
              translateY: '-50%',
              backgroundColor: color,
            }}
            className="absolute w-24 h-24 rounded-full blur-xl"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
