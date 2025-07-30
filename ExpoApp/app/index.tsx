import { Center } from "@/components/ui/center"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "expo-router"
import { useEffect } from "react"

export default function IndexScreen() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace("/(tabs)")
            } else {
                router.replace("/login")
            }
        }
    }, [isAuthenticated, isLoading])

    // Show loading spinner while checking auth state
    return (
        <Center className="flex-1">
            <Spinner size="large" />
        </Center>
    )
}
