import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  isConnected?: boolean;
}

export default function Layout({ children, title, isConnected = false }: LayoutProps) {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const TabIcon = ({ name, routeName }: any) => {
    const isActive = route.name === routeName;

    return (
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => navigation.navigate(routeName)}
      >
        <Ionicons
          name={name}
          size={24}
          color={isActive ? COLORS.primary : '#888'}
        />
        {isActive && <View style={styles.activeDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerIconsRow}>

          {/* LEFT */}
          <View style={styles.leftIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Ionicons name="home-outline" size={24} color={COLORS.remote} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
              <Ionicons name="bluetooth" size={24} color={COLORS.scan} />
            </TouchableOpacity>
          </View>

          {/* TITLE */}
          <Text style={styles.headerTitle}>{title}</Text>

          {/* RIGHT */}
          <View style={styles.rightIcons}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color={COLORS.automation} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
              <Ionicons name="settings-outline" size={24} color={COLORS.Scan} />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>{children}</View>

      {/* 🔥 BOTTOM NAVBAR */}
      <View style={styles.bottomBar}>
        <TabIcon name="home" routeName="Home" />
        <TabIcon name="bluetooth" routeName="Scan" />
        <TabIcon name="car-sport" routeName="CarRemote" />
        <TabIcon name="sparkles" routeName="Chat" />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* HEADER */
  header: {
    paddingTop: StatusBar.currentHeight
      ? StatusBar.currentHeight + 10
      : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftIcons: {
    flexDirection: 'row',
    gap: 12,
  },

  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },

  body: {
    flex: 1,
  },

  /* 🔥 BOTTOM NAVBAR */
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },

  tabBtn: {
    alignItems: 'center',
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
});