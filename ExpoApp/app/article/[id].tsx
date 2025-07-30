import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Post } from '@/app/types';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function ArticleContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getPost(postId);
      
      if (response.status === "success" && response.data?.post) {
        setPost(response.data.post);
      } else {
        // Fallback to mock post
        setPost(getMockPost(postId));
      }
    } catch (error) {
      console.error("Failed to load post:", error);
      setPost(getMockPost(postId));
    } finally {
      setLoading(false);
    }
  };

  const getMockPost = (postId: string): Post => ({
    _id: postId,
    title: "Breaking: New Technology Advances",
    content: `
This is a detailed article about the latest technological innovations that are shaping our future. From artificial intelligence developments to sustainable energy solutions, we explore what's happening in the tech world and how it affects our daily lives.

## Key Developments

The technology sector continues to evolve at an unprecedented pace. Recent breakthroughs include:

- Advanced AI models that can understand and generate human-like text
- Sustainable energy storage systems that could revolutionize renewable energy
- Quantum computing advances that promise to solve complex problems
- Biotechnology innovations improving healthcare outcomes

## Impact on Society

These technological advances are not just improving efficiency and convenience; they are fundamentally changing how we work, communicate, and live. The integration of AI into everyday applications has made many tasks more accessible and efficient.

## Looking Forward

As we continue to witness these rapid changes, it's important to consider both the opportunities and challenges they present. Staying informed about these developments helps us make better decisions about the future.

The pace of innovation shows no signs of slowing down, and we can expect even more exciting developments in the months and years ahead.
    `,
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
    tags: ["tech", "innovation", "AI", "future"],
    featuredImage: undefined,
    status: "published" as const,
    featured: true,
    trending: true,
    views: 1250,
    likes: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  });

  const handleLike = async () => {
    if (!post) return;
    
    try {
      // API call would go here
      // await apiService.likePost(post._id);
      setIsLiked(!isLiked);
      Alert.alert("Success", isLiked ? "Article unliked!" : "Article liked!");
    } catch (error) {
      Alert.alert("Error", "Failed to like article");
    }
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality coming soon!");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
          <Text className="mt-4 text-gray-500">Loading article...</Text>
        </Box>
      </SafeAreaView>
    );
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
    );
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
                    <Text className="text-xs text-blue-600 font-medium">{post.category.name}</Text>
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
                      <Text className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
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
                <Text className="text-base leading-6 text-gray-800">
                  {post.content}
                </Text>
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
              <Button 
                variant={isLiked ? "solid" : "outline"} 
                onPress={handleLike}
                className="flex-1"
              >
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
  );
}

export default function ArticlePage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      fallbackMessage="Please log in to read full articles"
      redirectTo="/login"
    >
      <ArticleContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});