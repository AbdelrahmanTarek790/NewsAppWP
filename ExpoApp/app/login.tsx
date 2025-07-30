import { Alert, AlertText } from "@/components/ui/alert"
import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Center } from "@/components/ui/center"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Input, InputField, InputSlot } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { Pressable, SafeAreaView } from "react-native"
import { FormErrors } from "./types"

export default function LoginScreen() {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string>("")

    const { login } = useAuth()
    const { actualTheme } = useTheme()
    const router = useRouter()

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid"
        }

        if (!password.trim()) {
            newErrors.password = "Password is required"
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleLogin = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        setServerError("")

        try {
            const result = await login(email.trim(), password)

            if (result.success) {
                router.replace("/(tabs)"as any)
            } else {
                setServerError(result.error || "Login failed")
            }
        } catch {
            setServerError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const navigateToRegister = () => {
        router.push("/register"as any)
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <SafeAreaView 
            style={{ 
                flex: 1, 
                backgroundColor: Colors[actualTheme].background 
            }}
        >
            <Box className="flex-1">
                {/* Back Button */}
                <Box className="p-4">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onPress={() => router.back()} 
                        className="self-start border-red-600"
                    >
                        <ButtonText className="text-red-600">← Back</ButtonText>
                    </Button>
                </Box>

                <Center className="flex-1 px-6">
                    <VStack space="xl" className="w-full max-w-sm">
                        <VStack space="md">
                            <Heading size="3xl" className="text-center text-black dark:text-white">
                                Welcome Back
                            </Heading>
                            <Text className="text-center text-gray-600 dark:text-gray-300">Sign in to your account</Text>
                        </VStack>

                        {serverError ? (
                            <Alert action="error" className="mb-4">
                                <AlertText>{serverError}</AlertText>
                            </Alert>
                        ) : null}

                        <VStack space="md">
                            <VStack space="xs">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium">Email</Text>
                                <Input variant="outline" size="md" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" isInvalid={!!errors.email}>
                                    <InputField
                                        type="text"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        className="text-black dark:text-white"
                                        placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    />
                                </Input>
                                {errors.email && <Text className="text-red-500 text-sm">{errors.email}</Text>}
                            </VStack>

                            <VStack space="xs">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium">Password</Text>
                                <Input variant="outline" size="md" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" isInvalid={!!errors.password}>
                                    <InputField
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChangeText={setPassword}
                                        className="text-black dark:text-white"
                                        placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <InputSlot onPress={togglePasswordVisibility} className="pr-3">
                                        <Text className="text-gray-500 text-sm">{showPassword ? "Hide" : "Show"}</Text>
                                    </InputSlot>
                                </Input>
                                {errors.password && <Text className="text-red-500 text-sm">{errors.password}</Text>}
                            </VStack>
                        </VStack>

                        <Button onPress={handleLogin} disabled={isLoading} className="mt-6 bg-red-600">
                            {isLoading ? (
                                <HStack space="sm" className="items-center">
                                    <Spinner size="small" color="white" />
                                    <ButtonText className="text-white">Signing In...</ButtonText>
                                </HStack>
                            ) : (
                                <ButtonText className="text-white">Sign In</ButtonText>
                            )}
                        </Button>

                        <HStack space="xs" className="justify-center mt-6">
                            <Text className="text-gray-600 dark:text-gray-300">Don&apos;t have an account?</Text>
                            <Pressable onPress={navigateToRegister}>
                                <Text className="text-red-600 dark:text-red-400 font-medium">Sign up</Text>
                            </Pressable>
                        </HStack>
                    </VStack>
                </Center>
            </Box>
        </SafeAreaView>
    )
}
