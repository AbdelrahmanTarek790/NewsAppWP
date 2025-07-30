import React, { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';


import { RootStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '@/context/AuthContext';
import { FormErrors } from '../types';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Alert, AlertText } from '@/components/ui/alert';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Pressable } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';


type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  
  const { login, isLoading } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) return;
    
    const result = await login(email, password);
    
    if (!result.success) {
      setAlertMessage(result.error || 'Login failed. Please try again.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  return (
    <Center>
      <Box >
        <VStack space="lg" >
          <Heading size="2xl" >
            Welcome Back
          </Heading>
          
          {showAlert && (
            <Alert action="error" variant="solid" >
              {/* <AlertIcon as={AlertCircleIcon} /> */}
              <AlertText>{alertMessage}</AlertText>
            </Alert>
          )}

          <VStack space="md" >
            <Box>
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!errors.email}
              >
                <InputField
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
              {errors.email && (
                <Text size="sm" >
                  {errors.email}
                </Text>
              )}
            </Box>

            <Box>
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!errors.password}
              >
                <InputField
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <InputSlot onPress={() => setShowPassword(!showPassword)}>
                  <Pressable>
                    {/* {showPassword ? <EyeOffIcon /> : <EyeIcon />} */}
                    <Text>{showPassword ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </InputSlot>
              </Input>
              {errors.password && (
                <Text size="sm" >
                  {errors.password}
                </Text>
              )}
            </Box>
          </VStack>

          <Button
            size="lg"
            variant="solid"
            action="primary"
           
            onPress={handleLogin}
            isDisabled={isLoading}
          
          >
            {isLoading ? (
              <HStack space="sm" >
                <Spinner size="small" />
                <ButtonText>Signing In...</ButtonText>
              </HStack>
            ) : (
              <ButtonText>Sign In</ButtonText>
            )}
          </Button>

          <HStack space="sm">
            <Text size="sm" >
              Don't have an account?
            </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text size="sm" >
                Sign Up
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
};

export default LoginScreen;