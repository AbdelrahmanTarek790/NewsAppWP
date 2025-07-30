import { SplashScreen } from "@/components/SplashScreen"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"

export default function IndexScreen() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const [showSplash, setShowSplash] = useState(true)

    useEffect(() => {
        // Show splash screen for minimum duration
        const splashTimer = setTimeout(() => {
            setShowSplash(false)
        }, 2000) // Show splash for 2 seconds minimum

        return () => clearTimeout(splashTimer)
    }, [])

    useEffect(() => {
        if (!isLoading && !showSplash) {
            if (isAuthenticated) {
                router.replace("/(tabs)" as any)
            } else {
                router.replace("/(tabs)" as any) // Go to tabs, but protected actions will redirect to login
            }
        }
    }, [isAuthenticated, isLoading, showSplash, router])

    // Show splash screen while loading or during minimum splash duration
    if (isLoading || showSplash) {
        return <SplashScreen isLoading={isLoading} />
    }

    return null
}
