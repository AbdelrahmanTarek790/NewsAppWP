import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Simple Divider component
const Divider = () => <Box className="h-px bg-gray-200 my-2" />;

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen (placeholder)
    console.log('Edit profile clicked');
  };

  return (
    <ScrollView style={styles.container}>
      <Box className="p-6">
        <VStack space="lg">
          {/* Profile Header */}
          <Card className="items-center p-6">
            <Avatar size="xl" className="mb-4">
              {user?.avatar ? (
                <AvatarImage source={{ uri: user.avatar }} />
              ) : (
                <AvatarFallbackText>{user?.name || 'User'}</AvatarFallbackText>
              )}
            </Avatar>
            
            <Heading size="xl" className="text-center mb-2">
              {user?.name}
            </Heading>
            
            {user?.username && (
              <Text className="text-gray-600 mb-2">@{user.username}</Text>
            )}
            
            <Text className="text-gray-500">{user?.email}</Text>
            
            {user?.role && (
              <Text className="text-blue-600 font-medium mt-2 capitalize">
                {user.role}
              </Text>
            )}
          </Card>

          {/* Account Info */}
          <Card>
            <Box className="p-4">
              <Heading size="md" className="mb-4">Account Information</Heading>
              
              <VStack space="md">
                <HStack className="justify-between items-center">
                  <Text className="font-medium">Full Name</Text>
                  <Text className="text-gray-600">{user?.name}</Text>
                </HStack>
                
                <Divider />
                
                <HStack className="justify-between items-center">
                  <Text className="font-medium">Email</Text>
                  <Text className="text-gray-600">{user?.email}</Text>
                </HStack>
                
                {user?.username && (
                  <>
                    <Divider />
                    <HStack className="justify-between items-center">
                      <Text className="font-medium">Username</Text>
                      <Text className="text-gray-600">@{user.username}</Text>
                    </HStack>
                  </>
                )}
                
                {user?.createdAt && (
                  <>
                    <Divider />
                    <HStack className="justify-between items-center">
                      <Text className="font-medium">Member Since</Text>
                      <Text className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </>
                )}
                
                <Divider />
                
                <HStack className="justify-between items-center">
                  <Text className="font-medium">Email Verified</Text>
                  <Text className={user?.isEmailVerified ? "text-green-600" : "text-red-600"}>
                    {user?.isEmailVerified ? "Verified" : "Not Verified"}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Card>

          {/* Actions */}
          <VStack space="md">
            <Button variant="outline" onPress={handleEditProfile}>
              <ButtonText>Edit Profile</ButtonText>
            </Button>
            
            <Button 
              variant="outline" 
              action="secondary"
              onPress={() => router.push('/settings')}
            >
              <ButtonText>Settings</ButtonText>
            </Button>
            
            <Button 
              variant="solid" 
              action="negative"
              onPress={handleLogout}
            >
              <ButtonText>Logout</ButtonText>
            </Button>
          </VStack>
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
    backgroundColor: '#f5f5f5',
  },
});