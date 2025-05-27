import React, { useEffect } from "react";
import { StyleSheet, Alert } from "react-native";
import { View, Text } from "@/components/Themed";
import { useBluetooth } from "@/contexts/BLEContext";

export default function HomeScreen() {
    const { receivedData } = useBluetooth();

    return (
        <View style={styles.container}>
            <Text>Received data : </Text>
            <Text>{receivedData}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
