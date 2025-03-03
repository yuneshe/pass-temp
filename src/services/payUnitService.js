import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'react-native-base64';

const PAYUNIT_API_KEY = '96c364c0449d6a4791625fe6489bdcdc2a375daf';
const PAYUNIT_API_PASSWORD = '112efed5-cad5-448b-a99c-c3a3634812c3';
const PAYUNIT_BASE_URL = 'https://gateway.payunit.net/api/gateway/initialize';

// Create Basic Auth token
const basicAuth = base64.encode(`${PAYUNIT_API_KEY}:${PAYUNIT_API_PASSWORD}`);

// Create axios instance with default config
const payunitAxios = axios.create({
  baseURL: PAYUNIT_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': PAYUNIT_API_KEY,
    'mode': 'test', // Change to 'live' for production
    'Authorization': `Basic ${basicAuth}`
  },
  timeout: 15000 // 15 seconds timeout
});

class PayUnitService {
  static async initializePayment({
    amount,
    description,
    orderId,
    returnUrl,
    notifyUrl,
  }) {
    try {
      console.log('Initializing payment with PayUnit...');
      
      const requestBody = {
        total_amount: parseFloat(amount),
        currency: 'XAF',
        transaction_id: orderId,
        description: description,
        return_url: returnUrl,
        notify_url: notifyUrl,
        payment_country: 'CM'
      };
      
      console.log('PayUnit Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await payunitAxios.post('/gateway/initialize', requestBody);
      console.log('PayUnit Response:', JSON.stringify(response.data, null, 2));

      if (!response.data) {
        throw new Error('Invalid response from PayUnit');
      }

      return response.data;
    } catch (error) {
      console.error('PayUnit API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data?.message || 'Payment initialization failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from PayUnit');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error setting up payment request');
      }
    }
  }

  static async verifyPayment(transactionId) {
    try {
      console.log('Verifying payment:', transactionId);
      
      const response = await payunitAxios.get(`/gateway/transaction/${transactionId}`);
      console.log('Verification Response:', JSON.stringify(response.data, null, 2));

      if (!response.data) {
        throw new Error('Invalid verification response');
      }

      return response.data;
    } catch (error) {
      console.error('PayUnit Verification Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error('Payment verification failed');
    }
  }

  static async getPaymentStatus(transactionId) {
    try {
      console.log('Getting payment status:', transactionId);
      
      const response = await payunitAxios.get(`/gateway/transaction/status/${transactionId}`);
      console.log('Status Response:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error('PayUnit Status Error:', error);
      throw new Error('Failed to get payment status');
    }
  }

  static async handlePaymentResponse(paymentResponse) {
    try {
      // Store the transaction details
      const uniqueKey = `@payment_${paymentResponse.orderId}_${Date.now()}`;
      await AsyncStorage.setItem(uniqueKey, JSON.stringify(paymentResponse));
      return paymentResponse;
    } catch (error) {
      console.error('Error handling payment response:', error);
      throw error;
    }
  }
}

export default PayUnitService;
