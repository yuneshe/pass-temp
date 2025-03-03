import api from '../config/api';

const materialService = {
  // Get all materials with optional filters
  getMaterials: async (filters = {}) => {
    try {
      // Convert null/undefined/empty values to empty string to avoid 'null' in URL
      const cleanFilters = Object.fromEntries(
        Object.entries(filters)
          .filter(([_, v]) => v != null && v !== '' && v !== 0)
          .map(([k, v]) => [k, v.toString()])
      );
      
      // Build query string
      const queryParams = new URLSearchParams(cleanFilters);
      const url = `/api/materials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await api.get(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      
      const data = await response.json();
      
      // Ensure we have an array of materials
      const materials = Array.isArray(data) ? data : [];
      
      // Transform materials to match our component expectations
      return materials.map(material => ({
        id: material.id?.toString() || '',
        title: material.title?.toString() || '',
        image: material.image?.toString() || null,
        author: material.author?.name?.toString() || '',
        price: typeof material.price === 'number' ? material.price : 0,
        rating: typeof material.rating === 'number' ? material.rating : 0,
        downloads: typeof material.downloads === 'number' ? material.downloads : 0,
        category: material.category?.name?.toString() || '',
        fileType: material.file_type?.toString() || 'document',
      }));
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  },

  // Get material details by ID
  getMaterialById: async (id) => {
    try {
      const response = await api.get(`/api/materials/${id}`);
      if (!response.ok) throw new Error('Failed to fetch material');
      const material = await response.json();
      return {
        id: material.id?.toString() || '',
        title: material.title?.toString() || '',
        image: material.image?.toString() || null,
        author: material.author?.name?.toString() || '',
        price: typeof material.price === 'number' ? material.price : 0,
        rating: typeof material.rating === 'number' ? material.rating : 0,
        downloads: typeof material.downloads === 'number' ? material.downloads : 0,
        category: material.category?.name?.toString() || '',
        fileType: material.file_type?.toString() || 'document',
      };
    } catch (error) {
      console.error('Error fetching material:', error);
      return null;
    }
  },

  // Get user's purchased materials
  getPurchasedMaterials: async () => {
    try {
      const response = await api.get('/api/materials/purchased');
      if (!response.ok) throw new Error('Failed to fetch purchased materials');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching purchased materials:', error);
      return [];
    }
  },

  // Download material
  downloadMaterial: async (materialId) => {
    try {
      const response = await api.get(`/api/materials/${materialId}/download`);
      if (!response.ok) throw new Error('Failed to download material');
      return await response.blob();
    } catch (error) {
      console.error('Error downloading material:', error);
      throw error;
    }
  },

  // Rate material
  rateMaterial: async (materialId, rating) => {
    try {
      const response = await api.post(`/api/materials/${materialId}/rate`, { rating });
      if (!response.ok) throw new Error('Failed to rate material');
      return await response.json();
    } catch (error) {
      console.error('Error rating material:', error);
      throw error;
    }
  },

  // Get materials by category
  getMaterialsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/api/categories/${categoryId}/materials`);
      if (!response.ok) throw new Error('Failed to fetch materials by category');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching materials by category:', error);
      return [];
    }
  },

  // Get materials by subject
  getMaterialsBySubject: async (subjectId) => {
    try {
      const response = await api.get(`/api/subjects/${subjectId}/materials`);
      if (!response.ok) throw new Error('Failed to fetch materials by subject');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching materials by subject:', error);
      return [];
    }
  },

  // Search materials
  searchMaterials: async (query) => {
    try {
      const response = await api.get(`/api/materials/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search materials');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching materials:', error);
      return [];
    }
  },
};

export default materialService;
