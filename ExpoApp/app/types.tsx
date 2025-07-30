import React from "react"
import { StyleSheet, Text, View } from "react-native"

export interface User {
    id: string
    email: string
    name: string
    username?: string
    avatar?: string
    role?: string
    createdAt?: string
    isEmailVerified?: boolean
}

export interface AuthResponse {
    success: boolean
    error?: string
    user?: User
    token?: string
}

export interface Post {
    _id: string
    title: string
    content: string
    excerpt?: string
    author: {
        _id: string
        name: string
        username: string
        avatar?: string
    }
    category: {
        _id: string
        name: string
        slug: string
    }
    tags: string[]
    featuredImage?: string
    status: 'draft' | 'published' | 'archived'
    featured: boolean
    trending: boolean
    views: number
    likes: number
    createdAt: string
    updatedAt: string
    publishedAt?: string
}

export interface Category {
    _id: string
    name: string
    slug: string
    description?: string
    color?: string
    icon?: string
}

export interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<AuthResponse>
    register: (name: string, email: string, password: string, username?: string) => Promise<AuthResponse>
    logout: () => Promise<void>
    isAuthenticated: boolean
}

export interface FormErrors {
    [key: string]: string
}

// Default component export required by Expo Router
export default function TypesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Types Definition Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
})
