import { Box } from "@/components/ui/box"

import { Heading } from "@/components/ui/heading"
import { VStack } from "@/components/ui/vstack"

import { Text } from "@/components/ui/text"

import { Button, ButtonText } from "@/components/ui/button"
import { HStack } from "@/components/ui/hstack"

import { Avatar, AvatarFallbackText } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

import React from "react"

const HomeScreen: React.FC = () => {
    const { user, logout } = useAuth()

    const handleLogout = (): void => {
        logout()
    }

    const getInitials = (name: string | undefined): string => {
        return name
            ? name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
            : "U"
    }

    return (
        <Box>
            {/* Header */}
            <Box >
                <HStack >
                    <VStack>
                        <Text  size="sm">
                            Welcome back,
                        </Text>
                        <Heading size="xl" >
                            {user?.name || "User"}
                        </Heading>
                    </VStack>
                    <Button variant="outline" action="secondary" onPress={handleLogout} size="sm">
                        <HStack space="xs" >
                            {/* <Icon size="sm" color="$white" /> */}
                            <ButtonText >Logout</ButtonText>
                        </HStack>
                    </Button>
                </HStack>
            </Box>

            {/* Content */}
            <Box >
                <VStack space="lg">
                    {/* Profile Card */}
                    <Card  variant="elevated">
                        <VStack space="md" >
                            <Avatar size="xl" >
                                <AvatarFallbackText>{getInitials(user?.name)}</AvatarFallbackText>
                            </Avatar>
                            <VStack space="xs" >
                                <Heading size="lg">{user?.name}</Heading>
                                <Text >{user?.email}</Text>
                            </VStack>
                        </VStack>
                    </Card>

                    {/* Dashboard Cards */}
                    <VStack space="md">
                        <Heading size="md" >
                            Dashboard
                        </Heading>

                        <HStack space="md">
                            <Card variant="outline">
                                <VStack space="xs" >
                                    {/* <UserIcon size="xl" color="$primary600" /> */}
                                    <Text size="sm"  >
                                        Profile
                                    </Text>
                                </VStack>
                            </Card>

                            <Card   variant="outline">
                                <VStack space="xs" >
                                    <Box >
                                        <Text size="lg" >
                                            ✓
                                        </Text>
                                    </Box>
                                    <Text size="sm">
                                        Tasks
                                    </Text>
                                </VStack>
                            </Card>
                        </HStack>
                    </VStack>

                    {/* Quick Actions */}
                    <VStack space="md">
                        <Heading size="md" >
                            Quick Actions
                        </Heading>

                        <VStack space="sm">
                            <Button variant="outline" action="primary" size="lg">
                                <ButtonText>View Profile</ButtonText>
                            </Button>

                            <Button variant="outline" action="secondary" size="lg">
                                <ButtonText>Settings</ButtonText>
                            </Button>
                        </VStack>
                    </VStack>
                </VStack>
            </Box>
        </Box>
    )
}

export default HomeScreen
