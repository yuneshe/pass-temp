import api from '../config/api';

export const authService = {
    // Register a new user
    register: async (userData) => {
        try {
            console.log('Registering with data:', userData);
            const response = await api.post('/api/register', userData);
            console.log('Register response:', response);
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            console.log('Logging in with:', credentials);
            
            // Validate credentials
            if (!credentials?.email || !credentials?.password) {
                throw new Error('Email and password are required');
            }
            
            const response = await api.post('/api/login', {
                email: credentials.email,
                password: credentials.password
            });
            
            console.log('Login response:', response);
            
            if (response?.token) {
                api.setToken(response.token);
            }
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await api.post('/api/logout');
            api.clearToken();
            return response;
        } catch (error) {
            console.error('Logout error:', error);
            api.clearToken(); // Clear token even if logout fails
            throw error;
        }
    },

    // Request password reset
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/api/forgot-password', { email });
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    // Reset password
    resetPassword: async (data) => {
        try {
            const response = await api.post('/api/reset-password', data);
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    // Update password
    updatePassword: async (data) => {
        try {
            const response = await api.put('/api/password', data);
            return response;
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    },

    // Verify email
    verifyEmail: async (id, hash) => {
        try {
            const response = await api.get(`/api/verify-email/${id}/${hash}`);
            return response;
        } catch (error) {
            console.error('Verify email error:', error);
            throw error;
        }
    },

    // Resend verification email
    resendVerification: async () => {
        try {
            const response = await api.post('/api/email/verification-notification');
            return response;
        } catch (error) {
            console.error('Resend verification error:', error);
            throw error;
        }
    },
};
