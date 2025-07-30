import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Spinner } from '@/components/ui/spinner';

interface SplashScreenProps {
  isLoading?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading = true }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        
        <Text style={styles.title}>NewsPress</Text>
        <Text style={styles.subtitle}>Stay informed, stay ahead</Text>
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Spinner size="large" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4c669f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 50,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
});