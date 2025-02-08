'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { apiRoutes } from '@/lib/api/routes';
import DashboardCharts from '@/components/dashboardCharts';
import ModalAddPoliza from '@/components/modalAddPoliza';
import Menu from '../../components/menu';
import { useNotification } from '@/components/notification';
import Navbar from '@/components/navbar';
import { IPolicyCreate } from '@/types/poliza';

interface PremiumByCompany {
  company: string;
  total: number;
}

interface PremiumStats {
  byCompany: PremiumByCompany[];
  total: number;
}

interface PolicyByDate {
  date: string;
  count: number;
  premium: number;
}

interface PolicyByCompany {
  company: string;
  count: number;
}

interface ActiveVsInactive {
  active: number;
  inactive: number;
}

interface Stats {
  policiesByCompany: PolicyByCompany[];
  activeVsInactive: ActiveVsInactive;
  policiesByDate: PolicyByDate[];
  premiumStats: PremiumStats;
}

export default function Dashboard() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('byCompany');
  const [stats, setStats] = useState<Stats>({
    policiesByCompany: [],
    activeVsInactive: {
      active: 0,
      inactive: 0
    },
    policiesByDate: [],
    premiumStats: {
      byCompany: [],
      total: 0
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth(apiRoutes.polizas.statistics);
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCreatePoliza = async (poliza: IPolicyCreate) => {
    try {
      const response = await fetchWithAuth(apiRoutes.polizas.create, {
        method: 'POST',
        body: JSON.stringify(poliza),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la póliza');
      }

      const data = await response.json();
      
      setIsModalOpen(false);
      
      // se hace un recargo silencioso de stats
      const fetchStats = async () => {
        const statsResponse = await fetchWithAuth(apiRoutes.polizas.statistics);
        if (!statsResponse.ok) throw new Error('Error al cargar estadísticas');
        const statsData = await statsResponse.json();
        setStats(statsData);
      };
      
      await fetchStats();
      
      showNotification(data.message, 'success');
    } catch (error: unknown) {
      const err = error as Error;
      showNotification(err.message || 'Error al crear la póliza', 'error');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <Navbar onNewPolicy={() => setIsModalOpen(true)} />
      <Menu 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <DashboardCharts 
        stats={stats} 
        activeSection={activeSection}
      />
      <ModalAddPoliza
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePoliza}
      />
    </div>
  );
}