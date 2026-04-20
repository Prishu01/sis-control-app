import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import Layout from '../components/Layout';
import { COLORS, RADIUS } from '../constants/theme';
import {useBluetooth} from '../context/BluetoothContext';

export default function ScanScreen() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const {connectedDevice, setConnection, disconnectDevice} = useBluetooth();

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Number(Platform.Version) >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const granted = 
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;
        
        if (!granted) {
          Alert.alert('Permissions Required', 'Bluetooth Scan and Connect permissions are required.');
        }
        return granted;
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Location permission is required to scan for Bluetooth devices.');
          return false;
        }
        return true;
      }
    }
    return true;
  };

  const startScan = async () => {
    // 1. Request Permissions
    const granted = await requestPermissions();
    if (!granted) return;

    // 2. Check if Bluetooth is enabled
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        Alert.alert('Bluetooth Off', 'Please turn on Bluetooth to scan for devices.');
        return;
      }
    } catch (e) {
      console.log('Error checking BT state:', e);
    }

    setIsScanning(true);
    setDevices([]); // Clear previous list

    try {
      // 3. Get Bonded Devices first (instant results)
      const bonded = await RNBluetoothClassic.getBondedDevices();
      const bondedList = bonded.map(d => ({
        id: d.address,
        name: d.name,
        type: 'classic',
        bonded: true,
      }));

      setDevices(bondedList);

      // 4. Start Discovery for new devices
      console.log('Starting discovery...');
      const discovered = await RNBluetoothClassic.startDiscovery();
      
      const discoveredList = discovered.map(d => ({
        id: d.address,
        name: d.name,
        type: 'classic',
        bonded: false,
      }));

      // 5. Merge lists, removing duplicates
      setDevices(prev => {
        const all = [...prev, ...discoveredList];
        const unique = all.filter((dev, index, self) =>
          index === self.findIndex((t) => t.id === dev.id)
        );
        return unique;
      });

    } catch (e) {
      console.log("Scan error:", e);
      Alert.alert('Scan Failed', 'An error occurred while scanning for devices.');
    } finally {
      setIsScanning(false);
    }
  };

  const connectDevice = async (device: any) => {
    try {
      console.log(`Connecting to ${device.name} (${device.id})...`);
      const connected = await RNBluetoothClassic.connectToDevice(device.id);

      if (connected) {
        console.log("✅ Connected");

        setConnection(
          { ...device, type: 'classic' },
          connected
        );
      }
    } catch (e) {
      console.log("❌ Connect error:", e);
      Alert.alert('Connection Failed', `Could not connect to ${device.name || 'device'}.`);
    }
  };

  return (
    <Layout title="Scan" isConnected={!!connectedDevice}>
      <View style={styles.container}>

        {/* CONNECTED DEVICE */}
        {connectedDevice ? (
          <View style={styles.connectedCard}>
            <View>
              <Text style={styles.connectedLabel}>CONNECTED DEVICE</Text>
              <Text style={styles.name}>{connectedDevice.name || "Unknown Device"}</Text>
              <Text style={styles.id}>{connectedDevice.id}</Text>
            </View>

            <TouchableOpacity 
              style={styles.disconnectBtn} 
              onPress={disconnectDevice}
            >
              <Text style={styles.disconnectText}>DISCONNECT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={startScan}
            style={styles.btn}
          >
            <Text style={styles.txt}>
              {isScanning ? "SCANNING..." : "SCAN FOR DEVICES"}
            </Text>
          </TouchableOpacity>
        )}

        {/* DEVICE LIST */}
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => connectDevice(item)}
            >
              <Text style={styles.name}>{item.name || "Unknown"}</Text>
              <Text style={styles.id}>{item.id}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20,
    backgroundColor: COLORS.background,
  },

  /* 🔥 SCAN BUTTON */
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    marginBottom: 25,
    alignItems: 'center',
  },

  txt: {
    color: '#fff', 
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 13,
  },

  /* 🔥 DEVICE CARD */
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    marginBottom: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#333',
  },

  name: {
    fontWeight: '700', 
    color: '#fff',
    fontSize: 15,
  },

  id: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },

  /* 🔥 CONNECTED CARD */
  connectedCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  connectedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  disconnectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#2a0a0a',
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },

  disconnectText: {
    color: '#ff4d4d',
    fontSize: 10,
    fontWeight: '800',
  },
});