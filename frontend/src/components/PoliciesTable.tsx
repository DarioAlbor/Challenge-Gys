'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { apiRoutes } from '@/lib/api/routes';
import { useNotification } from '@/components/notification';
import ViewPolicyModal from './ViewPolicyModal';

interface Policy {
  id: number;
  id_compania: number;
  nombre_compania: string;
  numero_poliza: number;
  fecha_emision: string;
  estado: number;
  prima: number;
  seccion: string;
}

export default function PoliciesTable() {
  const { showNotification } = useNotification();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    compania: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    seccion: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = window.innerWidth >= 768 ? 10 : 5;

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetchWithAuth(apiRoutes.polizas.getAll);
      if (!response.ok) throw new Error('Error al cargar pólizas');
      const data = await response.json();
      setPolicies(data);
    } catch {
      console.error('Error al cargar pólizas');
    }
  };

  // se formatea la fecha porque viene como iso
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getEstadoLabel = (estado: number) => estado === 1 ? 'Activa' : 'Anulada';
  
  const formatPrima = (prima: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(prima);
  };

  // el filtrado de datos
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const searchFields = [
        policy.nombre_compania,
        policy.numero_poliza.toString(),
        policy.seccion,
        getEstadoLabel(policy.estado)
      ].join(' ').toLowerCase();

      const matchesSearch = searchFields.includes(searchTerm.toLowerCase());

      const matchesFilters = (
        (!filters.compania || policy.nombre_compania === filters.compania) &&
        (!filters.estado || policy.estado === (filters.estado === 'activa' ? 1 : 0)) &&
        (!filters.seccion || policy.seccion === filters.seccion) &&
        (!filters.fechaInicio || new Date(policy.fecha_emision) >= new Date(filters.fechaInicio)) &&
        (!filters.fechaFin || new Date(policy.fecha_emision) <= new Date(filters.fechaFin))
      );

      return matchesSearch && matchesFilters;
    });
  }, [policies, searchTerm, filters]);

  // la paginacion
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar esta póliza?')) return;

    try {
      const response = await fetchWithAuth(apiRoutes.polizas.delete(id), {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Póliza eliminada exitosamente', 'success');
        fetchPolicies();
      } else {
        throw new Error('Error al eliminar la póliza');
      }
    } catch {
      showNotification('Error al eliminar la póliza', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* un buscador general, solo hay discordia en las fechas porque lee el iso */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar en cualquier campo..."
          className="w-full p-3 pl-10 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg 
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          className="p-2 border rounded-lg"
          value={filters.compania}
          onChange={(e) => setFilters({...filters, compania: e.target.value})}
        >
          <option value="">Todas las compañías</option>
          {[...new Set(policies.map(p => p.nombre_compania))].map(comp => (
            <option key={comp} value={comp}>{comp}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded-lg"
          value={filters.estado}
          onChange={(e) => setFilters({...filters, estado: e.target.value})}
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="anulada">Anulada</option>
        </select>

        <input
          type="date"
          className="p-2 border rounded-lg"
          value={filters.fechaInicio}
          onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
        />

        <input
          type="date"
          className="p-2 border rounded-lg"
          value={filters.fechaFin}
          onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
        />

        <select
          className="p-2 border rounded-lg"
          value={filters.seccion}
          onChange={(e) => setFilters({...filters, seccion: e.target.value})}
        >
          <option value="">Todas las secciones</option>
          {[...new Set(policies.map(p => p.seccion))].map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Compañía</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prima</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sección</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPolicies.map((policy, index) => (
                <tr key={policy.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{policy.nombre_compania}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{policy.numero_poliza}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{formatDate(policy.fecha_emision)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      policy.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {getEstadoLabel(policy.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{formatPrima(policy.prima)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{policy.seccion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* la paginacion pero mejorada */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
          <div className="flex items-center text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredPolicies.length)} de {filteredPolicies.length}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-white border rounded-md">
              {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <ViewPolicyModal
        policy={selectedPolicy}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPolicy(null);
        }}
      />
    </div>
  );
}