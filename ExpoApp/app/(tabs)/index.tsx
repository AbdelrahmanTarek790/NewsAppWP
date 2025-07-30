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
import { useRouter } from "expo-router"
import { apiService } from "@/services/api"

export default function HomeScreen() {
    const { user, isAuthenticated } = useAuth()
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
            
            if (response.status === "success" && response.data?.posts) {
                setPosts(response.data.posts)
            } else {
                // Fallback to mock data if API fails
                console.warn("API failed, using mock data")
                setPosts(getMockPosts())
            }
        } catch (error) {
            console.error("Failed to load posts:", error)
            // Use mock data as fallback
            setPosts(getMockPosts())
        } finally {
            setLoading(false)
        }
    }

    const getMockPosts = (): Post[] => [
        {
            _id: "1",
            title: "Breaking: New Technology Advances",
            content: "Stay updated with the latest technological innovations that are shaping our future. From AI developments to sustainable energy solutions, discover what's happening in the tech world.",
            excerpt: "Latest developments in technology that will change the world.",
            author: {
                _id: "author1",
                name: "John Doe",
                username: "johndoe",
                avatar: undefined,
            },
            category: {
                _id: "tech",
                name: "Technology",
                slug: "technology",
            },
            tags: ["tech", "innovation"],
            featuredImage: undefined,
            status: "published" as const,
            featured: true,
            trending: true,
            views: 1250,
            likes: 89,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
        },
        {
            _id: "2",
            title: "Sports Update: Championship Finals",
            content: "Get ready for the most exciting championship finals of the season. Teams have been preparing for months, and the competition promises to be fierce.",
            excerpt: "Exciting championship finals happening this weekend.",
            author: {
                _id: "author2",
                name: "Jane Smith",
                username: "janesmith",
                avatar: undefined,
            },
            category: {
                _id: "sports",
                name: "Sports",
                slug: "sports",
            },
            tags: ["sports", "championship"],
            featuredImage: undefined,
            status: "published" as const,
            featured: false,
            trending: true,
            views: 890,
            likes: 56,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
        },
        {
            _id: "3",
            title: "Health & Wellness: New Research Findings",
            content: "Recent medical research has revealed groundbreaking insights into healthy living and disease prevention. Learn about the latest findings that could improve your well-being.",
            excerpt: "New research reveals important health insights.",
            author: {
                _id: "author3",
                name: "Dr. Sarah Wilson",
                username: "drwilson",
                avatar: undefined,
            },
            category: {
                _id: "health",
                name: "Health",
                slug: "health",
            },
            tags: ["health", "research", "wellness"],
            featuredImage: undefined,
            status: "published" as const,
            featured: true,
            trending: false,
            views: 654,
            likes: 42,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
        },
    ]

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
        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to read full articles.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login" as any) },
            ])
            return
        }

        router.push(`/article/${postId}` as any)
    }

    const PostCard = ({ post }: { post: Post }) => (
        <Card className="mb-4">
            <Box className="p-4">
                <VStack space="sm">
                    {/* Post header */}
                    <HStack className="justify-between items-start">
                        <Box className="flex-1">
                            <Text className="text-xs text-blue-600 font-medium mb-1">{post.category.name}</Text>
                            <Heading size="sm" className="mb-2">
                                {post.title}
                            </Heading>
                        </Box>
                        {post.featured && (
                            <Box className="bg-yellow-100 px-2 py-1 rounded">
                                <Text className="text-xs text-yellow-800">Featured</Text>
                            </Box>
                        )}
                    </HStack>

                    {/* Post excerpt */}
                    <Text className="text-gray-600 text-sm mb-3">{post.excerpt}</Text>

                    {/* Post meta */}
                    <HStack className="justify-between items-center">
                        <VStack>
                            <Text className="text-xs text-gray-500">By {post.author.name}</Text>
                            <Text className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</Text>
                        </VStack>

                        <HStack space="md" className="items-center">
                            <HStack space="xs" className="items-center">
                                <Text className="text-xs text-gray-500">👁 {post.views}</Text>
                            </HStack>

                            <Button size="xs" variant="outline" onPress={() => handleLikePost(post._id)}>
                                <HStack space="xs" className="items-center">
                                    <Text className="text-xs">❤️ {post.likes}</Text>
                                </HStack>
                            </Button>

                            <Button size="xs" onPress={() => handleReadMore(post._id)}>
                                <ButtonText className="text-xs">Read More</ButtonText>
                            </Button>
                        </HStack>
                    </HStack>
                </VStack>
            </Box>
        </Card>
    )

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Box className="p-4">
                    <VStack space="lg">
                        {/* Header */}
                        <VStack space="sm">
                            <HStack className="justify-between items-center">
                                <Heading size="xl">NewsPress</Heading>
                                <Button size="sm" variant="outline" onPress={() => router.push("/settings" as any)}>
                                    <ButtonText>⚙️</ButtonText>
                                </Button>
                            </HStack>

                            {user ? (
                                <Text className="text-gray-600">Welcome back, {user.name}!</Text>
                            ) : (
                                <Text className="text-gray-600">Welcome! Log in for personalized news.</Text>
                            )}
                        </VStack>

                        {/* Search */}
                        <HStack space="sm">
                            <Input className="flex-1" variant="outline">
                                <InputField
                                    placeholder="Search news..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleSearch}
                                />
                            </Input>
                            <Button onPress={handleSearch}>
                                <ButtonText>Search</ButtonText>
                            </Button>
                        </HStack>

                        {/* Auth prompt for guests */}
                        {!isAuthenticated && (
                            <Card className="bg-blue-50">
                                <Box className="p-4">
                                    <VStack space="sm">
                                        <Text className="font-medium">Get the full experience</Text>
                                        <Text className="text-sm text-gray-600">Log in to search, like articles, and get personalized news.</Text>
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

                        {/* Posts */}
                        {loading ? (
                            <Box className="items-center py-8">
                                <Spinner size="large" />
                                <Text className="mt-2 text-gray-500">Loading news...</Text>
                            </Box>
                        ) : (
                            <VStack space="md">
                                <Heading size="md">Latest News</Heading>
                                {posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}

                                {posts.length === 0 && (
                                    <Box className="items-center py-8">
                                        <Text className="text-gray-500">No news posts available</Text>
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
