import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useBluetooth } from '../context/BluetoothContext';
import { useNavigation } from '@react-navigation/native';

const SLIDERS_CONFIG = [
  {key: 'grip', label: 'Grip', min: 0, max: 180},
  {key: 'wristPitch', label: 'Wrist Pitch', min: 0, max: 180},
  {key: 'wristRoll', label: 'Wrist Roll', min: 0, max: 180},
  {key: 'elbow', label: 'Elbow', min: 0, max: 180},
  {key: 'shoulder', label: 'Shoulder', min: 0, max: 180},
  {key: 'waist', label: 'Waist', min: 0, max: 180},
];

const SliderItem = ({ s, initialValue, onCommand, isRed }: any) => {
  const [value, setValue] = useState(initialValue);
  const lastSent = React.useRef(0);

  const handleChange = (val: number) => {
    const rounded = Math.round(val);
    setValue(rounded);
    
    // Throttle real-time commands to prevent freezing (max 10 per second)
    const now = Date.now();
    if (now - lastSent.current > 100) {
      onCommand(s.key, rounded);
      lastSent.current = now;
    }
  };

  const handleComplete = (val: number) => {
    onCommand(s.key, Math.round(val));
  };

  return (
    <View style={styles.sliderGroup}>
      <Text style={[styles.sliderLabel, isRed && { fontStyle: 'italic' }]}>{s.label}</Text>
      <Slider
        style={styles.slider}
        minimumValue={s.min}
        maximumValue={s.max}
        step={1}
        value={value}
        onValueChange={handleChange}
        onSlidingComplete={handleComplete}
        minimumTrackTintColor={isRed ? "#F44336" : "#F5A623"}
        maximumTrackTintColor="#1B2430"
        thumbTintColor="#E2E8F0"
      />
    </View>
  );
};

export default function ControlScreen() {
  const navigation = useNavigation<any>();
  const { sendCommand, connectedDevice, disconnectDevice } = useBluetooth();
  const [savedCount, setSavedCount] = useState(0);

  const dispatchAxis = (axis: string, val: number) => {
    let cmd = '';
    switch(axis) {
      case 'grip': cmd = `G:${val}`; break;
      case 'wristPitch': cmd = `WP:${val}`; break;
      case 'wristRoll': cmd = `WR:${val}`; break;
      case 'elbow': cmd = `E:${val}`; break;
      case 'shoulder': cmd = `S:${val}`; break;
      case 'waist': cmd = `W:${val}`; break;
      case 'speed': cmd = `SP:${val}`; break;
    }
    if (cmd) sendCommand(cmd + '\n');
  };

  const isConnected = !!connectedDevice;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" translucent={false} />
      
      <Text style={styles.mainTitle}>Arduino Robot Arm Control</Text>

      {/* TOP STATUS BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.connectBtn} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity>
        
        <Text style={[styles.statusText, isConnected ? {color: '#2E7D32'} : {color: '#D93B3B'}]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>

        <TouchableOpacity style={styles.connectBtn} onPress={disconnectDevice}>
          <Text style={styles.connectBtnText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN BODY: Arm & Sliders */}
      <View style={styles.bodyRow}>
        
        {/* LEFT: ARM IMAGE */}
        <View style={styles.armCol}>
          <Image 
            source={require('../assets/images/robotic_arm_new.png')}
            style={styles.armImage}
            resizeMode="contain"
          />
        </View>

        {/* RIGHT: SLIDERS */}
        <View style={styles.slidersCol}>
          {SLIDERS_CONFIG.map(s => (
            <SliderItem key={s.key} s={s} initialValue={90} onCommand={dispatchAxis} />
          ))}

          {/* Speed Slider */}
          <SliderItem 
            s={{key: 'speed', label: 'Speed', min: 0, max: 100}} 
            initialValue={50} 
            onCommand={dispatchAxis}
            isRed={true}
          />
        </View>

      </View>

      {/* BOTTOM ACTION BUTTONS */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setSavedCount(c => c+1)}>
          <Text style={styles.actionBtnText}>SAVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>RUN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setSavedCount(0)}>
          <Text style={styles.actionBtnText}>RESET</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.savedPositions}>Positions saved: {savedCount}</Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  connectBtn: {
    backgroundColor: '#7D8E95',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  connectBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  armCol: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  armImage: {
    width: '100%',
    height: '95%',
  },
  slidersCol: {
    flex: 0.55,
    paddingRight: 15,
    justifyContent: 'space-evenly',
  },
  sliderGroup: {
    marginBottom: 0,
  },
  sliderLabel: {
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  logoSpacer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  logoTextMain: {
    color: '#3498DB',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoTextSub: {
    color: '#3498DB',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  logoLink: {
    color: '#000',
    fontSize: 8,
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: '#515151',
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  savedPositions: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 14,
  }
});