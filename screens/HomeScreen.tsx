import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Layout from '../components/Layout';
import { COLORS, RADIUS } from '../constants/theme';
import { ScalePressable } from '../components/ScalePressable';

const features = [
  { title: "Car Remote", icon: "car-sport-outline", route: "CarRemote" },
  { title: "Smart Home", icon: "home-outline", route: "HomeAuto" },
  { title: "Robot Arm", icon: "construct-outline", route: "Remote" },
  { title: "Voice Control", icon: "mic-outline", route: "Voice" },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <Layout title="Dashboard">
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

          <View style={styles.headerSpacer} />

          {/* HEADER */}
          <Text style={styles.location}>SYSTEM HUB</Text>

          <Text style={styles.title}>
            SIS <Text style={styles.highlight}>Control</Text>
          </Text>

          <Text style={styles.subtitle}>dashboard</Text>

          {/* STATUS CHIP */}
          <View style={styles.statusChip}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>All systems live</Text>
          </View>

          {/* SCAN BUTTON */}
          <ScalePressable
            onPress={() => navigation.navigate("Scan")}
            style={styles.scanBtn}
          >
           
            <Text style={styles.scanBtnText}> Scan for device</Text>
          </ScalePressable>

          {/* MODULES TITLE */}
          <View style={styles.moduleRow}>
            <Text style={styles.moduleText}>Modules</Text>
            <Text style={styles.seeAll}>see all →</Text>
          </View>

          {/* GRID */}
          <View style={styles.grid}>
            {features.map((item, i) => (
              <ScalePressable
                key={i}
                style={styles.card}
                onPress={() => navigation.navigate(item.route)}
              >
                <Ionicons name={item.icon} size={28} color={COLORS.primary} />
                <Text style={styles.cardText}>{item.title}</Text>
              </ScalePressable>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* 🔥 FLOATING AI BUTTON */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("Chat")}
        >
          <Ionicons name="sparkles" size={26} color="#fff" />
        </TouchableOpacity>

      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  headerSpacer: {
    height: 20,
  },

  location: {
    color: '#aaa',
    fontSize: 12,
  },

  greeting: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
    marginTop: 6,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },

  highlight: {
    color: COLORS.primary,
  },

  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  statusText: {
    color: '#22C55E',
    fontSize: 12,
  },

  scanBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  scanBtnText: {
    color: COLORS.text,
    fontWeight: '600',
  },

  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  moduleText: {
    color: COLORS.text,
    fontWeight: '700',
  },

  seeAll: {
    color: COLORS.primary,
    fontSize: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    height: 110,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardText: {
    color: COLORS.text,
    marginTop: 8,
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});