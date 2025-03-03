import { PayWithFlutterwave } from 'flutterwave-react-native';
import { Platform } from 'react-native';

// Replace with your Flutterwave public key
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-573a749b9c7fbd1d27476fe0dd4dbff7-X';

class FlutterwaveService {
    static async initializePayment({
        amount,
        email,
        phoneNumber,
        name,
        orderId,
        description
    }) {
        try {
            const paymentOptions = {
                tx_ref: orderId,
                authorization: FLUTTERWAVE_PUBLIC_KEY,
                customer: {
                    email,
                    phone_number: phoneNumber,
                    name,
                },
                amount: parseFloat(amount),
                currency: 'XAF',
                payment_options: "mobilemoneyfranco",
                customizations: {
                    title: 'Material Purchase',
                    description: description,
                },
                meta: {
                    source: "mobile-app",
                    device: Platform.OS
                }
            };

            return paymentOptions;
        } catch (error) {
            console.error('Payment initialization failed:', error);
            throw new Error('Payment initialization failed');
        }
    }

    static async verifyTransaction(transactionId) {
        try {
            // Use the backend to verify the transaction
            const response = await api.materials.verifyPayment(transactionId);
            return {
                success: response.success,
                data: response.data,
            };
        } catch (error) {
            console.error('Transaction verification failed:', error);
            throw new Error('Transaction verification failed');
        }
    }
}

export default FlutterwaveService;
