import api from './api';

export const providerService = {
  getProfile: async () => {
    return api.get('/providers/me');
  },

  updateProfile: async (profileData) => {
    return api.put('/providers/me', profileData);
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/providers/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return api.post('/providers/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteDocument: async (documentId) => {
    return api.delete(`/providers/me/documents/${documentId}`);
  },

  submitApplication: async () => {
    return api.post('/providers/me/submit');
  },

  getStatus: async () => {
    return api.get('/providers/me/status');
  },
};
