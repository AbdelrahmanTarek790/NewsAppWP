import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Post } from "@/app/types"
import { ProtectedRoute } from "@/components/ProtectedRoute"
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

function SearchContent() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const { q } = useLocalSearchParams<{ q: string }>()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState(q || "")

    useEffect(() => {
        if (q) {
            searchPosts(q)
        }
    }, [q])

    const searchPosts = async (query: string) => {
        try {
            setLoading(true)
            const response = await apiService.searchPosts(query, 1)

            if (response.status === "success" && response.data?.posts) {
                setPosts(response.data.posts)
            } else {
                // Fallback to mock search results
                // setPosts();
            }
        } catch (error) {
            console.error("Search failed:", error)
            // setPosts();
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        if (searchQuery) {
            setRefreshing(true)
            await searchPosts(searchQuery)
            setRefreshing(false)
        }
    }

    const handleNewSearch = async () => {
        if (!searchQuery.trim()) return

        router.setParams({ q: searchQuery })
        await searchPosts(searchQuery)
    }

    const handleLikePost = (postId: string) => {
        Alert.alert("Like", "Post liked! (Feature in development)")
    }

    const handleReadMore = (postId: string) => {
        router.push(`/article/${postId}` as any)
    }

    const PostCard = ({ post }: { post: Post }) => (
        <Card className="mb-4">
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
                            <Button variant="outline" size="sm" onPress={() => router.back()} className="self-start">
                                <ButtonText>← Back</ButtonText>
                            </Button>

                            <Heading size="xl">Search Results</Heading>
                            {q && <Text className="text-gray-600">Results for "{q}"</Text>}
                        </VStack>

                        {/* Search bar */}
                        <HStack space="sm">
                            <Input className="flex-1" variant="outline">
                                <InputField
                                    placeholder="Search news..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleNewSearch}
                                />
                            </Input>
                            <Button onPress={handleNewSearch}>
                                <ButtonText>Search</ButtonText>
                            </Button>
                        </HStack>

                        {/* Results */}
                        {loading ? (
                            <Box className="items-center py-8">
                                <Spinner size="large" />
                                <Text className="mt-2 text-gray-500">Searching...</Text>
                            </Box>
                        ) : (
                            <VStack space="md">
                                {posts.length > 0 ? (
                                    <>
                                        <Text className="text-sm text-gray-600">
                                            {posts.length} result{posts.length !== 1 ? "s" : ""} found
                                        </Text>
                                        {posts.map((post) => (
                                            <PostCard key={post._id} post={post} />
                                        ))}
                                    </>
                                ) : (
                                    <Box className="items-center py-8">
                                        <Text className="text-gray-500 text-center">No articles found for "{searchQuery}"</Text>
                                        <Text className="text-gray-400 text-center mt-2">Try different keywords or browse categories</Text>
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

export default function SearchPage() {
    return (
        <ProtectedRoute requireAuth={true} fallbackMessage="Please log in to search articles" redirectTo="/login">
            <SearchContent />
        </ProtectedRoute>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
})
