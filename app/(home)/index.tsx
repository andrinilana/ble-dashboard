import React, { useEffect } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useBluetooth } from "@/contexts/BLEContext";

export default function HomeScreen() {
    const { receivedData } = useBluetooth();

    return (
        <ThemedView style={styles.container}>
            <ThemedText>Received data : </ThemedText>
            <ThemedText>{receivedData}</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
