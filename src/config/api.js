import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL configuration
const API_URLS = {
  simulator: {
    local: 'https://srv681018.hstgr.cloud/api',
    production: 'https://srv681018.hstgr.cloud/api',
  },
  device: {
    local: 'http://192.168.8.101:8000/api',
    production: 'https://srv681018.hstgr.cloud/api',
  }
};

// Current configuration state
let currentConfig = {
  environment: 'production',
  mode: Platform.OS === 'ios' ? 'simulator' : 'device'
};

// Get the stored auth token
const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('@auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Function to get the current API URL
export const getApiUrl = async () => {
  try {
    const storedEnvironment = await AsyncStorage.getItem('apiEnvironment');
    const storedMode = await AsyncStorage.getItem('apiMode');

    if (storedEnvironment && storedMode) {
      currentConfig = {
        environment: storedEnvironment,
        mode: storedMode,
      };
    }

    return API_URLS[currentConfig.mode][currentConfig.environment];
  } catch (error) {
    console.error('Error getting API URL:', error);
    return API_URLS.device.local; // Default fallback
  }
};

// Function to get base URL (without /api)
export const getBaseUrl = async () => {
  const apiUrl = await getApiUrl();
  return apiUrl.replace('/api', '');
};

// Function to switch API configuration
export const switchApiConfig = async (environment, mode) => {
  if (!Object.keys(API_URLS[mode]).includes(environment)) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  currentConfig = { environment, mode };
  console.log('API Config updated:', currentConfig);
  
  await AsyncStorage.setItem('apiEnvironment', environment);
  await AsyncStorage.setItem('apiMode', mode);
};

// Initialize configuration from storage
export const initializeApiConfig = async () => {
  try {
    const environment = await AsyncStorage.getItem('apiEnvironment');
    const mode = await AsyncStorage.getItem('apiMode');
    
    if (environment && mode) {
      currentConfig = { environment, mode };
    }
    
    console.log('Current API configuration:', currentConfig);
  } catch (error) {
    console.error('Error loading API configuration:', error);
  }
};

// Token and user management
let authToken = null;
let currentUser = null;

export const setAuthToken = async (token) => {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem('@auth_token', token);
  } else {
    await AsyncStorage.removeItem('@auth_token');
  }
};

export const clearAuthToken = async () => {
  authToken = null;
  currentUser = null;
  await AsyncStorage.removeItem('@auth_token');
};

export const getCurrentUser = () => currentUser;

export const getHeaders = async () => {
  const token = authToken || await AsyncStorage.getItem('@auth_token');
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Constants for API configuration
const API_TIMEOUT = 30000; // Increased to 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make a request with retry logic
const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  try {
    const headers = await getHeaders();
    options.headers = { ...headers, ...options.headers };
    
    const response = await fetch(url, {
      ...options,
      timeout: API_TIMEOUT,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        // Token expired or invalid
        await clearAuthToken();
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Request failed');
    }

    return response;
  } catch (error) {
    if (retries > 0 && !error.message.includes('Authentication required')) {
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Response handler
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error('Invalid response from server');
    }
    throw error;
  }
};

const api = {
  getApiUrl,
  getBaseUrl,
  setAuthToken,
  clearAuthToken,
  getHeaders,
  auth: {
    login: async (credentials) => {
      try {
        const baseUrl = await getApiUrl();
        console.log('Login URL:', `${baseUrl}/login`);
        console.log('Login credentials:', credentials);

        const response = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        console.log('Login response status:', response.status);
        const responseData = await response.json();
        console.log('Login response data:', responseData);

        if (!response.ok) {
          if (response.status === 422) {
            throw new Error(responseData.errors?.email?.[0] || responseData.errors?.password?.[0] || responseData.message);
          }
          if (response.status === 401) {
            throw new Error('The provided credentials are incorrect.');
          }
          throw new Error(responseData.message || 'Login failed');
        }

        if (!responseData.token) {
          throw new Error('No token received from server');
        }

        // Store the token
        await AsyncStorage.setItem('@auth_token', responseData.token);
        setAuthToken(responseData.token);

        return responseData;
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
          console.error('Network error - server might be down or unreachable');
          throw new Error('Cannot connect to server. Please check your network connection.');
        }
        console.error('Login error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        throw error;
      }
    },
    async getCurrentUser() {
      const url = `${await getApiUrl()}/user`;
      const headers = await getHeaders();
      
      console.log('[Auth API] Getting current user');

      try {
        const response = await fetchWithRetry(url, {
          method: 'GET',
          headers,
        });

        const result = await handleResponse(response);
        console.log('[Auth API] Current user response:', result);

        // Handle success response with data
        if (result?.success && result.data) {
          return result.data;
        }

        // Handle legacy response format
        if (result?.user?.id && result.user?.name) {
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email
          };
        }

        // Handle direct user object
        if (result?.id && result?.name) {
          return result;
        }

        console.error('[Auth API] Invalid user response:', result);
        throw new Error('Failed to get current user');
      } catch (error) {
        console.error('[Auth API] Error getting current user:', error);
        throw error;
      }
    },
    getUser: async () => {
      const url = `${await getApiUrl()}/user`;
      const headers = await getHeaders();
      
      console.log('[Auth API] Getting user:', {
        url,
        headers
      });

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers
      });

      const data = await handleResponse(response);
      console.log('[Auth API] User response:', data);
      
      currentUser = data;
      return data;
    },
    logout: async () => {
      try {
        const apiUrl = await getApiUrl();
        await fetchWithRetry(`${apiUrl}/logout`, {
          method: 'POST',
          headers: await getHeaders(),
        });
        await clearAuthToken();
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear token even if request fails
        await clearAuthToken();
        throw error;
      }
    },
  },
  profile: {
    get: async () => {
      try {
        const apiUrl = await getApiUrl();
        const response = await fetchWithRetry(`${apiUrl}/profile`, {
          headers: await getHeaders(),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Get profile error:', error);
        throw error;
      }
    },
    update: async (data) => {
      try {
        const apiUrl = await getApiUrl();
        const response = await fetchWithRetry(`${apiUrl}/profile`, {
          method: 'PUT',
          headers: await getHeaders(),
          body: JSON.stringify(data),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },
    getStats: async () => {
      try {
        const apiUrl = await getApiUrl();
        const response = await fetchWithRetry(`${apiUrl}/profile/stats`, {
          headers: await getHeaders(),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Get profile stats error:', error);
        throw error;
      }
    },
  },
  materials: {
    getMaterial: async (id) => {
      try {
        if (!id) throw new Error('Material ID is required');
        
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const baseUrl = await getApiUrl();
        const response = await fetchWithRetry(`${baseUrl}/materials/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Material not found');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to load material');
        }

        const data = await response.json();

        if (!data || !data.material) {
          throw new Error('Invalid response format');
        }

        // Transform the material data
        const material = data.material;
        
        // Handle thumbnail URL
        if (material.thumbnail) {
          const baseUrl = await getBaseUrl();
          material.thumbnail = material.thumbnail.startsWith('http') 
            ? material.thumbnail 
            : `${baseUrl}/storage/${material.thumbnail}`;
          console.log('Final thumbnail URL:', material.thumbnail);
        } else {
          console.log('No thumbnail available');
        }

        // Ensure numeric values
        material.price = parseFloat(material.price) || 0;
        material.file_size = parseInt(material.file_size) || 0;
        material.rating = parseFloat(material.rating) || 0;
        material.rating_count = parseInt(material.rating_count) || 0;
        material.downloads = parseInt(material.downloads) || 0;

        return { material };
      } catch (error) {
        console.error('Get material error:', error);
        throw error;
      }
    },
    purchaseMaterial: async (id) => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const baseUrl = await getApiUrl();
        const response = await fetchWithRetry(`${baseUrl}/materials/${id}/purchase`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to purchase material');
        }

        return response;
      } catch (error) {
        console.error('Purchase material error:', error);
        throw error;
      }
    },
    getDownloadUrl: async (id) => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const baseUrl = await getApiUrl();
        const response = await fetchWithRetry(`${baseUrl}/materials/${id}/download-url`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to get download URL');
        }

        const data = await response.json();
        if (!data || !data.download_url) {
          throw new Error('Invalid download URL response');
        }

        return data; // Return the complete response data
      } catch (error) {
        console.error('Get download URL error:', error);
        throw error;
      }
    },
    getMaterials: async (params = {}) => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        // Convert single values to arrays for consistent handling
        const queryParams = { ...params };
        ['section_id', 'level_id', 'category_id', 'subject_id'].forEach(key => {
          if (queryParams[key]) {
            queryParams[key] = [queryParams[key]];
          }
        });

        // Handle array parameters by JSON stringifying them
        ['sections', 'categories', 'levels', 'subjects', 'section_id', 'level_id', 'category_id', 'subject_id'].forEach(key => {
          if (Array.isArray(queryParams[key]) && queryParams[key].length > 0) {
            queryParams[key] = JSON.stringify(queryParams[key]);
          }
        });

        // Build query string
        const queryString = Object.entries(queryParams)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');

        const url = `${await getApiUrl()}/materials${queryString ? `?${queryString}` : ''}`;

        console.log('Fetching materials:', {
          url,
          params: queryParams
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to load materials');
        }

        const data = await response.json();

        // Transform the response to match what the MaterialsScreen expects
        return {
          items: data.items || [],
          hasMore: data.hasMore || false,
          total: data.total || 0,
          currentPage: data.currentPage || 1,
          perPage: data.perPage || 20,
        };
      } catch (error) {
        console.error('Get materials error:', error);
        throw error;
      }
    },

    getFilters: async () => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const response = await fetch(`${await getApiUrl()}/materials/filters`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load filters');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Get filters error:', error);
        throw error;
      }
    },

    addView: async (materialId) => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const url = `${await getApiUrl()}/materials/${materialId}/view`;
        console.log('Adding view:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('View response status:', response.status);
        const responseData = await response.json();
        console.log('View response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to add view');
        }

        return responseData;
      } catch (error) {
        console.error('Add view error:', error);
        throw error;
      }
    },
    download: async (materialId) => {
      try {
        const url = `${await getApiUrl()}/materials/${materialId}/download`;
        console.log('Downloading from:', url);

        const response = await fetchWithRetry(url, {
          method: 'GET',
        });

        console.log('Download response status:', response.status);
        
        if (!response.ok) {
          const responseData = await response.json().catch(() => ({ message: 'Error downloading material' }));
          console.log('Download error response:', responseData);
          throw new Error(responseData.message || 'Error downloading material');
        }

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        console.log('Content-Disposition:', contentDisposition);
        
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '')
          : null;

        console.log('Extracted filename:', fileName);

        const blob = await response.blob();
        return blob;
      } catch (error) {
        console.error('Download error:', error);
        throw error;
      }
    },
    getUserDownloads: async () => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        const url = `${await getApiUrl()}/user/downloads`;
        console.log('Getting downloads from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Downloads response status:', response.status);
        const responseData = await response.json();
        console.log('Downloads response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to get downloads');
        }

        return responseData.downloads;
      } catch (error) {
        console.error('Get downloads error:', error);
        throw error;
      }
    },
  },
  sections: {
    getAll: async () => {
      const url = `${await getApiUrl()}/hierarchy?type=sections`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    },
  },
  levels: {
    getAll: async () => {
      const url = `${await getApiUrl()}/hierarchy?type=levels`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    },
    getBySection: async (sectionId) => {
      const url = `${await getApiUrl()}/hierarchy?type=levels&section_id=${sectionId}`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    }
  },
  categories: {
    getAll: async () => {
      const url = `${await getApiUrl()}/hierarchy?type=categories`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    },
    getByLevel: async (levelId) => {
      const url = `${await getApiUrl()}/hierarchy?type=categories&level_id=${levelId}`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    }
  },
  subjects: {
    getAll: async () => {
      const url = `${await getApiUrl()}/hierarchy?type=subjects`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    },
    getByCategory: async (categoryId) => {
      const url = `${await getApiUrl()}/hierarchy?type=subjects&category_id=${categoryId}`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return handleResponse(response);
    }
  },
  notifications: {
    async getUnread() {
      const url = `${await getApiUrl()}/notifications/unread`;
      return handleResponse(await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      }));
    },

    async markAsRead(notificationIds) {
      const url = `${await getApiUrl()}/notifications/mark-read`;
      return handleResponse(await fetchWithRetry(url, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ notification_ids: notificationIds }),
      }));
    },

    async registerDevice(token, deviceInfo) {
      const url = `${await getApiUrl()}/notifications/devices`;
      return handleResponse(await fetchWithRetry(url, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          device_name: Device.deviceName,
          device_model: Device.modelName,
          ...deviceInfo
        }),
      }));
    },

    async unregisterDevice(token) {
      const url = `${await getApiUrl()}/notifications/devices/${token}`;
      return handleResponse(await fetchWithRetry(url, {
        method: 'DELETE',
        headers: await getHeaders(),
      }));
    },

    async updateDeviceSettings(token, settings) {
      const url = `${await getApiUrl()}/notifications/devices/${token}/settings`;
      return handleResponse(await fetchWithRetry(url, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify(settings),
      }));
    },

    async getNotificationHistory(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = `${await getApiUrl()}/notifications/history${queryString ? `?${queryString}` : ''}`;
      return handleResponse(await fetchWithRetry(url, {
        method: 'GET',
        headers: await getHeaders(),
      }));
    },
  },
  momo: {
    initiatePayment: async (material, phoneNumber) => {
      try {
        const baseUrl = await getApiUrl();
        const response = await fetchWithRetry(`${baseUrl}/momo/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify({
            material_id: material.id,
            phone_number: phoneNumber,
            amount: material.price,
            currency: 'XAF',
            description: `Purchase of ${material.title}`
          }),
        });
        return await handleResponse(response);
      } catch (error) {
        console.error('MoMo Payment Initiation Error:', error);
        throw error;
      }
    },

    // Check payment status
    checkPaymentStatus: async (transactionId) => {
      try {
        const baseUrl = await getApiUrl();
        const response = await fetchWithRetry(`${baseUrl}/momo/status/${transactionId}`, {
          method: 'GET',
        });
        return await handleResponse(response);
      } catch (error) {
        console.error('MoMo Payment Status Check Error:', error);
        throw error;
      }
    },

    // Verify payment for a specific material
    verifyMaterialPayment: async (materialId, transactionId) => {
      try {
        const baseUrl = await getApiUrl();
        const response = await fetchWithRetry(`${baseUrl}/momo/verify`, {
          method: 'POST',
          body: JSON.stringify({
            materialId,
            transactionId,
          }),
        });
        return await handleResponse(response);
      } catch (error) {
        console.error('MoMo Payment Verification Error:', error);
        throw error;
      }
    },

      // Add a method to cancel a transaction
  cancelTransaction: async (transactionId) => {
    try {
      const baseUrl = await getApiUrl();
      const response = await fetchWithRetry(`${baseUrl}/momo/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transactionId
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Transaction Cancellation Error:', error);
      throw error;
    }
  },
  },
  chat: {
    async getSubjects(params = {}) {
      const url = new URL(`${await getApiUrl()}/chat/subjects`);
      
      // Add search params if they exist
      if (params.search) {
        url.searchParams.append('search', params.search);
      }
      if (params.page) {
        url.searchParams.append('page', params.page);
      }
      if (params.per_page) {
        url.searchParams.append('per_page', params.per_page);
      }

      const headers = await getHeaders();
      
      console.log('[Chat API] Requesting subjects:', {
        url: url.toString(),
        method: 'GET',
        headers,
        params,
      });

      try {
        const response = await fetchWithRetry(url.toString(), {
          method: 'GET',
          headers,
        });

        const result = await handleResponse(response);
        console.log('[Chat API] Subjects response:', result);

        return result;
      } catch (error) {
        console.error('[Chat API] Error fetching subjects:', error);
        throw error;
      }
    },
    async createSubject(data) {
      const url = `${await getApiUrl()}/chat/subjects`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Creating subject:', {
        url,
        method: 'POST',
        headers,
        data,
      });

      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const dataResponse = await handleResponse(response);
      console.log('[Chat API] Create subject response:', {
        status: response.status,
        data: dataResponse,
      });

      return dataResponse;
    },
    async getChats(subjectId) {
      const url = `${await getApiUrl()}/chat/subjects/${subjectId}/chats`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Requesting chats:', {
        url,
        method: 'GET',
        headers,
      });

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);
      console.log('[Chat API] Chats response:', result);

      return result?.data || [];
    },
    async createChat(subjectId, data) {
      const url = `${await getApiUrl()}/chat/subjects/${subjectId}/chats`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Creating chat:', {
        url,
        method: 'POST',
        headers,
        data,
      });

      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const dataResponse = await handleResponse(response);
      console.log('[Chat API] Create chat response:', {
        status: response.status,
        data: dataResponse,
      });

      return dataResponse;
    },
    async getMessages(chatId, params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = `${await getApiUrl()}/chat/subjects/chats/${chatId}/messages${queryString ? `?${queryString}` : ''}`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Getting messages:', {
        url,
        method: 'GET',
        headers,
      });

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);
      console.log('[Chat API] Messages response:', result);

      return result?.data || [];
    },

    async sendMessage(chatId, content) {
      const url = `${await getApiUrl()}/chat/subjects/chats/${chatId}/messages`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Sending message:', {
        url,
        method: 'POST',
        headers,
        content,
      });

      try {
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(content),
        });

        const result = await handleResponse(response);
        console.log('[Chat API] Send message response:', result);

        if (result?.success && result.data) {
          return result.data;
        }

        throw new Error('Failed to send message');
      } catch (error) {
        console.error('[Chat API] Error sending message:', error);
        throw error;
      }
    },
    async joinSubject(subjectId) {
      const url = `${await getApiUrl()}/chat/subjects/${subjectId}/join`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Joining subject:', {
        url,
        method: 'POST',
        headers,
      });

      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
      });

      const dataResponse = await handleResponse(response);
      console.log('[Chat API] Join subject response:', {
        status: response.status,
        data: dataResponse,
      });

      return dataResponse;
    },
    async leaveSubject(subjectId) {
      const url = `${await getApiUrl()}/chat/subjects/${subjectId}/leave`;
      const headers = await getHeaders();
      
      console.log('[Chat API] Leaving subject:', {
        url,
        method: 'POST',
        headers,
      });

      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
      });

      const dataResponse = await handleResponse(response);
      console.log('[Chat API] Leave subject response:', {
        status: response.status,
        data: dataResponse,
      });

      return dataResponse;
    },
  },
  CHAT_ENDPOINTS: {
    subjects: '/subjects',
    messages: (subjectId) => `/subjects/${subjectId}/messages`,
    join: (subjectId) => `/subjects/${subjectId}/join`,
    leave: (subjectId) => `/subjects/${subjectId}/leave`,
  },
  hierarchy: {
    getHierarchyData: async (params = {}) => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error('No auth token');

        // Handle array parameters by JSON stringifying them
        const queryParams = { ...params };
        ['sections', 'categories', 'levels', 'subjects'].forEach(key => {
          if (Array.isArray(queryParams[key]) && queryParams[key].length > 0) {
            queryParams[key] = JSON.stringify(queryParams[key]);
          }
        });

        // Build query string
        const queryString = Object.entries(queryParams)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');

        const url = `${await getApiUrl()}/hierarchy${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load hierarchy data');
        }

        const data = await response.json();

        return data;
      } catch (error) {
        console.error('Get hierarchy data error:', error);
        throw error;
      }
    },
  },
};

// Initialize API configuration
initializeApiConfig().catch(console.error);

export default api;
