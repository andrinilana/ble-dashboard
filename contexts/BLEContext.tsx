import React, { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import {
	Alert,
	PermissionsAndroid,
	Platform,
} from 'react-native';
import {
	BleManager,
	Device,
	Characteristic,
	Subscription,
	State,
} from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { CHARACTERISTIC_UUID, BLE_DEVICE_NAME, SERVICE_UUID } from '@/constants/Ble';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';

interface BluetoothContextProps {
	receivedData: string;
	bluetoothEnabled: boolean;
}

const BluetoothContext = createContext<BluetoothContextProps | undefined>(undefined);

export const useBluetooth = (): BluetoothContextProps => {
	const context = useContext(BluetoothContext);
	if (!context) {
		throw new Error('useBluetooth must be used within a BluetoothProvider');
	}
	return context;
};

interface BluetoothProviderProps {
	children: ReactNode;
}

const manager = new BleManager();

export const BluetoothProvider: React.FC<BluetoothProviderProps> = ({ children }) => {
	let monitorSubscription: Subscription;
	const [receivedData, setReceivedData] = useState<string>('');
	const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(false);
	const [deviceId, setDeviceId] = useState<string | null>(null);

	const requestBluetoothPermissions = async () => {
		if (Platform.OS === 'android') {
			try {
				const granted = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
					PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				]);

				const allGranted = Object.values(granted).every(
					(status) => status === PermissionsAndroid.RESULTS.GRANTED
				);

				if (!allGranted) {
					Alert.alert(
						'Required Permissions',
						'Please grant Bluetooth and location permissions for the app to work properly.',
						[{ text: 'OK', onPress: () => requestBluetoothPermissions() }]
					);
					return false;
				}
				return true;
			} catch (error) {
				console.error('Error requesting Bluetooth permissions:', error);
				return false;
			}
		}
		return true;
	};

	// Check if Bluetooth is enabled
	useEffect(() => {
		const subscription: Subscription = manager.onStateChange((state: State) => {
			switch (state) {
				case State.PoweredOn:
					console.log('Bluetooth is powered on');

					setBluetoothEnabled(true);

					if (deviceId) {
						// Attempt to reconnect to the device
						// attemptReconnect(deviceId);
						console.log("Attempting to reconnect to device:", deviceId);
					}
					break;
				case State.PoweredOff:
					console.log('Bluetooth is powered off');

					setBluetoothEnabled(false);

					// Open bluetooth settings
					startActivityAsync(ActivityAction.BLUETOOTH_SETTINGS);
					break;

				default:
					console.log('Bluetooth state changed:', state);
			}
		}, true);
		return () => subscription?.remove();
	}, [manager, deviceId]);

	const setupNotification = (device: Device) => {
		monitorSubscription = device.monitorCharacteristicForService(
			SERVICE_UUID,
			CHARACTERISTIC_UUID,
			(err: Error | null, characteristic: Characteristic | null) => {
				if (err) {
					console.error('Notification error:', err);
					return;
				}

				if (characteristic?.value) {
					const decoded = Buffer.from(characteristic.value, 'base64').toString('utf8');
					console.log('Received:', decoded);
					setReceivedData(decoded);
				}
			}
		);
	};

	const monitorDisconnect = (device: Device) => {
		device.onDisconnected((error, disconnectedDevice) => {
			if (error) {
				console.log('Disconnected with error:', error);
			} else {
				console.log('Disconnected:', disconnectedDevice.id);
				attemptReconnect(disconnectedDevice.id);
			}
		});
	};

	const attemptReconnect = async (deviceId: string) => {
		try {
			const device = await manager.connectToDevice(deviceId);
			await device.discoverAllServicesAndCharacteristics();
			// setConnectedDevice(device);

			console.log('Reconnected to device:', device.id);

			monitorDisconnect(device);
			setupNotification(device);
		} catch (e) {
			console.log('Reconnect failed:', e);
			setTimeout(() => attemptReconnect(deviceId), 5000);
		}
	};

	useEffect(() => {
		const startBLE = async (): Promise<void> => {
			manager.startDeviceScan(null, null, async (error: unknown, device: Device | null) => {
				if (error) {
					console.error('Scan error:', error);
					return;
				}

				if (device?.name === BLE_DEVICE_NAME) {
					console.log(`Found device: ${BLE_DEVICE_NAME}`);
					manager.stopDeviceScan();

					try {
						const connectedDevice = await device.connect();
						await connectedDevice.discoverAllServicesAndCharacteristics();

						setDeviceId(connectedDevice.id);
						console.log('Connected to device:', connectedDevice.name);
						monitorDisconnect(connectedDevice);
						setupNotification(connectedDevice);
					} catch (err) {
						console.error('Connection error:', err);
					}
				}
			});
		};

		// startBLE();

		const initBluetooth = async () => {
			const permissionsGranted = await requestBluetoothPermissions();
			if (permissionsGranted) {
				startBLE();
			}
		};

		initBluetooth();

		return () => {
			manager.stopDeviceScan();
			monitorSubscription?.remove();
			manager.destroy();
			setDeviceId(null);
		};
	}, []);

	return (
		<BluetoothContext.Provider value={{receivedData, bluetoothEnabled}}>
			{children}
		</BluetoothContext.Provider>
	);
}
