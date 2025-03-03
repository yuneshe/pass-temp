import React from 'react';
import { WebView } from 'react-native-webview';
import { Modal, View, StyleSheet } from 'react-native';

const FLUTTERWAVE_V3_URL = 'https://checkout.flutterwave.com/v3/hosted/pay';

export const PayWithFlutterwaveV3 = ({ options, onRedirect, visible }) => {
  const handleNavigationStateChange = (state) => {
    console.log('Navigation state:', state);
    if (state.url.includes('flutterwave.com/v3/hosted/pay')) {
      // Handle redirect URL
      onRedirect(state);
    }
  };

  const generatePaymentHTML = () => {
    const paymentData = {
      public_key: options.authorization,
      tx_ref: options.tx_ref,
      amount: options.amount,
      currency: options.currency,
      payment_options: options.payment_options,
      redirect_url: "https://webhook.site/redirect-here",
      customer: {
        email: options.customer.email,
        phone_number: options.customer.phone_number,
        name: options.customer.name
      },
      customizations: {
        title: options.customizations.title,
        description: options.customizations.description,
        logo: "https://assets.piedpiper.com/logo.png"
      },
      meta: {
        consumer_id: 23,
        consumer_mac: "92a3-912ba-1192a"
      }
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Flutterwave Payment</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://checkout.flutterwave.com/v3.js"></script>
        </head>
        <body>
          <script>
            const paymentData = ${JSON.stringify(paymentData)};
            
            function makePayment() {
              FlutterwaveCheckout(paymentData);
            }

            // Start payment automatically
            window.onload = makePayment;
          </script>
        </body>
      </html>
    `;
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <WebView
          source={{ html: generatePaymentHTML() }}
          onNavigationStateChange={handleNavigationStateChange}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default PayWithFlutterwaveV3;
