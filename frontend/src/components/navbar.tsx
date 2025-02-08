'use client';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { apiRoutes } from '@/lib/api/routes';

interface NavbarProps {
  onNewPolicy: () => void;
}

export default function Navbar({ onNewPolicy }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetchWithAuth(apiRoutes.auth.logout, {
        method: 'POST'
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-gray-800 rounded-lg">
      <div className="flex h-16 items-center justify-between">
        {/* ACA EL LOGO */}
        <div className="flex items-center h-full">
          <div className="h-full flex items-center px-4">
            <svg 
              className="h-8 w-auto"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 640 512"
              fill="#FFD43B"
            >
              <path d="M171.3 96L224 96l0 96-112.7 0 30.4-75.9C146.5 104 158.2 96 171.3 96zM272 192l0-96 81.2 0c9.7 0 18.9 4.4 25 12l67.2 84L272 192zm256.2 1L428.2 68c-18.2-22.8-45.8-36-75-36L171.3 32c-39.3 0-74.6 23.9-89.1 60.3L40.6 196.4C16.8 205.8 0 228.9 0 256L0 368c0 17.7 14.3 32 32 32l33.3 0c7.6 45.4 47.1 80 94.7 80s87.1-34.6 94.7-80l130.7 0c7.6 45.4 47.1 80 94.7 80s87.1-34.6 94.7-80l33.3 0c17.7 0 32-14.3 32-32l0-48c0-65.2-48.8-119-111.8-127zM434.7 368a48 48 0 1 1 90.5 32 48 48 0 1 1 -90.5-32zM160 336a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
            </svg>
          </div>
        </div>

        {/* SECCION TITULOS */}
        <div className="flex-1 px-1">
          <span className="text-white text-sm font-medium">
            Dashboard
          </span>
        </div>

        {/* SECCION BOTONES */}
        <div className="flex h-full">
          <button
            onClick={handleLogout}
            className="h-full px-6 bg-red-600 text-sm font-medium text-white hover:bg-red-500 transition-colors border-r border-gray-800"
          >
            Cerrar sesión
          </button>
          <button
            onClick={onNewPolicy}
            className="h-full px-6 bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors rounded-r-lg"
          >
            Nueva Póliza
          </button>
        </div>
      </div>
    </nav>
  );
}