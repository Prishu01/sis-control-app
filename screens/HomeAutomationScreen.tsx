import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Layout from '../components/Layout';
import { useBluetooth } from '../context/BluetoothContext';
import { COLORS, RADIUS } from '../constants/theme';
import { ScalePressable } from '../components/ScalePressable';

const devices = [
  { id: '1', name: 'Main Light', icon: 'sunny-outline', activeIcon: 'sunny', cmdOn: '1', cmdOff: 'A' },
  { id: '2', name: 'Celling Fan', icon: 'snow-outline', activeIcon: 'snow', cmdOn: '2', cmdOff: 'B' },
  { id: '3', name: 'AC Unit', icon: 'thermometer-outline', activeIcon: 'thermometer', cmdOn: '3', cmdOff: 'C' },
  { id: '4', name: 'Smart TV', icon: 'tv-outline', activeIcon: 'tv', cmdOn: '4', cmdOff: 'D' },
  { id: '5', name: 'Kitchen', icon: 'restaurant-outline', activeIcon: 'restaurant', cmdOn: '5', cmdOff: 'E' },
  { id: '6', name: 'Garden', icon: 'leaf-outline', activeIcon: 'leaf', cmdOn: '6', cmdOff: 'F' },
  { id: '7', name: 'Lamp', icon: 'bulb-outline', activeIcon: 'bulb', cmdOn: '7', cmdOff: 'G' },
  { id: '8', name: 'Security', icon: 'lock-closed-outline', activeIcon: 'lock-closed', cmdOn: '8', cmdOff: 'H' },
];

export default function HomeAutomationScreen() {
  const { sendCommand, connectedDevice } = useBluetooth();
  const [activeDevices, setActiveDevices] = useState<Set<string>>(new Set());

  const toggleDevice = (id: string, cmdOn: string, cmdOff: string) => {
    const isActive = activeDevices.has(id);
    const updated = new Set(activeDevices);

    if (isActive) {
      updated.delete(id);
      sendCommand(cmdOff);
    } else {
      updated.add(id);
      sendCommand(cmdOn);
    }

    setActiveDevices(updated);
  };

  return (
    <Layout title="Smart Home Hub" isConnected={!!connectedDevice}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{activeDevices.size}</Text>
          <Text style={styles.summaryLabel}>DEVICES ACTIVE</Text>
        </View>

        {/* GRID */}
        <View style={styles.grid}>
          {devices.map((device) => {
            const isActive = activeDevices.has(device.id);

            return (
              <ScalePressable
                key={device.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => toggleDevice(device.id, device.cmdOn, device.cmdOff)}
              >
                {/* Glow when active */}
                {isActive && (
                  <LinearGradient
                    colors={[COLORS.automation + '40', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                )}

                <View style={[
                  styles.iconBox,
                  { backgroundColor: isActive ? COLORS.automation : 'rgba(255,255,255,0.08)' }
                ]}>
                  <Ionicons
                    name={isActive ? device.activeIcon : device.icon}
                    size={26}
                    color={isActive ? '#fff' : '#aaa'}
                  />
                </View>

                <Text style={[styles.cardName, isActive && styles.activeText]}>
                  {device.name}
                </Text>

                <Text style={styles.statusText}>
                  {isActive ? 'ON' : 'OFF'}
                </Text>
              </ScalePressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  /* 🔥 SUMMARY CARD */
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },

  summaryValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.automation,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 2,
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  /* 🔥 CARD */
  card: {
    width: '48%',
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },

  cardActive: {
    borderColor: COLORS.automation,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },

  activeText: {
    color: COLORS.automation,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
  },
});