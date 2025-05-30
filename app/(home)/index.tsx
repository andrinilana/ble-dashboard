import React, { useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { View, Text } from "@/components/Themed";
import { useBluetooth } from "@/contexts/BLEContext";
import Temperature from "@/components/Temperature";

export default function HomeScreen() {
    const { receivedData } = useBluetooth();
    const [temperature, setTemperature] = useState<number>(0);
    const [fuelLevel, setFuelLevel] = useState<number>(0);

    useEffect(() => {
        console.log("Received data in index.tsx:", receivedData);

        if (receivedData) {
            setTemperature(receivedData.temperature);
            setFuelLevel(receivedData.resistance);
        }
    }, [receivedData]);

    return (
        <View style={styles.container}>
            <Temperature temperature={temperature} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
