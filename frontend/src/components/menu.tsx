'use client';
import { useRef, useEffect, useState } from 'react';

interface MenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Menu({ activeSection, onSectionChange }: MenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowArrow(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const menuItems = [
    { id: 'byCompany', label: 'Pólizas por Compañía' },
    { id: 'activeVsInactive', label: 'Activas vs Vencidas' },
    { id: 'byDate', label: 'Distribución por Fechas' },
    { id: 'premiums', label: 'Primas' },
    { id: 'table', label: 'Tabla Dinámica' },
  ];

  return (
    <nav className="bg-white shadow-sm mb-6 rounded-lg relative">
      <div className="flex justify-center items-center py-3">
        <div 
          ref={scrollRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide px-4 max-w-full touch-pan-x snap-x snap-mandatory"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-md transition-colors snap-center min-w-fit ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {showArrow && (
          <div className="absolute right-0 top-0 bottom-0 sm:hidden flex items-center pointer-events-none">
            <div className="w-12 h-full bg-gradient-to-l from-white to-transparent flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-gray-600 animate-pulse"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}