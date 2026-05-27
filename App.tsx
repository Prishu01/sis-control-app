import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { BluetoothProvider } from './context/BluetoothContext';
import BootSplash from 'react-native-bootsplash';

export default function App() {
  return (
    <BluetoothProvider>
      <NavigationContainer onReady={() => setTimeout(() => BootSplash.hide({ fade: true }), 1000)}>
        <AppNavigator />
      </NavigationContainer>
    </BluetoothProvider>
  );
}