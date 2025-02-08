import { apiRoutes } from './routes';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    window.location.href = '/';
    throw new Error('No hay token de autenticación');
  }

  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  return response;
};

export const fetchStats = async () => {
  try {
    const response = await fetchWithAuth(apiRoutes.polizas.statistics);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en fetchStats:', error);
    throw error;
  }
};