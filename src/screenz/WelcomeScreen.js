import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedButton } from '../components/AnimatedButton';
import TextComponent from '../components/Text';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TextComponent style={styles.title}>Welcome to Pass</TextComponent>
          <TextComponent style={styles.subtitle}>
            Your one-stop solution for educational materials
          </TextComponent>
        </View>

        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            style={styles.buttonSpacing}
          />
          <AnimatedButton
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
          />
        </View>

        <View style={styles.footer}>
          <TextComponent style={styles.footerText}>
            By continuing, you agree to our
          </TextComponent>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => {}}>
              <TextComponent style={styles.link}>Terms of Service</TextComponent>
            </TouchableOpacity>
            <TextComponent style={styles.footerText}> and </TextComponent>
            <TouchableOpacity onPress={() => {}}>
              <TextComponent style={styles.link}>Privacy Policy</TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#000',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  link: {
    fontSize: 14,
    color: '#6803FF',
    fontWeight: '600',
  },
});
