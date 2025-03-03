import api from '../config/api';

const paymentService = {
  // Create a payment for a material
  createPayment: async (materialId) => {
    try {
      return await api.post(`/api/payment/create/${materialId}`);
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    try {
      return await api.get(`/api/payment/verify/${paymentId}`);
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      return await api.get('/api/payments/history');
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  },

  // Get transaction details
  getTransactionDetails: async (transactionId) => {
    try {
      return await api.get(`/api/transactions/${transactionId}`);
    } catch (error) {
      console.error('Transaction details error:', error);
      throw error;
    }
  }
};

export default paymentService;
