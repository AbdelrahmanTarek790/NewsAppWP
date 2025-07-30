import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Pressable, Switch } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Simple Divider component
const Divider = () => <Box className="h-px bg-gray-200 dark:bg-gray-700 my-2" />;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, actualTheme, setTheme } = useTheme();
  const router = useRouter();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature will be implemented soon.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'This feature will be implemented soon.');
          }
        }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This will open the privacy policy.');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'This will open the terms of service.');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'This will open the support contact form.');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <Pressable onPress={onPress}>
      <HStack className="justify-between items-center py-3">
        <VStack className="flex-1">
          <Text className="font-medium text-gray-900 dark:text-white">{title}</Text>
          {subtitle && <Text className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</Text>}
        </VStack>
        {rightElement}
      </HStack>
    </Pressable>
  );

  if (!user) {
    return (
      <Box 
        className="flex-1 justify-center items-center p-6"
        style={{ backgroundColor: Colors[actualTheme].background }}
      >
        <Text className="text-gray-900 dark:text-white">Please log in to access settings</Text>
        <Button onPress={() => router.push('/login' as any)} className="mt-4 bg-red-600">
          <ButtonText>Go to Login</ButtonText>
        </Button>
      </Box>
    );
  }

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: Colors[actualTheme].background }
      ]}
    >
      <Box className="p-6">
        <VStack space="lg">
          {/* Notifications */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Box className="p-4">
              <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Notifications</Heading>
              <VStack space="md">
                <SettingItem
                  title="Push Notifications"
                  subtitle="Receive push notifications for breaking news"
                  rightElement={
                    <Switch
                      value={pushNotifications}
                      onValueChange={setPushNotifications}
                      trackColor={{ false: '#E5E7EB', true: Colors[actualTheme].primary }}
                      thumbColor={pushNotifications ? '#FFFFFF' : '#9CA3AF'}
                    />
                  }
                />
                
                <Divider />
                
                <SettingItem
                  title="Email Notifications"
                  subtitle="Receive email updates for newsletters"
                  rightElement={
                    <Switch
                      value={emailNotifications}
                      onValueChange={setEmailNotifications}
                      trackColor={{ false: '#E5E7EB', true: Colors[actualTheme].primary }}
                      thumbColor={emailNotifications ? '#FFFFFF' : '#9CA3AF'}
                    />
                  }
                />
              </VStack>
            </Box>
          </Card>

          {/* Appearance */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Box className="p-4">
              <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Appearance</Heading>
              <VStack space="md">
                <SettingItem
                  title="Theme"
                  subtitle={`Current: ${theme === 'system' ? `System (${actualTheme})` : theme}`}
                />
                
                <HStack space="sm" className="mt-2">
                  <Button 
                    variant={theme === 'light' ? 'solid' : 'outline'}
                    size="sm"
                    onPress={() => handleThemeChange('light')}
                    className={theme === 'light' ? 'bg-red-600' : 'border-red-600'}
                  >
                    <ButtonText className={theme === 'light' ? 'text-white' : 'text-red-600'}>Light</ButtonText>
                  </Button>
                  
                  <Button 
                    variant={theme === 'dark' ? 'solid' : 'outline'}
                    size="sm"
                    onPress={() => handleThemeChange('dark')}
                    className={theme === 'dark' ? 'bg-red-600' : 'border-red-600'}
                  >
                    <ButtonText className={theme === 'dark' ? 'text-white' : 'text-red-600'}>Dark</ButtonText>
                  </Button>
                  
                  <Button 
                    variant={theme === 'system' ? 'solid' : 'outline'}
                    size="sm"
                    onPress={() => handleThemeChange('system')}
                    className={theme === 'system' ? 'bg-red-600' : 'border-red-600'}
                  >
                    <ButtonText className={theme === 'system' ? 'text-white' : 'text-red-600'}>System</ButtonText>
                  </Button>
                </HStack>
                
                <Divider />
                
                <SettingItem
                  title="Auto-play Videos"
                  subtitle="Automatically play videos in feeds"
                  rightElement={
                    <Switch
                      value={autoPlay}
                      onValueChange={setAutoPlay}
                      trackColor={{ false: '#E5E7EB', true: Colors[actualTheme].primary }}
                      thumbColor={autoPlay ? '#FFFFFF' : '#9CA3AF'}
                    />
                  }
                />
              </VStack>
            </Box>
          </Card>

          {/* Account */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Box className="p-4">
              <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Account</Heading>
              <VStack space="md">
                <SettingItem
                  title="Change Password"
                  subtitle="Update your account password"
                  onPress={handleChangePassword}
                  rightElement={<Text className="text-gray-400">›</Text>}
                />
                
                <Divider />
                
                <SettingItem
                  title="Delete Account"
                  subtitle="Permanently delete your account"
                  onPress={handleDeleteAccount}
                  rightElement={<Text className="text-red-500">›</Text>}
                />
              </VStack>
            </Box>
          </Card>

          {/* Support */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Box className="p-4">
              <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Support</Heading>
              <VStack space="md">
                <SettingItem
                  title="Contact Support"
                  subtitle="Get help with your account"
                  onPress={handleContactSupport}
                  rightElement={<Text className="text-gray-400">›</Text>}
                />
                
                <Divider />
                
                <SettingItem
                  title="Privacy Policy"
                  subtitle="View our privacy policy"
                  onPress={handlePrivacyPolicy}
                  rightElement={<Text className="text-gray-400">›</Text>}
                />
                
                <Divider />
                
                <SettingItem
                  title="Terms of Service"
                  subtitle="View our terms of service"
                  onPress={handleTermsOfService}
                  rightElement={<Text className="text-gray-400">›</Text>}
                />
              </VStack>
            </Box>
          </Card>

          {/* App Info */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Box className="p-4">
              <VStack space="sm" className="items-center">
                <Text className="text-gray-500 dark:text-gray-400">NewsPress App</Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm">Version 1.0.0</Text>
              </VStack>
            </Box>
          </Card>

          {/* Logout Button */}
          <Button 
            variant="solid" 
            onPress={handleLogout}
            className="mt-4 bg-red-600"
          >
            <ButtonText className="text-white">Logout</ButtonText>
          </Button>
        </VStack>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});