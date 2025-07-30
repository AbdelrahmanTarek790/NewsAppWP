import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, Image, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Post, Comment } from "@/app/types"
import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Input, InputField } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { VStack } from "@/components/ui/vstack"
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Colors } from "@/constants/Colors"
import { apiService } from "@/services/api"

function ArticleContent() {
    const { isAuthenticated, user } = useAuth()
    const { actualTheme } = useTheme()
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [commentSubmitting, setCommentSubmitting] = useState(false)

    useEffect(() => {
        if (id) {
            loadPost(id)
            loadComments(id)
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

    const loadComments = async (postId: string) => {
        try {
            setCommentsLoading(true)
            const response = await apiService.getPostComments(postId)

            if (response.status === "success" && response.data?.comments) {
                setComments(response.data.comments)
            }
        } catch (error) {
            console.error("Failed to load comments:", error)
        } finally {
            setCommentsLoading(false)
        }
    }

    const handleLike = async () => {
        if (!post) return

        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to like articles.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login") },
            ])
            return
        }

        try {
            if (isLiked) {
                await apiService.unlikePost(post._id)
            } else {
                await apiService.likePost(post._id)
            }
            setIsLiked(!isLiked)
            Alert.alert("Success", isLiked ? "Article unliked!" : "Article liked!")
        } catch (error) {
            Alert.alert("Error", "Failed to like article")
        }
    }

    const handleShare = () => {
        Alert.alert("Share", "Share functionality coming soon!")
    }

    const handleSubmitComment = async () => {
        if (!post || !newComment.trim()) return

        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to comment.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login") },
            ])
            return
        }

        try {
            setCommentSubmitting(true)
            const response = await apiService.createComment(post._id, newComment.trim(), replyTo || undefined)

            if (response.status === "success" && response.data?.comment) {
                setComments([response.data.comment, ...comments])
                setNewComment("")
                setReplyTo(null)
                Alert.alert("Success", "Comment posted successfully!")
            }
        } catch (error) {
            Alert.alert("Error", "Failed to post comment")
        } finally {
            setCommentSubmitting(false)
        }
    }

    const handleLikeComment = async (commentId: string) => {
        if (!isAuthenticated) {
            Alert.alert("Login Required", "Please log in to like comments.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => router.push("/login") },
            ])
            return
        }

        try {
            await apiService.likeComment(commentId)
            // Refresh comments to get updated likes
            if (post) {
                await loadComments(post._id)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to like comment")
        }
    }

    const renderComment = (comment: Comment, depth: number = 0) => (
        <Box key={comment._id} className={`ml-${Math.min(depth * 4, 12)} mb-4`}>
            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <Box className="p-4">
                    <VStack space="sm">
                        {/* Comment header */}
                        <HStack className="items-center justify-between">
                            <HStack className="items-center" space="sm">
                                <Avatar size="sm">
                                    {comment.user.avatar ? (
                                        <AvatarImage source={{ uri: comment.user.avatar }} />
                                    ) : (
                                        <AvatarFallbackText>{comment.user.name}</AvatarFallbackText>
                                    )}
                                </Avatar>
                                <VStack>
                                    <Text className="font-medium text-sm text-black dark:text-white">
                                        {comment.user.name}
                                    </Text>
                                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </Text>
                                </VStack>
                            </HStack>
                            
                            {comment.status === "pending" && (
                                <Box className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                                    <Text className="text-xs text-yellow-800 dark:text-yellow-200">Pending</Text>
                                </Box>
                            )}
                        </HStack>

                        {/* Comment content */}
                        <Text className="text-gray-800 dark:text-gray-200">{comment.content}</Text>

                        {/* Comment actions */}
                        <HStack className="items-center" space="md">
                            <Button 
                                size="xs" 
                                variant="outline" 
                                onPress={() => handleLikeComment(comment._id)}
                                className="border-gray-300 dark:border-gray-600"
                            >
                                <ButtonText className="text-xs text-gray-600 dark:text-gray-300">
                                    👍 {comment.likes}
                                </ButtonText>
                            </Button>
                            
                            {isAuthenticated && (
                                <Button 
                                    size="xs" 
                                    variant="outline" 
                                    onPress={() => setReplyTo(comment._id)}
                                    className="border-red-600"
                                >
                                    <ButtonText className="text-xs text-red-600">Reply</ButtonText>
                                </Button>
                            )}
                        </HStack>
                    </VStack>
                </Box>
            </Card>

            {/* Render replies */}
            {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
        </Box>
    )

    // Function to fix HTML entities
    const decodeHtmlEntities = (text: string) => {
        return text
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
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
                                <Text className="text-base leading-6 text-gray-800 dark:text-gray-200">
                                    {decodeHtmlEntities(post.content)}
                                </Text>
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

                        {/* Comments Section */}
                        <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <Box className="p-6">
                                <VStack space="lg">
                                    <Heading size="md" className="text-black dark:text-white">
                                        Comments ({comments.length})
                                    </Heading>

                                    {/* Comment Form */}
                                    {isAuthenticated ? (
                                        <VStack space="md">
                                            {replyTo && (
                                                <HStack className="items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                    <Text className="text-sm text-gray-600 dark:text-gray-300">
                                                        Replying to comment...
                                                    </Text>
                                                    <Button 
                                                        size="xs" 
                                                        variant="outline" 
                                                        onPress={() => setReplyTo(null)}
                                                        className="border-gray-400"
                                                    >
                                                        <ButtonText className="text-xs">Cancel</ButtonText>
                                                    </Button>
                                                </HStack>
                                            )}
                                            
                                            <Input className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                <InputField
                                                    placeholder="Write a comment..."
                                                    value={newComment}
                                                    onChangeText={setNewComment}
                                                    multiline
                                                    numberOfLines={3}
                                                    className="text-black dark:text-white"
                                                    placeholderTextColor={actualTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                                />
                                            </Input>
                                            
                                            <Button 
                                                onPress={handleSubmitComment} 
                                                disabled={!newComment.trim() || commentSubmitting}
                                                className="bg-red-600 self-end"
                                            >
                                                {commentSubmitting ? (
                                                    <HStack space="sm" className="items-center">
                                                        <Spinner size="small" color="white" />
                                                        <ButtonText className="text-white">Posting...</ButtonText>
                                                    </HStack>
                                                ) : (
                                                    <ButtonText className="text-white">
                                                        {replyTo ? "Reply" : "Post Comment"}
                                                    </ButtonText>
                                                )}
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <Card className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                            <Box className="p-4">
                                                <VStack space="sm">
                                                    <Text className="text-center text-gray-600 dark:text-gray-300">
                                                        Please log in to comment
                                                    </Text>
                                                    <Button 
                                                        onPress={() => router.push("/login")} 
                                                        className="bg-red-600 self-center"
                                                    >
                                                        <ButtonText className="text-white">Login</ButtonText>
                                                    </Button>
                                                </VStack>
                                            </Box>
                                        </Card>
                                    )}

                                    {/* Comments List */}
                                    {commentsLoading ? (
                                        <Box className="items-center py-4">
                                            <Spinner size="small" color={Colors[actualTheme].primary} />
                                            <Text className="mt-2 text-gray-500 dark:text-gray-400">Loading comments...</Text>
                                        </Box>
                                    ) : comments.length > 0 ? (
                                        <VStack space="md">
                                            {comments
                                                .filter(comment => !comment.parent) // Only show top-level comments
                                                .map(comment => renderComment(comment))}
                                        </VStack>
                                    ) : (
                                        <Box className="items-center py-8">
                                            <Text className="text-gray-500 dark:text-gray-400">No comments yet</Text>
                                            <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                Be the first to comment!
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            </Box>
                        </Card>
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
