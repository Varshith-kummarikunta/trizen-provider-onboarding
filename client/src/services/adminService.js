import api from './api';

export const adminService = {
  getStats: async () => {
    return api.get('/admin/dashboard/stats');
  },

  getProviders: async (params = {}) => {
    return api.get('/admin/providers', { params });
  },

  getProviderById: async (id) => {
    return api.get(`/admin/providers/${id}`);
  },

  approveProvider: async (id) => {
    return api.patch(`/admin/providers/${id}/approve`);
  },

  rejectProvider: async (id, remarks) => {
    return api.patch(`/admin/providers/${id}/reject`, { remarks });
  },
};
