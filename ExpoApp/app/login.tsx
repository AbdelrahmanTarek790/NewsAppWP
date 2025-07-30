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
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { Pressable } from "react-native"
import { FormErrors } from "./types"

export default function LoginScreen() {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string>("")

    const { login } = useAuth()
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
        <Box className="flex-1 ">
            <Center className="flex-1 px-6">
                <VStack space="xl" className="w-full max-w-sm">
                    <VStack space="md">
                        <Heading size="3xl" className="text-center text-gray-900">
                            Welcome Back
                        </Heading>
                        <Text className="text-center text-gray-600">Sign in to your account</Text>
                    </VStack>

                    {serverError ? (
                        <Alert action="error" className="mb-4">
                            <AlertText>{serverError}</AlertText>
                        </Alert>
                    ) : null}

                    <VStack space="md">
                        <VStack space="xs">
                            <Text className="text-gray-700 font-medium">Email</Text>
                            <Input variant="outline" size="md" className="text-black" isInvalid={!!errors.email}>
                                <InputField
                                    type="text"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    className="text-black"
                                />
                            </Input>
                            {errors.email && <Text className="text-red-500 text-sm">{errors.email}</Text>}
                        </VStack>

                        <VStack space="xs">
                            <Text className="text-gray-700 font-medium">Password</Text>
                            <Input variant="outline" size="md" className="text-black" isInvalid={!!errors.password}>
                                <InputField
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    className="text-black"
                                />
                                <InputSlot onPress={togglePasswordVisibility} className="pr-3">
                                    <Text className="text-gray-500 text-sm">{showPassword ? "Hide" : "Show"}</Text>
                                </InputSlot>
                            </Input>
                            {errors.password && <Text className="text-red-500 text-sm">{errors.password}</Text>}
                        </VStack>
                    </VStack>

                    <Button onPress={handleLogin} disabled={isLoading} className="mt-6">
                        {isLoading ? (
                            <HStack space="sm" className="items-center">
                                <Spinner size="small" color="white" />
                                <ButtonText>Signing In...</ButtonText>
                            </HStack>
                        ) : (
                            <ButtonText>Sign In</ButtonText>
                        )}
                    </Button>

                    <HStack space="xs" className="justify-center mt-6">
                        <Text className="text-gray-600">Don&apos;t have an account?</Text>
                        <Pressable onPress={navigateToRegister}>
                            <Text className="text-blue-600 font-medium">Sign up</Text>
                        </Pressable>
                    </HStack>
                </VStack>
            </Center>
        </Box>
    )
}
