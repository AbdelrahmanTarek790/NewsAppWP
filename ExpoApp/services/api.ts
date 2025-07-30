import { AuthResponse, Category, Post, User, Comment } from "@/app/types"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://newsappback.codepeak.software"
const API_PREFIX = "/api/v1"

interface ApiResponse<T = any> {
    status: string
    data?: T
    message?: string
    success?: boolean
    token?: any
    error?: string
    post?: Post
    posts?: Post[]
    category?: Category
    categories?: Category[]
}

interface PostsResponse {
    posts?: Post[]
    post?: Post
    total?: number
    page?: number
    totalPages?: number
}

interface CategoriesResponse {
    categories: Category[]
}

interface PostResponse {
    post: Post
}

interface CommentsResponse {
    comments: Comment[]
}

interface CommentResponse {
    comment: Comment
}

class ApiService {
    private baseURL: string

    constructor() {
        this.baseURL = `${API_BASE_URL}${API_PREFIX}`
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        try {
            const token = await AsyncStorage.getItem("userToken")

            const defaultHeaders: Record<string, string> = {
                "Content-Type": "application/json",
            }

            if (token) {
                defaultHeaders["Authorization"] = `Bearer ${token}`
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`)
            }

            return data
        } catch (error) {
            console.error("API request failed:", error)
            throw error
        }
    }

    // Authentication methods
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await this.request<{
                token: string
                refreshToken: string
                user: User
            }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            })
            console.log("Login response:", response)

            if (response.status === "success" && response.data) {
                await AsyncStorage.setItem("userToken", response.token)
                // await AsyncStorage.setItem("refreshToken", response.data.refreshToken)
                await AsyncStorage.setItem("userData", JSON.stringify(response.data.user))

                return { success: true, data: { user: response.data.user }, token: response.data.token }
            }

            return { success: false, error: response.message || "Login failed", data: {} }
        } catch (error) {
            return { success: false, error: (error as Error).message, data: {} }
        }
    }

    async register(name: string, email: string, password: string, username: string): Promise<AuthResponse> {
        try {
            const response = await this.request<{
                token: string
                refreshToken: string
                user: User
            }>("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    passwordConfirm: password,
                    username,
                }),
            })

            if (response.status === "success" && response.data) {
                await AsyncStorage.setItem("userToken", response.data.token)
                await AsyncStorage.setItem("refreshToken", response.data.refreshToken)
                await AsyncStorage.setItem("userData", JSON.stringify(response.data.user))

                return { success: true, data: { user: response.data.user }, token: response.data.token }
            }

            return { success: false, error: response.message || "Registration failed", data: {} }
        } catch (error) {
            return { success: false, error: (error as Error).message, data: {} }
        }
    }

    async logout(): Promise<void> {
        try {
            await this.request("/auth/logout", { method: "POST" })
        } catch (error) {
            console.error("Logout API call failed:", error)
        } finally {
            await AsyncStorage.removeItem("userToken")
            await AsyncStorage.removeItem("refreshToken")
            await AsyncStorage.removeItem("userData")
        }
    }

    async refreshToken(): Promise<string | null> {
        try {
            const refreshToken = await AsyncStorage.getItem("refreshToken")
            if (!refreshToken) return null

            const response = await this.request<{
                token: string
                refreshToken: string
            }>("/auth/refresh-token", {
                method: "POST",
                body: JSON.stringify({ refreshToken }),
            })

            if (response.status === "success" && response.data) {
                await AsyncStorage.setItem("userToken", response.data.token)
                await AsyncStorage.setItem("refreshToken", response.data.refreshToken)
                return response.data.token
            }

            return null
        } catch (error) {
            console.error("Token refresh failed:", error)
            return null
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await this.request<{ user: User }>("/auth/me")

            if (response.status === "success" && response.data) {
                await AsyncStorage.setItem("userData", JSON.stringify(response.data.user))
                return response.data.user
            }

            return null
        } catch (error) {
            console.error("Get current user failed:", error)
            return null
        }
    }

    // News/Posts methods
    async getPosts(page: number = 1, limit: number = 10): Promise<ApiResponse<PostsResponse>> {
        return this.request(`/posts?page=${page}&limit=${limit}`)
    }

    async getPost(id: string): Promise<ApiResponse<PostResponse>> {
        return this.request(`/posts/${id}`)
    }

    async getCategories(): Promise<ApiResponse<CategoriesResponse>> {
        return this.request("/categories")
    }

    async getCategoryPosts(categorySlug: string, page: number = 1, limit: number = 10): Promise<ApiResponse<PostsResponse>> {
        return this.request(`/posts/?page=${page}&limit=${limit}&category=${encodeURIComponent(categorySlug)}`)
    }

    async searchPosts(query: string, page: number = 1): Promise<ApiResponse<PostsResponse>> {
        return this.request(`/search/posts?q=${encodeURIComponent(query)}&page=${page}`)
    }

    // User methods
    async updateProfile(data: { name?: string; email?: string; username?: string; bio?: string }): Promise<ApiResponse<{ user: User }>> {
        return this.request("/users/update-me", {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    }

    async getUserStats(): Promise<ApiResponse<{ stats: any }>> {
        return this.request("/users/me/stats")
    }

    // Comment methods
    async getPostComments(postId: string): Promise<ApiResponse<CommentsResponse>> {
        return this.request(`/comments/post/${postId}`)
    }

    async createComment(postId: string, content: string, parentId?: string): Promise<ApiResponse<CommentResponse>> {
        return this.request(`/comments/post/${postId}`, {
            method: "POST",
            body: JSON.stringify({ content, parent: parentId }),
        })
    }

    async updateComment(commentId: string, content: string): Promise<ApiResponse<CommentResponse>> {
        return this.request(`/comments/${commentId}`, {
            method: "PATCH",
            body: JSON.stringify({ content }),
        })
    }

    async deleteComment(commentId: string): Promise<ApiResponse<any>> {
        return this.request(`/comments/${commentId}`, {
            method: "DELETE",
        })
    }

    async likeComment(commentId: string): Promise<ApiResponse<CommentResponse>> {
        return this.request(`/comments/${commentId}/like`, {
            method: "POST",
        })
    }

    async dislikeComment(commentId: string): Promise<ApiResponse<CommentResponse>> {
        return this.request(`/comments/${commentId}/dislike`, {
            method: "POST",
        })
    }

    // Post interaction methods
    async likePost(postId: string): Promise<ApiResponse<PostResponse>> {
        return this.request(`/posts/${postId}/like`, {
            method: "POST",
        })
    }

    async unlikePost(postId: string): Promise<ApiResponse<PostResponse>> {
        return this.request(`/posts/${postId}/unlike`, {
            method: "POST",
        })
    }

    async getFeaturedPosts(): Promise<ApiResponse<PostsResponse>> {
        return this.request("/posts/featured")
    }

    async getTrendingPosts(): Promise<ApiResponse<PostsResponse>> {
        return this.request("/posts/trending")
    }
}

export const apiService = new ApiService()
export default apiService
