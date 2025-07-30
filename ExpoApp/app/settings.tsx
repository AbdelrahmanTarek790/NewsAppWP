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
import { useRouter } from 'expo-router';

// Simple Divider component
const Divider = () => <Box className="h-px bg-gray-200 my-2" />;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
          <Text className="font-medium">{title}</Text>
          {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
        </VStack>
        {rightElement}
      </HStack>
    </Pressable>
  );

  if (!user) {
    return (
      <Box className="flex-1 justify-center items-center p-6">
        <Text>Please log in to access settings</Text>
        <Button onPress={() => router.push('/login' as any)} className="mt-4">
          <ButtonText>Go to Login</ButtonText>
        </Button>
      </Box>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Box className="p-6">
        <VStack space="lg">
          {/* Notifications */}
          <Card>
            <Box className="p-4">
              <Heading size="md" className="mb-4">Notifications</Heading>
              <VStack space="md">
                <SettingItem
                  title="Push Notifications"
                  subtitle="Receive push notifications for breaking news"
                  rightElement={
                    <Switch
                      value={pushNotifications}
                      onValueChange={setPushNotifications}
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
                    />
                  }
                />
              </VStack>
            </Box>
          </Card>

          {/* Appearance */}
          <Card>
            <Box className="p-4">
              <Heading size="md" className="mb-4">Appearance</Heading>
              <VStack space="md">
                <SettingItem
                  title="Dark Mode"
                  subtitle="Use dark theme throughout the app"
                  rightElement={
                    <Switch
                      value={darkMode}
                      onValueChange={setDarkMode}
                    />
                  }
                />
                
                <Divider />
                
                <SettingItem
                  title="Auto-play Videos"
                  subtitle="Automatically play videos in feeds"
                  rightElement={
                    <Switch
                      value={autoPlay}
                      onValueChange={setAutoPlay}
                    />
                  }
                />
              </VStack>
            </Box>
          </Card>

          {/* Account */}
          <Card>
            <Box className="p-4">
              <Heading size="md" className="mb-4">Account</Heading>
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
          <Card>
            <Box className="p-4">
              <Heading size="md" className="mb-4">Support</Heading>
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
          <Card>
            <Box className="p-4">
              <VStack space="sm" className="items-center">
                <Text className="text-gray-500">NewsPress App</Text>
                <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
              </VStack>
            </Box>
          </Card>

          {/* Logout Button */}
          <Button 
            variant="solid" 
            action="negative"
            onPress={handleLogout}
            className="mt-4"
          >
            <ButtonText>Logout</ButtonText>
          </Button>
        </VStack>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});