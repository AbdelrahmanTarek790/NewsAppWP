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

export default function RegisterScreen() {
    const [name, setName] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string>("")

    const { register } = useAuth()
    const { actualTheme } = useTheme()
    const router = useRouter()

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!name.trim()) {
            newErrors.name = "Name is required"
        } else if (name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters"
        }

        if (!username.trim()) {
            newErrors.username = "Username is required"
        } else if (username.length < 3 || username.length > 20) {
            newErrors.username = "Username must be between 3 and 20 characters"
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores"
        }

        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid"
        }

        if (!password.trim()) {
            newErrors.password = "Password is required"
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleRegister = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        setServerError("")

        try {
            const result = await register(name.trim(), email.trim(), password)

            if (result.success) {
                router.replace("/(tabs)" as any)
            } else {
                setServerError(result.error || "Registration failed")
            }
        } catch {
            setServerError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const navigateToLogin = () => {
        router.push("/login" as any)
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
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
                                Create Account
                            </Heading>
                            <Text className="text-center text-gray-600 dark:text-gray-300">Sign up to get started</Text>
                        </VStack>

                        {serverError ? (
                            <Alert action="error" className="mb-4">
                                <AlertText>{serverError}</AlertText>
                            </Alert>
                        ) : null}

                        <VStack space="md">
                            <VStack space="xs">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium">Full Name</Text>
                                <Input variant="outline" size="md" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" isInvalid={!!errors.name}>
                                    <InputField
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                        autoComplete="name"
                                        className="text-black dark:text-white"
                                        placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    />
                                </Input>
                                {errors.name && <Text className="text-red-500 text-sm">{errors.name}</Text>}
                            </VStack>

                            <VStack space="xs">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium">Username</Text>
                                <Input variant="outline" size="md" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" isInvalid={!!errors.username}>
                                    <InputField
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                        autoComplete="username"
                                        className="text-black dark:text-white"
                                        placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    />
                                </Input>
                                {errors.username && <Text className="text-red-500 text-sm">{errors.username}</Text>}
                            </VStack>

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

                            <VStack space="xs">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium">Confirm Password</Text>
                                <Input variant="outline" size="md" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" isInvalid={!!errors.confirmPassword}>
                                    <InputField
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        className="text-black dark:text-white"
                                        placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <InputSlot onPress={toggleConfirmPasswordVisibility} className="pr-3">
                                        <Text className="text-gray-500 text-sm">{showConfirmPassword ? "Hide" : "Show"}</Text>
                                    </InputSlot>
                                </Input>
                                {errors.confirmPassword && <Text className="text-red-500 text-sm">{errors.confirmPassword}</Text>}
                            </VStack>
                        </VStack>

                        <Button onPress={handleRegister} disabled={isLoading} className="mt-6 bg-red-600">
                            {isLoading ? (
                                <HStack space="sm" className="items-center">
                                    <Spinner size="small" color="white" />
                                    <ButtonText className="text-white">Creating Account...</ButtonText>
                                </HStack>
                            ) : (
                                <ButtonText className="text-white">Create Account</ButtonText>
                            )}
                        </Button>

                        <HStack space="xs" className="justify-center mt-6">
                            <Text className="text-gray-600 dark:text-gray-300">Already have an account?</Text>
                            <Pressable onPress={navigateToLogin}>
                                <Text className="text-red-600 dark:text-red-400 font-medium">Sign in</Text>
                            </Pressable>
                        </HStack>
                    </VStack>
                </Center>
            </Box>
        </SafeAreaView>
    )
}
