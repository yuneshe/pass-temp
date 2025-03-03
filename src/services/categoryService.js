import api from '../config/api';

const categoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      return await api.get('/api/categories');
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      return await api.get(`/api/categories/${categoryId}`);
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  },

  // Get subjects by category
  getSubjectsByCategory: async (categoryId) => {
    try {
      return await api.get(`/api/categories/${categoryId}/subjects`);
    } catch (error) {
      console.error('Get subjects by category error:', error);
      throw error;
    }
  },

  // Get levels by category
  getLevelsByCategory: async (categoryId) => {
    try {
      return await api.get(`/api/categories/${categoryId}/levels`);
    } catch (error) {
      console.error('Get levels by category error:', error);
      throw error;
    }
  }
};

export default categoryService;
