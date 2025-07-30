import React from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Colors } from '@/constants/Colors';

// Simple Divider component
const Divider = () => <Box className="h-px bg-gray-200 dark:bg-gray-700 my-2" />;

function ProfileContent() {
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen (placeholder)
    console.log('Edit profile clicked');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handlePaymentMethod = () => {
    console.log('Payment method clicked');
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
  };

  const handleGetHelp = () => {
    console.log('Get help clicked');
  };

  const ProfileMenuItem = ({ 
    icon, 
    title, 
    onPress, 
    showChevron = true,
    variant = 'default' 
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    showChevron?: boolean;
    variant?: 'default' | 'danger';
  }) => (
    <Pressable onPress={onPress}>
      <HStack className="items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 rounded-xl mb-3 border border-gray-100 dark:border-gray-700">
        <HStack className="items-center flex-1" space="md">
          <Box className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center">
            <Text className="text-lg">{icon}</Text>
          </Box>
          <Text 
            className={`font-medium flex-1 ${
              variant === 'danger' 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {title}
          </Text>
        </HStack>
        {showChevron && (
          <Text className="text-gray-400 text-lg">›</Text>
        )}
      </HStack>
    </Pressable>
  );

  // Mock user stats (in real app, these would come from API)
  const userStats = {
    points: 700,
    articlesRead: 45,
    commentsPosted: 12,
    bookmarks: 23
  };

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: Colors[actualTheme].background }
      ]}
    >
      <Box className="p-6">
        <VStack space="lg">
          {/* User Profile Header with Points */}
          <Card className="bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 p-6 rounded-2xl relative overflow-hidden">
            {/* Background decoration */}
            <Box className="absolute top-2 right-2">
              <Text className="text-red-200 text-2xl">✓</Text>
            </Box>
            
            {/* Points Badge */}
            <HStack className="justify-between items-start mb-4">
              <Badge className="bg-green-500 rounded-full px-3 py-1">
                <HStack className="items-center" space="xs">
                  <Text className="text-white text-xs">●</Text>
                  <BadgeText className="text-white font-semibold">
                    {userStats.points} pts
                  </BadgeText>
                </HStack>
              </Badge>
              
              <Pressable onPress={() => console.log('History clicked')}>
                <Text className="text-red-100 text-sm underline">History ›</Text>
              </Pressable>
            </HStack>
            
            {/* User Info */}
            <HStack className="items-center" space="md">
              <Avatar size="xl" className="border-3 border-white/20">
                {user?.avatar ? (
                  <AvatarImage source={{ uri: user.avatar }} />
                ) : (
                  <AvatarFallbackText className="text-white">
                    {user?.name || 'User'}
                  </AvatarFallbackText>
                )}
              </Avatar>
              
              <VStack className="flex-1">
                <Heading size="xl" className="text-white font-bold mb-1">
                  {user?.name}
                </Heading>
                <Text className="text-red-100 text-sm">
                  {user?.email}
                </Text>
                
                {/* Member Badge */}
                <Badge className="bg-yellow-500 self-start mt-2 px-2 py-1 rounded-full">
                  <HStack className="items-center" space="xs">
                    <Text className="text-yellow-900 text-xs">★</Text>
                    <BadgeText className="text-yellow-900 font-semibold text-xs">
                      Gold Member
                    </BadgeText>
                  </HStack>
                </Badge>
                
                <Pressable onPress={() => console.log('See benefits clicked')}>
                  <Text className="text-red-100 text-xs mt-1 underline">
                    See Benefits ›
                  </Text>
                </Pressable>
              </VStack>
            </HStack>
          </Card>

          {/* User Stats */}
          <Card className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <HStack className="justify-around">
              <VStack className="items-center">
                <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {userStats.articlesRead}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Articles Read
                </Text>
              </VStack>
              
              <Box className="w-px bg-gray-200 dark:bg-gray-700 h-12" />
              
              <VStack className="items-center">
                <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {userStats.bookmarks}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Bookmarks
                </Text>
              </VStack>
              
              <Box className="w-px bg-gray-200 dark:bg-gray-700 h-12" />
              
              <VStack className="items-center">
                <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {userStats.commentsPosted}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Comments
                </Text>
              </VStack>
            </HStack>
          </Card>

          {/* Menu Items */}
          <VStack space="sm">
            <ProfileMenuItem
              icon="💳"
              title="Payment Method"
              onPress={handlePaymentMethod}
            />
            
            <ProfileMenuItem
              icon="🔒"
              title="Change Password"
              onPress={handleChangePassword}
            />
            
            <ProfileMenuItem
              icon="❓"
              title="Get Help"
              onPress={handleGetHelp}
            />
            
            <ProfileMenuItem
              icon="⚙️"
              title="Settings"
              onPress={handleSettings}
            />
            
            <ProfileMenuItem
              icon="🚪"
              title="Log Out"
              onPress={handleLogout}
              variant="danger"
              showChevron={false}
            />
          </VStack>

          {/* Account Information Card */}
          <Card className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Heading size="md" className="mb-4 text-gray-900 dark:text-white">
              Account Information
            </Heading>
            
            <VStack space="md">
              <HStack className="justify-between items-center">
                <Text className="font-medium text-gray-700 dark:text-gray-300">Full Name</Text>
                <Text className="text-gray-600 dark:text-gray-400">{user?.name}</Text>
              </HStack>
              
              <Divider />
              
              <HStack className="justify-between items-center">
                <Text className="font-medium text-gray-700 dark:text-gray-300">Email</Text>
                <Text className="text-gray-600 dark:text-gray-400">{user?.email}</Text>
              </HStack>
              
              {user?.username && (
                <>
                  <Divider />
                  <HStack className="justify-between items-center">
                    <Text className="font-medium text-gray-700 dark:text-gray-300">Username</Text>
                    <Text className="text-gray-600 dark:text-gray-400">@{user.username}</Text>
                  </HStack>
                </>
              )}
              
              {user?.createdAt && (
                <>
                  <Divider />
                  <HStack className="justify-between items-center">
                    <Text className="font-medium text-gray-700 dark:text-gray-300">Member Since</Text>
                    <Text className="text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </HStack>
                </>
              )}
              
              <Divider />
              
              <HStack className="justify-between items-center">
                <Text className="font-medium text-gray-700 dark:text-gray-300">Email Verified</Text>
                <Badge className={user?.isEmailVerified ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}>
                  <BadgeText className={user?.isEmailVerified ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                    {user?.isEmailVerified ? "Verified" : "Not Verified"}
                  </BadgeText>
                </Badge>
              </HStack>
            </VStack>
          </Card>
        </VStack>
      </Box>
    </ScrollView>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      fallbackMessage="Please log in to view your profile"
      redirectTo="/login"
    >
      <ProfileContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});