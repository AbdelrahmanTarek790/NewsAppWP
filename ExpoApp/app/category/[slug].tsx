import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Category, Post } from '@/app/types';
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

function CategoryContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCategoryPosts(slug);
    }
  }, [slug]);

  const loadCategoryPosts = async (categorySlug: string) => {
    try {
      setLoading(true);
      
      // Try to get category posts from API
      // const response = await apiService.getCategoryPosts(categorySlug);
      // if (response.status === "success" && response.data?.posts) {
      //   setPosts(response.data.posts);
      //   setCategory(response.data.category);
      // } else {
        // Fallback to mock data
        const mockCategory = getMockCategory(categorySlug);
        setCategory(mockCategory);
        setPosts(getMockCategoryPosts(categorySlug));
      // }
    } catch (error) {
      console.error("Failed to load category posts:", error);
      const mockCategory = getMockCategory(categorySlug);
      setCategory(mockCategory);
      setPosts(getMockCategoryPosts(categorySlug));
    } finally {
      setLoading(false);
    }
  };

  const getMockCategory = (slug: string): Category => {
    const categories: Record<string, Category> = {
      technology: {
        _id: "tech",
        name: "Technology",
        slug: "technology",
        description: "Latest tech news and innovations",
        color: "#3B82F6",
        icon: "💻",
      },
      sports: {
        _id: "sports",
        name: "Sports",
        slug: "sports",
        description: "Sports news and updates",
        color: "#10B981",
        icon: "⚽",
      },
      health: {
        _id: "health",
        name: "Health",
        slug: "health",
        description: "Health and wellness news",
        color: "#F59E0B",
        icon: "🏥",
      },
    };

    return categories[slug] || {
      _id: slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: slug,
      description: `${slug} news and updates`,
      color: "#6B7280",
      icon: "📰",
    };
  };

  const getMockCategoryPosts = (categorySlug: string): Post[] => {
    const allPosts: Post[] = [
      {
        _id: "1",
        title: "Breaking: New Technology Advances",
        content: "Stay updated with the latest technological innovations...",
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
        content: "Get ready for the most exciting championship finals...",
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
        content: "Recent medical research has revealed groundbreaking insights...",
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
    ];

    return allPosts.filter(post => post.category.slug === categorySlug);
  };

  const onRefresh = async () => {
    if (slug) {
      setRefreshing(true);
      await loadCategoryPosts(slug);
      setRefreshing(false);
    }
  };

  const handleLikePost = (postId: string) => {
    Alert.alert("Like", "Post liked! (Feature in development)");
  };

  const handleReadMore = (postId: string) => {
    router.push(`/article/${postId}` as any);
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-4">
      <Box className="p-4">
        <VStack space="sm">
          {/* Post header */}
          <HStack className="justify-between items-start">
            <Box className="flex-1">
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
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
          <Text className="mt-4 text-gray-500">Loading category...</Text>
        </Box>
      </SafeAreaView>
    );
  }

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
              
              {category && (
                <Card style={{ borderLeftColor: category.color, borderLeftWidth: 4 }}>
                  <Box className="p-4">
                    <HStack className="items-center" space="md">
                      <Box className="w-12 h-12 items-center justify-center rounded-lg" 
                           style={{ backgroundColor: category.color + '20' }}>
                        <Text className="text-2xl">{category.icon}</Text>
                      </Box>
                      
                      <VStack className="flex-1" space="xs">
                        <Heading size="xl">{category.name}</Heading>
                        {category.description && (
                          <Text className="text-gray-600 text-sm">
                            {category.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                </Card>
              )}
            </VStack>

            {/* Posts */}
            <VStack space="md">
              {posts.length > 0 ? (
                <>
                  <Text className="text-sm text-gray-600">
                    {posts.length} article{posts.length !== 1 ? 's' : ''} in this category
                  </Text>
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </>
              ) : (
                <Box className="items-center py-8">
                  <Text className="text-gray-500 text-center">
                    No articles found in this category
                  </Text>
                  <Text className="text-gray-400 text-center mt-2">
                    Check back later for new content
                  </Text>
                </Box>
              )}
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function CategoryPage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      fallbackMessage="Please log in to browse category articles"
      redirectTo="/login"
    >
      <CategoryContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});