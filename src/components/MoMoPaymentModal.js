import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Text from './Text';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../config/api';

const MoMoPaymentModal = ({ 
  visible, 
  onClose, 
  material, 
  onPaymentSuccess 
}) => {
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  // Debug log to check material object
  useEffect(() => {
    console.log('Material Object in MoMoPaymentModal:', {
      id: material?.id,
      title: material?.title,
      price: material?.price,
      fullObject: material
    });
  }, [material]);

  // Cancel transaction and close modal
  const handleCancel = async () => {
    try {
      // If there's an active transaction, attempt to cancel it
      if (transactionId) {
        try {
          await api.momo.cancelTransaction(transactionId);
          console.log('Transaction canceled successfully');
        } catch (cancelError) {
          console.error('Error canceling transaction:', cancelError);
        }
      }

      // Reset all states
      setPhoneNumber('');
      setIsProcessing(false);
      setPaymentStatus(null);
      setTransactionId(null);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error in handleCancel:', error);
      
      // Fallback alert if cancellation fails
      Alert.alert(
        'Cancellation Error',
        'Unable to cancel the transaction. Please contact support.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const handleInitiatePayment = async () => {
    // Validate phone number
    const cleanedPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    if (!cleanedPhoneNumber || cleanedPhoneNumber.length < 9) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }
  
    // Validate material
    if (!material || !material.id) {
      Alert.alert('Material Error', 'Invalid material selected');
      return;
    }
  
    setIsProcessing(true);
    try {
      // Pass entire material object and phone number
      const paymentResponse = await api.momo.initiatePayment(material, cleanedPhoneNumber);
  
      console.log('Payment Initiation Response:', paymentResponse);
  
      // Save transaction ID for status tracking
      setTransactionId(paymentResponse.reference_id);
  
      // Start polling payment status
      await pollPaymentStatus(paymentResponse.reference_id);
    } catch (error) {
      console.error('Full MoMo Payment Error:', {
        error: error.message,
        material: material,
        stack: error.stack
      });
  
      // User-friendly error alert
      Alert.alert(
        'Payment Error', 
        error.message || 'Failed to initiate payment. Please check your connection and try again.',
        [
          { 
            text: 'Retry', 
            onPress: () => handleInitiatePayment() 
          },
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: handleCancel
          }
        ]
      );
  
      // Ensure processing state is reset
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (txId) => {
    const MAX_POLLING_ATTEMPTS = 12; // 1 minute total (5s * 12)
    let attempts = 0;
  
    const pollRecursive = async () => {
      try {
        attempts++;
        console.log(`Polling payment status (Attempt ${attempts}):`, {
          transactionId: txId,
          materialId: material?.id,
          materialTitle: material?.title
        });
  
        const statusResponse = await api.momo.checkPaymentStatus(txId);
        console.log('Payment Status Response:', statusResponse);
  
        switch (statusResponse.status) {
          case 'success':
            // Additional error checking before verification
            if (!material || !material.id) {
              throw new Error('Material ID is missing or invalid');
            }

            // Verify payment for the specific material
            const verificationResponse = await api.momo.verifyMaterialPayment(
              material.id, 
              txId
            );
  
            console.log('Payment Verification Response:', verificationResponse);
  
            if (verificationResponse.verified) {
              setPaymentStatus('success');
              onPaymentSuccess(material);
              onClose();
              return;
            } else {
              throw new Error('Payment verification failed');
            }
  
          case 'pending':
            if (attempts >= MAX_POLLING_ATTEMPTS) {
              // Stop polling after max attempts
              throw new Error('Payment status check timed out');
            }
            
            // Continue polling with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
            await pollRecursive();
            break;
  
          case 'failed':
            setPaymentStatus('failed');
            throw new Error('Payment processing failed');
  
          default:
            throw new Error(`Unexpected payment status: ${statusResponse.status}`);
        }
      } catch (error) {
        console.error('Payment Status Polling Error:', {
          errorMessage: error.message,
          material: material,
          transactionId: txId
        });
        
        setIsProcessing(false);
        
        Alert.alert(
          'Payment Status Error', 
          error.message || 'Unable to verify payment status. Please contact support.',
          [
            { 
              text: 'OK', 
              onPress: handleCancel
            }
          ]
        );
      }
    };
  
    // Start the recursive polling
    await pollRecursive();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer, 
          { backgroundColor: theme.background }
        ]}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleCancel}
          >
            <Icon 
              name="close" 
              size={24} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>

          <Text style={[
            styles.title, 
            { color: theme.textPrimary }
          ]}>
            Pay with MTN MoMo
          </Text>

          <Text style={[
            styles.subtitle, 
            { color: theme.textSecondary }
          ]}>
            {`Pay ${material?.price || 'N/A'} XAF for ${material?.title || 'Material'}`}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[
              styles.label, 
              { color: theme.textSecondary }
            ]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.textPrimary,
                  backgroundColor: theme.surfaceVariant,
                  borderColor: theme.border 
                }
              ]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter MoMo Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.payButton, 
              { 
                backgroundColor: isProcessing 
                  ? theme.textSecondary 
                  : theme.primary 
              }
            ]}
            onPress={handleInitiatePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>
                Pay Now
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '95%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  payButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MoMoPaymentModal;