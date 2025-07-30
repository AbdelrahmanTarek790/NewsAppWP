import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, Image } from "react-native"
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
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"
import { apiService } from "@/services/api"

function ArticleContent() {
    const { isAuthenticated } = useAuth()
    const { actualTheme } = useTheme()
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
            <SafeAreaView 
                style={[
                    styles.container, 
                    { backgroundColor: Colors[actualTheme].background }
                ]}
            >
                <Box className="flex-1 justify-center items-center">
                    <Spinner size="large" color={Colors[actualTheme].primary} />
                    <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading article...</Text>
                </Box>
            </SafeAreaView>
        )
    }

    if (!post) {
        return (
            <SafeAreaView 
                style={[
                    styles.container, 
                    { backgroundColor: Colors[actualTheme].background }
                ]}
            >
                <Box className="flex-1 justify-center items-center p-6">
                    <Text className="text-center text-gray-600 dark:text-gray-300 mb-4">Article not found</Text>
                    <Button onPress={() => router.back()} className="bg-red-600">
                        <ButtonText className="text-white">Go Back</ButtonText>
                    </Button>
                </Box>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView 
            style={[
                styles.container, 
                { backgroundColor: Colors[actualTheme].background }
            ]}
        >
            <ScrollView>
                <Box className="p-4">
                    <VStack space="lg">
                        {/* Back button */}
                        <Button variant="outline" size="sm" onPress={() => router.back()} className="self-start border-red-600">
                            <ButtonText className="text-red-600">← Back</ButtonText>
                        </Button>

                        {/* Featured Image */}
                        {post.featuredImage && (
                            <Card className="overflow-hidden">
                                <Image
                                    source={{ uri: post.featuredImage }}
                                    style={{ width: '100%', height: 250 }}
                                    className="bg-gray-200 dark:bg-gray-700"
                                    resizeMode="cover"
                                />
                            </Card>
                        )}

                        {/* Article header */}
                        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <Box className="p-6">
                                <VStack space="md">
                                    <HStack className="justify-between items-start">
                                        {post.categories.map((category) => (
                                            <Text key={category._id} className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                                {category.name}
                                            </Text>
                                        ))}
                                        {post.featured && (
                                            <Box className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                                                <Text className="text-xs text-red-800 dark:text-red-200">Featured</Text>
                                            </Box>
                                        )}
                                    </HStack>

                                    <Heading size="xl" className="text-black dark:text-white">{post.title}</Heading>

                                    <HStack className="justify-between items-center">
                                        <VStack>
                                            <Text className="text-sm font-medium text-black dark:text-white">{post.author.name}</Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</Text>
                                        </VStack>

                                        <HStack space="md" className="items-center">
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">👁 {post.views}</Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">❤️ {post.likes}</Text>
                                            {post.readTime && (
                                                <Text className="text-xs text-gray-500 dark:text-gray-400">📖 {post.readTime} min</Text>
                                            )}
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </Box>
                        </Card>

                        {/* Article content */}
                        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <Box className="p-6">
                                <Text className="text-base leading-6 text-gray-800 dark:text-gray-200">{post.content}</Text>
                            </Box>
                        </Card>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <Box className="p-4">
                                    <VStack space="sm">
                                        <Text className="font-medium text-sm text-black dark:text-white">Tags</Text>
                                        <HStack space="sm" className="flex-wrap">
                                            {post.tags.map((tag, index) => (
                                                <Box key={index} className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                                                    <Text className="text-xs text-red-800 dark:text-red-200">#{tag}</Text>
                                                </Box>
                                            ))}
                                        </HStack>
                                    </VStack>
                                </Box>
                            </Card>
                        )}

                        {/* Actions */}
                        <HStack space="md" className="justify-center">
                            <Button variant={isLiked ? "solid" : "outline"} onPress={handleLike} className={isLiked ? "bg-red-600" : "border-red-600 flex-1"}>
                                <ButtonText className={isLiked ? "text-white" : "text-red-600"}>❤️ {isLiked ? "Liked" : "Like"}</ButtonText>
                            </Button>

                            <Button variant="outline" onPress={handleShare} className="border-red-600 flex-1">
                                <ButtonText className="text-red-600">📤 Share</ButtonText>
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
    },
})
