import { useEffect, useState } from 'react';

export function CursorFollower() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('.pixel-box') ||
        target?.tagName === 'INPUT'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[9999] transition-transform duration-75 ease-out hidden lg:block"
      style={{
        transform: `translate3d(${pos.x - (isHovered ? 20 : 10)}px, ${pos.y - (isHovered ? 20 : 10)}px, 0)`,
      }}
    >
      <div
        className={`rounded-full transition-all duration-200 border ${
          isHovered
            ? 'w-10 h-10 bg-white/10 border-white backdrop-blur-[2px] scale-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]'
            : 'w-5 h-5 bg-white/20 border-white/60'
        }`}
      />
    </div>
  );
}
