import api from '../config/api';

export const fetchMaterials = async (filters = {}) => {
  try {
    const response = await api.materials.getMaterials({
      ...filters,
      page: 1,
      limit: 50
    });
    console.log('Materials response:', response); // Add logging
    return response;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

export const fetchFilterOptions = async () => {
  try {
    const response = await api.materials.getFilters();
    console.log('Filter options response:', response); // Add logging
    return response;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};
