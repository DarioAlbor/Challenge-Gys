import { IPolicy } from '@/types/poliza';

interface ViewPolicyModalProps {
  policy: IPolicy | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewPolicyModal({ policy, isOpen, onClose }: ViewPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalles de la Póliza</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="font-medium">Compañía:</label>
            <p>{policy.nombre_compania}</p>
          </div>
          <div>
            <label className="font-medium">Número de Póliza:</label>
            <p>{policy.numero_poliza}</p>
          </div>
          <div>
            <label className="font-medium">Fecha de Emisión:</label>
            <p>{new Date(policy.fecha_emision).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="font-medium">Estado:</label>
            <p>{policy.estado === 1 ? 'Activa' : 'Anulada'}</p>
          </div>
          <div>
            <label className="font-medium">Prima:</label>
            <p>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(policy.prima)}</p>
          </div>
          <div>
            <label className="font-medium">Sección:</label>
            <p>{policy.seccion}</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}