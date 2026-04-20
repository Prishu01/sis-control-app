import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { BluetoothProvider } from './context/BluetoothContext';

export default function App() {
  return (
    <BluetoothProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </BluetoothProvider>
  );
}