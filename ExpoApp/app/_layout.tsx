import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider"
import "@/global.css"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import "react-native-reanimated"

import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider, useTheme } from "@/context/ThemeContext"

function RootLayoutContent() {
    const { actualTheme } = useTheme();
    
    return (
        <GluestackUIProvider mode={actualTheme}>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: true }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="register" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
                    <Stack.Screen name="+not-found" />
                    <Stack.Screen name="types" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </GluestackUIProvider>
    )
}

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    })

    if (!loaded) {
        // Async font loading only occurs in development.
        return null
    }

    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    )
}
