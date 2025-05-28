import React, { useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { View, Text } from "@/components/Themed";
import { useBluetooth } from "@/contexts/BLEContext";

export default function HomeScreen() {
    const { receivedData } = useBluetooth();

    useEffect(() => {
        console.log("Received data in index.tsx:", receivedData);
    }, [receivedData]);

    return (
        <View style={styles.container}>
            <Text>Received data : </Text>
            <Text>{JSON.stringify(receivedData)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
