import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ControlScreen from '../screens/ControlScreen';
import VoiceScreen from '../screens/VoiceScreen';
import CarRemoteScreen from '../screens/CarRemoteScreen';
import HomeAutomationScreen from '../screens/HomeAutomationScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Remote" component={ControlScreen} />
      <Stack.Screen name="Voice" component={VoiceScreen} />
      <Stack.Screen name="CarRemote" component={CarRemoteScreen} />
      <Stack.Screen name="HomeAuto" component={HomeAutomationScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}