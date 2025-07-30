import React, { useState, useEffect } from "react"
import { StyleSheet, Text, ScrollView, RefreshControl, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Box } from "@/components/ui/box"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { Heading } from "@/components/ui/heading"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, InputField } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "expo-router"
import { Post } from "@/app/types"

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
            // For now, we'll use mock data since backend might not be running
            // In production, uncomment the API call below
            // const response = await apiService.getPosts()
            // setPosts(response.data?.posts || [])
            
            // Mock data for demonstration
            const mockPosts: Post[] = [
                {
                    _id: "1",
                    title: "Breaking: New Technology Advances",
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
                    excerpt: "Latest developments in technology that will change the world.",
                    author: {
                        _id: "author1",
                        name: "John Doe",
                        username: "johndoe",
                        avatar: undefined
                    },
                    category: {
                        _id: "tech",
                        name: "Technology",
                        slug: "technology"
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
                    publishedAt: new Date().toISOString()
                },
                {
                    _id: "2",
                    title: "Sports Update: Championship Finals",
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
                    excerpt: "Exciting championship finals happening this weekend.",
                    author: {
                        _id: "author2",
                        name: "Jane Smith",
                        username: "janesmith",
                        avatar: undefined
                    },
                    category: {
                        _id: "sports",
                        name: "Sports",
                        slug: "sports"
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
                    publishedAt: new Date().toISOString()
                }
            ]
            setPosts(mockPosts)
        } catch (error) {
            console.error('Failed to load posts:', error)
            Alert.alert('Error', 'Failed to load news posts')
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
            Alert.alert(
                'Login Required',
                'Please log in to search for news articles.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]
            )
            return
        }

        try {
            setLoading(true)
            // const response = await apiService.searchPosts(searchQuery)
            // setPosts(response.data?.posts || [])
            Alert.alert('Search', `Searching for: ${searchQuery}`)
        } catch {
            Alert.alert('Error', 'Failed to search posts')
        } finally {
            setLoading(false)
        }
    }

    const handleLikePost = (postId: string) => {
        // Protected action - require authentication
        if (!isAuthenticated) {
            Alert.alert(
                'Login Required',
                'Please log in to like articles.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]
            )
            return
        }

        Alert.alert('Like', 'Post liked! (Feature in development)')
    }

    const handleReadMore = (postId: string) => {
        // Protected action - require authentication for full articles
        if (!isAuthenticated) {
            Alert.alert(
                'Login Required',
                'Please log in to read full articles.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]
            )
            return
        }

        Alert.alert('Read More', 'Opening full article... (Feature in development)')
    }

    const PostCard = ({ post }: { post: Post }) => (
        <Card className="mb-4">
            <Box className="p-4">
                <VStack space="sm">
                    {/* Post header */}
                    <HStack className="justify-between items-start">
                        <Box className="flex-1">
                            <Text className="text-xs text-blue-600 font-medium mb-1">
                                {post.category.name}
                            </Text>
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
                    <Text className="text-gray-600 text-sm mb-3">
                        {post.excerpt}
                    </Text>

                    {/* Post meta */}
                    <HStack className="justify-between items-center">
                        <VStack>
                            <Text className="text-xs text-gray-500">
                                By {post.author.name}
                            </Text>
                            <Text className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </Text>
                        </VStack>

                        <HStack space="md" className="items-center">
                            <HStack space="xs" className="items-center">
                                <Text className="text-xs text-gray-500">👁 {post.views}</Text>
                            </HStack>
                            
                            <Button
                                size="xs"
                                variant="outline"
                                onPress={() => handleLikePost(post._id)}
                            >
                                <HStack space="xs" className="items-center">
                                    <Text className="text-xs">❤️ {post.likes}</Text>
                                </HStack>
                            </Button>

                            <Button
                                size="xs"
                                onPress={() => handleReadMore(post._id)}
                            >
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
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Box className="p-4">
                    <VStack space="lg">
                        {/* Header */}
                        <VStack space="sm">
                            <HStack className="justify-between items-center">
                                <Heading size="xl">NewsPress</Heading>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onPress={() => router.push('/settings')}
                                >
                                    <ButtonText>⚙️</ButtonText>
                                </Button>
                            </HStack>
                            
                            {user ? (
                                <Text className="text-gray-600">Welcome back, {user.name}!</Text>
                            ) : (
                                <Text className="text-gray-600">
                                    Welcome! Log in for personalized news.
                                </Text>
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
                                        <Text className="text-sm text-gray-600">
                                            Log in to search, like articles, and get personalized news.
                                        </Text>
                                        <HStack space="sm">
                                            <Button 
                                                size="sm"
                                                onPress={() => router.push('/login')}
                                            >
                                                <ButtonText>Login</ButtonText>
                                            </Button>
                                            <Button 
                                                size="sm"
                                                variant="outline"
                                                onPress={() => router.push('/register')}
                                            >
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
        backgroundColor: '#f9fafb',
    },
})
