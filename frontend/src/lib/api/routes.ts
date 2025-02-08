const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiRoutes = {
  //auth
  auth: {
    login: `${baseUrl}/auth/login`,
    logout: `${baseUrl}/auth/logout`,
  },
  //pólizas
  polizas: {
    getAll: `${baseUrl}/polizas`,
    getById: (id: string) => `${baseUrl}/polizas/${id}`,
    create: `${baseUrl}/polizas`,
    statistics: `${baseUrl}/polizas/estadisticas`,
    delete: (id: number) => `${baseUrl}/polizas/${id}`,
    //reportes
    reports: {
      excel: `${baseUrl}/polizas/reportes/excel`,
      pdf: `${baseUrl}/polizas/reportes/pdf`,
    }
  },
  //estadísticas
  stats: {
    general: `${baseUrl}/polizas/estadisticas`
  }
} as const;