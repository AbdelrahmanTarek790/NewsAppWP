import React, { useEffect, useState } from "react"
import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Post } from "@/app/types"
import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Input, InputField } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { VStack } from "@/components/ui/vstack"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"
import { apiService } from "@/services/api"
import { useRouter } from "expo-router"

export default function HomeScreen() {
    const { user, isAuthenticated } = useAuth()
    const { actualTheme } = useTheme()
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        try {
            setLoading(true)
            const response = await apiService.getPosts(1, 10)
            console.log("API response:", response)

            if (response.status === "success" && response.data?.posts) {
                console.log("Posts loaded:", response.data.posts.length)

                setPosts(response.data.posts)
            } else {
                // Fallback to mock data if API fails
                console.warn("API failed, using mock data")
                // setPosts(getMockPosts())
            }
        } catch (error) {
            console.error("Failed to load posts:", error)
            // Use mock data as fallback
            // setPosts(getMockPosts())
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadPosts()
        setRefreshing(false)
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        // Protected action - require authentication
        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to search for news articles.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login" as any) },
            ])
            return
        }

        router.push(`/search/${encodeURIComponent(searchQuery)}` as any)
    }

    const handleLikePost = (postId: string) => {
        // Protected action - require authentication
        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to like articles.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login" as any) },
            ])
            return
        }

        Alert.alert("Like", "Post liked! (Feature in development)")
    }

    const handleReadMore = (postId: string) => {
        // Protected action - require authentication for full articles
        // if (!isAuthenticated) {
        //     Alert.alert("Login Required", "Please log in to read full articles.", [
        //         { text: "Cancel", style: "cancel" },
        //         { text: "Login", onPress: () => router.push("/login" as any) },
        //     ])
        //     return
        // }

        router.push(`/article/${postId}` as any)
    }

    const PostCard = ({ post }: { post: Post }) => (
        <Card className="mb-4 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
            <Box className="p-4">
                <VStack space="sm">
                    {/* Post header */}
                    <HStack className="justify-between items-start">
                        <Box className="flex-1">
                            {post.categories.map((category) => (
                                <Text key={category._id} className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                    {category.name}
                                </Text>
                            ))}
                            <Heading size="sm" className="mb-2 text-black dark:text-white">
                                {post.title}
                            </Heading>
                        </Box>
                        {post.featured && (
                            <Box className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                                <Text className="text-xs text-red-800 dark:text-red-200">Featured</Text>
                            </Box>
                        )}
                    </HStack>

                    {/* Post excerpt */}
                    <Text className="text-gray-600 dark:text-gray-300 text-sm mb-3">{post.excerpt}</Text>

                    {/* Post meta */}
                    <HStack className="justify-between items-center">
                        <VStack>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">By {post.author?.name || "Unknown"}</Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</Text>
                        </VStack>

                        <HStack space="md" className="items-center">
                            <HStack space="xs" className="items-center">
                                <Text className="text-xs text-gray-500 dark:text-gray-400">👁 {post.views}</Text>
                            </HStack>

                            <Button size="xs" variant="outline" onPress={() => handleLikePost(post._id)} className="border-red-600">
                                <HStack space="xs" className="items-center">
                                    <Text className="text-xs text-red-600">❤️ {post.likes}</Text>
                                </HStack>
                            </Button>

                            <Button size="xs" onPress={() => handleReadMore(post.slug)} className="bg-red-600">
                                <ButtonText className="text-xs text-white">Read More</ButtonText>
                            </Button>
                        </HStack>
                    </HStack>
                </VStack>
            </Box>
        </Card>
    )

    return (
        <SafeAreaView 
            style={[
                styles.container, 
                { backgroundColor: Colors[actualTheme].background }
            ]}
        >
            <ScrollView 
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        tintColor={Colors[actualTheme].primary}
                        colors={[Colors[actualTheme].primary]}
                    />
                }
            >
                <Box className="p-4">
                    <VStack space="lg">
                        {/* Header */}
                        <VStack space="sm">
                            <HStack className="justify-between items-center">
                                <Heading size="xl" className="text-black dark:text-white">NewsPress</Heading>
                                <Button size="sm" variant="outline" onPress={() => router.push("/settings" as any)} className="border-red-600">
                                    <ButtonText className="text-red-600">⚙️</ButtonText>
                                </Button>
                            </HStack>

                            {user ? (
                                <Text className="text-gray-600 dark:text-gray-300">Welcome back, {user.name || "Guest"}!</Text>
                            ) : (
                                <Text className="text-gray-600 dark:text-gray-300">Welcome! Log in for personalized news.</Text>
                            )}
                        </VStack>

                        {/* Search */}
                        <HStack space="sm">
                            <Input className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" variant="outline">
                                <InputField
                                    placeholder="Search news..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleSearch}
                                    className="text-black dark:text-white"
                                    placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                />
                            </Input>
                            <Button onPress={handleSearch} className="bg-red-600">
                                <ButtonText className="text-white">Search</ButtonText>
                            </Button>
                        </HStack>

                        {/* Auth prompt for guests */}
                        {!isAuthenticated && (
                            <Card className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                <Box className="p-4">
                                    <VStack space="sm">
                                        <Text className="font-medium text-black dark:text-white">Get the full experience</Text>
                                        <Text className="text-sm text-gray-600 dark:text-gray-300">Log in to search, like articles, and get personalized news.</Text>
                                        <HStack space="sm">
                                            <Button size="sm" onPress={() => router.push("/login" as any)} className="bg-red-600">
                                                <ButtonText className="text-white">Login</ButtonText>
                                            </Button>
                                            <Button size="sm" variant="outline" onPress={() => router.push("/register" as any)} className="border-red-600">
                                                <ButtonText className="text-red-600">Sign Up</ButtonText>
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </Card>
                        )}

                        {/* Posts */}
                        {loading ? (
                            <Box className="items-center py-8">
                                <Spinner size="large" color={Colors[actualTheme].primary} />
                                <Text className="mt-2 text-gray-500 dark:text-gray-400">Loading news...</Text>
                            </Box>
                        ) : (
                            <VStack space="md">
                                <Heading size="md" className="text-black dark:text-white">Latest News</Heading>
                                {posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}

                                {posts.length === 0 && (
                                    <Box className="items-center py-8">
                                        <Text className="text-gray-500 dark:text-gray-400">No news posts available</Text>
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
    },
})
