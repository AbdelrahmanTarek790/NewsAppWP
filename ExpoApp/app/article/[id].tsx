import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Post } from "@/app/types"
import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Spinner } from "@/components/ui/spinner"
import { VStack } from "@/components/ui/vstack"
import { useAuth } from "@/context/AuthContext"
import { apiService } from "@/services/api"

function ArticleContent() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)

    useEffect(() => {
        if (id) {
            loadPost(id)
        }
    }, [id])

    const loadPost = async (postId: string) => {
        try {
            setLoading(true)
            const response = await apiService.getPost(postId)

            if (response.status === "success" && response.data?.post) {
                setPost(response.data.post)
            } else {
                // Fallback to mock post
                // setPost(getMockPost(postId));
            }
        } catch (error) {
            console.error("Failed to load post:", error)
            // setPost(getMockPost(postId));
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async () => {
        if (!post) return

        try {
            // API call would go here
            // await apiService.likePost(post._id);
            setIsLiked(!isLiked)
            Alert.alert("Success", isLiked ? "Article unliked!" : "Article liked!")
        } catch (error) {
            Alert.alert("Error", "Failed to like article")
        }
    }

    const handleShare = () => {
        Alert.alert("Share", "Share functionality coming soon!")
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Box className="flex-1 justify-center items-center">
                    <Spinner size="large" />
                    <Text className="mt-4 text-gray-500">Loading article...</Text>
                </Box>
            </SafeAreaView>
        )
    }

    if (!post) {
        return (
            <SafeAreaView style={styles.container}>
                <Box className="flex-1 justify-center items-center p-6">
                    <Text className="text-center text-gray-600 mb-4">Article not found</Text>
                    <Button onPress={() => router.back()}>
                        <ButtonText>Go Back</ButtonText>
                    </Button>
                </Box>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Box className="p-4">
                    <VStack space="lg">
                        {/* Back button */}
                        <Button variant="outline" size="sm" onPress={() => router.back()} className="self-start">
                            <ButtonText>← Back</ButtonText>
                        </Button>

                        {/* Article header */}
                        <Card>
                            <Box className="p-6">
                                <VStack space="md">
                                    <HStack className="justify-between items-start">
                                        {post.categories.map((category) => (
                                            <Text key={category._id} className="text-xs text-blue-600 font-medium mb-1">
                                                {category.name}
                                            </Text>
                                        ))}
                                        {post.featured && (
                                            <Box className="bg-yellow-100 px-2 py-1 rounded">
                                                <Text className="text-xs text-yellow-800">Featured</Text>
                                            </Box>
                                        )}
                                    </HStack>

                                    <Heading size="xl">{post.title}</Heading>

                                    <HStack className="justify-between items-center">
                                        <VStack>
                                            <Text className="text-sm font-medium">{post.author.name}</Text>
                                            <Text className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</Text>
                                        </VStack>

                                        <HStack space="md" className="items-center">
                                            <Text className="text-xs text-gray-500">👁 {post.views}</Text>
                                            <Text className="text-xs text-gray-500">❤️ {post.likes}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </Box>
                        </Card>

                        {/* Article content */}
                        <Card>
                            <Box className="p-6">
                                <Text className="text-base leading-6 text-gray-800">{post.content}</Text>
                            </Box>
                        </Card>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <Card>
                                <Box className="p-4">
                                    <VStack space="sm">
                                        <Text className="font-medium text-sm">Tags</Text>
                                        <HStack space="sm" className="flex-wrap">
                                            {post.tags.map((tag, index) => (
                                                <Box key={index} className="bg-blue-100 px-2 py-1 rounded">
                                                    <Text className="text-xs text-blue-800">#{tag}</Text>
                                                </Box>
                                            ))}
                                        </HStack>
                                    </VStack>
                                </Box>
                            </Card>
                        )}

                        {/* Actions */}
                        <HStack space="md" className="justify-center">
                            <Button variant={isLiked ? "solid" : "outline"} onPress={handleLike} className="flex-1">
                                <ButtonText>❤️ {isLiked ? "Liked" : "Like"}</ButtonText>
                            </Button>

                            <Button variant="outline" onPress={handleShare} className="flex-1">
                                <ButtonText>📤 Share</ButtonText>
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </ScrollView>
        </SafeAreaView>
    )
}

export default function ArticlePage() {
    return (
        // <ProtectedRoute requireAuth={true} fallbackMessage="Please log in to read full articles" redirectTo="/login">
        <ArticleContent />
        // </ProtectedRoute>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
})
