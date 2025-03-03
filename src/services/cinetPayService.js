import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const CINETPAY_API_KEY = 'YOUR_CINETPAY_API_KEY';
const CINETPAY_SITE_ID = 'YOUR_SITE_ID';
const CINETPAY_ENV = 'PROD'; // or 'TEST' for sandbox

class CinetPayService {
    static async initializePayment({
        amount,
        email,
        phoneNumber,
        name,
        orderId,
        description
    }) {
        try {
            const paymentData = {
                apikey: CINETPAY_API_KEY,
                site_id: CINETPAY_SITE_ID,
                transaction_id: orderId,
                amount: parseFloat(amount),
                currency: 'XAF',
                channels: 'ALL',
                description: description,
                customer_name: name,
                customer_email: email,
                customer_phone_number: phoneNumber,
                customer_address: '',
                customer_city: '',
                customer_country: 'CM',
                customer_state: '',
                customer_zip_code: '',
                notify_url: 'YOUR_BACKEND_NOTIFICATION_URL',
                return_url: 'YOUR_RETURN_URL',
                lang: 'en',
                metadata: JSON.stringify({
                    source: "mobile-app",
                    device: Platform.OS
                })
            };

            return paymentData;
        } catch (error) {
            console.error('Payment initialization failed:', error);
            throw new Error('Payment initialization failed');
        }
    }

    static generatePaymentHTML(paymentData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>CinetPay Payment</title>
                <script src="https://cdn.cinetpay.com/seamless/main.js"></script>
            </head>
            <body>
                <div id="payment-form"></div>
                <script>
                    window.onload = function() {
                        CinetPay.setConfig({
                            apikey: '${paymentData.apikey}',
                            site_id: '${paymentData.site_id}',
                            mode: '${CINETPAY_ENV}',
                            notify_url: '${paymentData.notify_url}'
                        });
                        
                        CinetPay.getCheckout({
                            transaction_id: '${paymentData.transaction_id}',
                            amount: ${paymentData.amount},
                            currency: '${paymentData.currency}',
                            channels: '${paymentData.channels}',
                            description: '${paymentData.description}',
                            customer_name: '${paymentData.customer_name}',
                            customer_email: '${paymentData.customer_email}',
                            customer_phone_number: '${paymentData.customer_phone_number}',
                            customer_address: '${paymentData.customer_address}',
                            customer_city: '${paymentData.customer_city}',
                            customer_country: '${paymentData.customer_country}',
                            customer_state: '${paymentData.customer_state}',
                            customer_zip_code: '${paymentData.customer_zip_code}',
                            lang: '${paymentData.lang}',
                            metadata: '${paymentData.metadata}'
                        });
                        
                        CinetPay.onError(function(error) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'error',
                                error: error
                            }));
                        });
                        
                        CinetPay.onClose(function() {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'close'
                            }));
                        });
                        
                        CinetPay.onSuccess(function(data) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'success',
                                data: data
                            }));
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }
}

export default CinetPayService;
