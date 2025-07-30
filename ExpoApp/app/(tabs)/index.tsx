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
import { apiService } from "@/services/api"
import { useRouter } from "expo-router"

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
        <Card className="mb-4 bg-white shadow-lg">
            <Box className="p-4">
                <VStack space="sm">
                    {/* Post header */}
                    <HStack className="justify-between items-start">
                        <Box className="flex-1">
                            {post.categories.map((category) => (
                                <Text key={category._id} className="text-xs text-blue-600 font-medium mb-1">
                                    {category.name}
                                </Text>
                            ))}
                            <Heading size="sm" className="mb-2 text-black">
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
                            <Text className="text-xs text-gray-500">By {post.author?.name || "Unknown"}</Text>
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

                            <Button size="xs" onPress={() => handleReadMore(post.slug)}>
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
                                <Text className="text-gray-600">Welcome back, {user.name || "Guest"}!</Text>
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
