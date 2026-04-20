import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Layout from '../components/Layout';
import { useBluetooth } from '../context/BluetoothContext';
import { COLORS } from '../constants/theme';

export default function VoiceScreen({ route }: any) {
  const { sendCommand, connectedDevice } = useBluetooth();

  const handleVoicePress = () => {
    console.log("Voice mock trigger...");
    sendCommand("VOICE_TRIGGERED");
  };

  return (
    <Layout title="Voice Control" isConnected={!!connectedDevice}>
      <View style={styles.container}>

        <View style={styles.micContainer}>

          {/* 🔥 GLOW RING */}
          <View style={styles.outerGlow} />

          {/* 🎤 MIC BUTTON */}
          <TouchableOpacity 
            style={styles.micBtn} 
            onPress={handleVoicePress}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={60} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.instruction}>
            Tap and speak
          </Text>

        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  micContainer: {
    alignItems: "center",
    justifyContent: 'center',
  },

  /* 🔥 GLOW EFFECT */
  outerGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 90,
    backgroundColor: COLORS.primary + '30',
  },

  /* 🎤 MAIN BUTTON */
  micBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

  instruction: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
});