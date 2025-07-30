import { HelloWave } from "@/components/HelloWave"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Card } from "@/components/ui/card"
import { StyleSheet, Text, View } from "react-native"

export default function TestScreen() {
    return (
        <View className="pt-10">
            <ThemedView style={styles.titleContainer} className="px-10">
                <ThemedText type="title">Welcome to the Test Screen!</ThemedText>
                <HelloWave />
            </ThemedView>
            <Card size="md" variant="elevated" className="m-3 bg-black">
                <Text className="text-white text-2xl">This is a test card.</Text>
            </Card>
        </View>
    )
}
const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,

    },
    reactLogo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
})
