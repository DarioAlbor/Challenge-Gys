'use client';
import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
} from 'chart.js';
import { Bar, Pie, Chart as ChartJS2 } from 'react-chartjs-2';
import PoliciesTable from './PoliciesTable';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { apiRoutes } from '@/lib/api/routes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LineController,
  BarController
);

interface DashboardChartsProps {
  stats: {
    policiesByCompany: any[];
    activeVsInactive: any;
    policiesByDate: Array<{
      date: string;
      count: number;
      premium: number;
    }>;
    premiumStats: {
      byCompany: Array<{ company: string; total: number }>;
      total: number;
    };
  };
  activeSection: string;
}

export default function DashboardCharts({ stats, activeSection }: DashboardChartsProps) {
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const policiesByCompanyData = {
    labels: stats.policiesByCompany.map(item => item.company),
    datasets: [{
      label: 'Pólizas por Compañía',
      data: stats.policiesByCompany.map(item => item.count),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  };

  const activeVsInactiveData = {
    labels: ['Activas', 'Vencidas'],
    datasets: [{
      data: [stats.activeVsInactive.active, stats.activeVsInactive.inactive],
      backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
    }]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const premiumsData = {
    labels: stats.premiumStats.byCompany.map(item => item.company),
    datasets: [
      {
        label: 'Prima por Compañía',
        data: stats.premiumStats.byCompany.map(item => item.total),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  const premiumsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Prima Total: ${formatCurrency(stats.premiumStats.total)}`
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Prima: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };

  const filteredDateData = useMemo(() => {
    if (!dateFilters.startDate && !dateFilters.endDate) {
      return stats.policiesByDate;
    }

    return stats.policiesByDate.filter(item => {
      const itemDate = new Date(item.date + '-01');
      const start = dateFilters.startDate ? new Date(dateFilters.startDate) : null;
      const end = dateFilters.endDate ? new Date(dateFilters.endDate) : null;

      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  }, [stats.policiesByDate, dateFilters]);

  const byDateData = {
    labels: filteredDateData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Cantidad de Pólizas',
        data: filteredDateData.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Prima Total',
        data: filteredDateData.map(item => item.premium),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
        type: 'line' as const,
        yAxisID: 'y1'
      }
    ]
  };

  const byDateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Pólizas por Fecha'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Pólizas: ${context.raw}`;
            }
            return `Prima: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Cantidad de Pólizas'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Prima Total'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
    }
  };

  const handleDownload = async (format: 'xlsx' | 'pdf') => {
    try {
      let reportData = {
        activeSection,
        title: '',
        labels: [],
        datasets: []
      };

      switch (activeSection) {
        case 'table':
          const policiesData = await fetchWithAuth(apiRoutes.polizas.getAll);
          const policies = await policiesData.json();
          
          reportData = {
            ...reportData,
            title: 'Listado de Pólizas',
            labels: ['Compañía', 'Número', 'Fecha', 'Estado', 'Prima', 'Sección'],
            datasets: [{
              label: 'Pólizas',
              data: policies.map((policy: any) => [
                policy.nombre_compania,
                policy.numero_poliza,
                new Date(policy.fecha_emision).toLocaleDateString(),
                policy.estado === 1 ? 'Activa' : 'Anulada',
                new Intl.NumberFormat('es-AR', { 
                  style: 'currency', 
                  currency: 'ARS' 
                }).format(policy.prima),
                policy.seccion
              ])
            }]
          };
          break;
        case 'byCompany':
          reportData = {
            ...reportData,
            title: 'Pólizas por Compañía',
            labels: policiesByCompanyData.labels,
            datasets: policiesByCompanyData.datasets
          };
          break;
        case 'activeVsInactive':
          reportData = {
            ...reportData,
            title: 'Pólizas Activas vs Vencidas',
            labels: activeVsInactiveData.labels,
            datasets: activeVsInactiveData.datasets
          };
          break;
        case 'byDate':
          reportData = {
            ...reportData,
            title: 'Distribución de Pólizas por Fecha',
            labels: byDateData.labels,
            datasets: byDateData.datasets
          };
          break;
        case 'premiums':
          reportData = {
            ...reportData,
            title: 'Primas por Compañía',
            labels: premiumsData.labels,
            datasets: premiumsData.datasets
          };
          break;
      }

      const response = await fetchWithAuth(
        format === 'xlsx' ? apiRoutes.polizas.reports.excel : apiRoutes.polizas.reports.pdf,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        }
      );

      if (!response.ok) throw new Error('Error al descargar el reporte');

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      
      // se crea una url temporal
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${activeSection}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // se limpia la url temporal
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  const ExportButtons = () => (
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={() => handleDownload('xlsx')}
        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-500 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
      <button
        onClick={() => handleDownload('pdf')}
        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-500 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF
      </button>
    </div>
  );

  const renderChart = () => {
    switch (activeSection) {
      case 'byCompany':
        return (
          <div>
            <ExportButtons />
            <Bar data={policiesByCompanyData} />
          </div>
        );
      case 'activeVsInactive':
        return (
          <div>
            <ExportButtons />
            <Pie data={activeVsInactiveData} />
          </div>
        );
      case 'byDate':
        return (
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={dateFilters.startDate}
                  onChange={(e) => setDateFilters(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={dateFilters.endDate}
                  onChange={(e) => setDateFilters(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setDateFilters({ startDate: '', endDate: '' })}
                  className="p-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
            <ExportButtons />
            <ChartJS2
              type="bar"
              data={byDateData}
              options={byDateOptions}
            />
          </div>
        );
      case 'premiums':
        return (
          <div>
            <ExportButtons />
            <Bar data={premiumsData} options={premiumsOptions} />
          </div>
        );
      case 'table':
        return (
          <div>
            <ExportButtons />
            <PoliciesTable />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {renderChart()}
    </div>
  );
}