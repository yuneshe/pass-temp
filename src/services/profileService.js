import api from '../config/api';

const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Get user activity
  getUserActivity: async () => {
    try {
      const response = await api.get('/api/profile/activity');
      return response.data;
    } catch (error) {
      console.error('Get user activity error:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/api/profile/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Update profile picture
  updateProfilePicture: async (imageUri) => {
    try {
      console.log('Starting profile picture update with URI:', imageUri);
      
      // Create form data
      const formData = new FormData();
      
      // Get the file extension from the URI
      const extension = imageUri.split('.').pop();
      
      // Add the image file to form data with the correct field name
      formData.append('avatar', {
        uri: imageUri,
        type: `image/${extension}`,
        name: `avatar.${extension}`,
      });

      // Make multipart form request
      const response = await api.post('/api/profile/avatar', formData, {
        'Content-Type': 'multipart/form-data',
      });

      console.log('Profile picture update response:', response);
      return response.data;
    } catch (error) {
      console.error('Update profile picture error:', error);
      throw error;
    }
  },
};

export default profileService;
