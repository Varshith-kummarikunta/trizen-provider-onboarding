import api from './api';

export const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (name, email, password) => {
    return api.post('/auth/register', { name, email, password });
  },

  getMe: async () => {
    return api.get('/auth/me');
  },
};
