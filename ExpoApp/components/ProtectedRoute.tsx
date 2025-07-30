import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Center } from '@/components/ui/center';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackMessage?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  fallbackMessage = "Please log in to access this feature",
  redirectTo = "/login"
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <Center className="flex-1">
        <Spinner size="large" />
      </Center>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Box className="flex-1 justify-center items-center p-6">
        <Text className="text-center mb-4 text-gray-600">
          {fallbackMessage}
        </Text>
        <Button onPress={() => router.push(redirectTo)}>
          <ButtonText>Login</ButtonText>
        </Button>
      </Box>
    );
  }

  // If user is authenticated or auth is not required
  return <>{children}</>;
};

export default ProtectedRoute;