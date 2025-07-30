import React, { useEffect, useState } from "react"
import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Category } from "@/app/types"
import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Spinner } from "@/components/ui/spinner"
import { VStack } from "@/components/ui/vstack"
import { useAuth } from "@/context/AuthContext"
import { apiService } from "@/services/api"
import { useRouter } from "expo-router"

export default function CategoriesScreen() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            setLoading(true)
            console.log("Loading categories...")
            const response = await apiService.getCategories()
            console.log("API response:", response)

            if (response.status === "success" && response.data?.categories && Array.isArray(response.data.categories)) {
                const validCategories = response.data.categories.filter((cat) => cat && cat._id && cat.name)
                console.log("Valid categories found:", validCategories.length)
                setCategories(validCategories)
            } else {
                // Fallback to mock categories
                console.warn("API failed or returned invalid data, using mock categories")
                console.log("Response status:", response.status)
                console.log("Response data:", response.data)
                setCategories(getMockCategories())
            }
        } catch (error) {
            console.error("Failed to load categories:", error)
            // Use mock data as fallback
            setCategories(getMockCategories())
        } finally {
            setLoading(false)
        }
    }

    const getMockCategories = (): Category[] => [
        {
            _id: "tech",
            name: "Technology",
            slug: "technology",
            description: "Latest tech news and innovations",
            color: "#3B82F6",
            icon: "💻",
        },
        {
            _id: "sports",
            name: "Sports",
            slug: "sports",
            description: "Sports news and updates",
            color: "#10B981",
            icon: "⚽",
        },
        {
            _id: "health",
            name: "Health",
            slug: "health",
            description: "Health and wellness news",
            color: "#F59E0B",
            icon: "🏥",
        },
        {
            _id: "business",
            name: "Business",
            slug: "business",
            description: "Business and finance news",
            color: "#8B5CF6",
            icon: "💼",
        },
        {
            _id: "entertainment",
            name: "Entertainment",
            slug: "entertainment",
            description: "Entertainment and celebrity news",
            color: "#EF4444",
            icon: "🎬",
        },
        {
            _id: "politics",
            name: "Politics",
            slug: "politics",
            description: "Political news and analysis",
            color: "#6B7280",
            icon: "🏛️",
        },
    ]

    const onRefresh = async () => {
        setRefreshing(true)
        await loadCategories()
        setRefreshing(false)
    }

    const handleCategoryPress = async (category: Category) => {
        if (!category || !category.slug) {
            console.warn("Invalid category pressed:", category)
            return
        }

        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to browse category articles.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login" as any) },
            ])
            return
        }

        router.push(`/category/${category.slug}` as any)
    }

    const CategoryCard = ({ category }: { category: Category }) => {
        if (!category) return null

        return (
            <Card className="mb-4" style={{ borderLeftColor: category.color || "#ccc", borderLeftWidth: 4 }}>
                <Box className="p-4">
                    <Button variant="outline" className="justify-start p-0" onPress={() => handleCategoryPress(category)}>
                        <HStack className="items-center flex-1" space="md">
                            <Box
                                className="w-12 h-12 items-center justify-center rounded-lg"
                                style={{ backgroundColor: (category.color || "#ccc") + "20" }}
                            >
                                <Text className="text-2xl">{category.icon || "📁"}</Text>
                            </Box>

                            <VStack className="flex-1" space="xs">
                                <Heading size="md" className="text-left">
                                    {category.name || "Unnamed Category"}
                                </Heading>
                                {category.description && <Text className="text-gray-600 text-sm text-left">{category.description}</Text>}
                            </VStack>

                            <Text className="text-gray-400">›</Text>
                        </HStack>
                    </Button>
                </Box>
            </Card>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Box className="p-4">
                    <VStack space="lg">
                        {/* Header */}
                        <VStack space="sm">
                            <Heading size="xl">News Categories</Heading>
                            <Text className="text-gray-600">Explore news by category</Text>
                        </VStack>

                        {/* Auth prompt for guests */}
                        {!isAuthenticated && (
                            <Card className="bg-blue-50">
                                <Box className="p-4">
                                    <VStack space="sm">
                                        <Text className="font-medium">Browse Categories</Text>
                                        <Text className="text-sm text-gray-600">
                                            Log in to access category articles and get personalized content.
                                        </Text>
                                        <HStack space="sm">
                                            <Button size="sm" onPress={() => router.push("/login" as any)}>
                                                <ButtonText>Login</ButtonText>
                                            </Button>
                                            <Button size="sm" variant="outline" onPress={() => router.push("/register" as any)}>
                                                <ButtonText>Sign Up</ButtonText>
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </Card>
                        )}

                        {/* Categories */}
                        {loading ? (
                            <Box className="items-center py-8">
                                <Spinner size="large" />
                                <Text className="mt-2 text-gray-500">Loading categories...</Text>
                            </Box>
                        ) : (
                            <VStack space="md">
                                {categories
                                    .filter((category) => category && category._id && category.name)
                                    .map((category) => (
                                        <CategoryCard key={category._id} category={category} />
                                    ))}

                                {categories.length === 0 && (
                                    <Box className="items-center py-8">
                                        <Text className="text-gray-500">No categories available</Text>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
})
