'use client';
import { useState } from 'react';
import { useNotification } from './notification';
import { COMPANIAS, SECCIONES, Poliza, Compania, Seccion } from '@/types/poliza';

interface ModalAddPolizaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poliza: Poliza) => Promise<void>;
}

export default function ModalAddPoliza({ isOpen, onClose, onSubmit }: ModalAddPolizaProps) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const poliza: Poliza = {
      id_compania: parseInt(formData.get('id_compania') as string),
      nombre_compania: formData.get('nombre_compania') as Compania,
      numero_poliza: parseInt(formData.get('numero_poliza') as string),
      fecha_emision: formData.get('fecha_emision') as string,
      estado: parseInt(formData.get('estado') as string) as 0 | 1,
      prima: parseInt(formData.get('prima') as string),
      seccion: formData.get('seccion') as Seccion,
    };

    try {
      await onSubmit(poliza);
      showNotification('Póliza creada exitosamente', 'success');
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'Error al crear la póliza', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Nueva Póliza</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Compañía</label>
            <select
              name="nombre_compania"
              required
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const select = e.currentTarget.form?.elements.namedItem('id_compania') as HTMLInputElement;
                if (select) {
                  select.value = (COMPANIAS.indexOf(e.target.value as Compania) + 1).toString();
                }
              }}
            >
              <option value="">Seleccione una compañía</option>
              {COMPANIAS.map((compania, index) => (
                <option key={index} value={compania}>
                  {compania}
                </option>
              ))}
            </select>
            <input type="hidden" name="id_compania" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Número de Póliza</label>
            <input
              type="number"
              name="numero_poliza"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Emisión</label>
            <input
              type="date"
              name="fecha_emision"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select name="estado" required className="w-full p-2 border rounded">
              <option value="1">Activa</option>
              <option value="0">Anulada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prima</label>
            <input
              type="number"
              name="prima"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sección</label>
            <select name="seccion" required className="w-full p-2 border rounded">
              <option value="">Seleccione una sección</option>
              {SECCIONES.map((seccion, index) => (
                <option key={index} value={seccion}>
                  {seccion}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}