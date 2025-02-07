export const API_URL = 'http://localhost:3001'; // Ajuste para a URL do seu backend

export const API_ROUTES = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    me: `${API_URL}/auth/me`,
    update: `${API_URL}/auth/update`,
  },
  admin: {
    stats: `${API_URL}/admin/stats`,
  }
}; 