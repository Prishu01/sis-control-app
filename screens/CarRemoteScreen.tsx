import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import Layout from '../components/Layout';
import { useBluetooth } from '../context/BluetoothContext';
import { COLORS, RADIUS } from '../constants/theme';
import Voice from '@react-native-voice/voice';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';

export default function CarRemoteScreen() {
  const { sendCommand, connectedDevice } = useBluetooth();
  const [speed, setSpeed] = useState(255);
  
  // States for new features
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isGyroActive, setIsGyroActive] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  // Voice Setup
  useEffect(() => {
    if (!Voice) return;

    Voice.onSpeechStart = () => setIsVoiceActive(true);
    Voice.onSpeechEnd = () => setIsVoiceActive(false);
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        processVoiceCommand(e.value[0]);
      }
    };
    Voice.onSpeechError = (e: any) => {
      console.log('Voice Error:', e);
      setIsVoiceActive(false);
    };

    return () => {
      try {
        Voice.destroy().then(Voice.removeAllListeners);
      } catch (e) {
        console.log('Voice cleanup error:', e);
      }
    };
  }, []);

  // Gyro (Accelerometer) Setup
  useEffect(() => {
    let subscription: any;

    if (isGyroActive) {
      if (!accelerometer) {
        Alert.alert('Sensor Error', 'Accelerometer not available on this device.');
        setIsGyroActive(false);
        return;
      }

      try {
        setUpdateIntervalForType(SensorTypes.accelerometer, 200);
        subscription = accelerometer
          .pipe(
            map(({ x, y, z }: any) => ({
              pitch: y, 
              roll: x,  
            })),
            filter(({pitch, roll}: any) => Math.abs(pitch) > 3 || Math.abs(roll) > 3)
          )
          .subscribe(
            ({ pitch, roll }: any) => {
              if (pitch < -3) handleAutoSend('F');
              else if (pitch > 3) handleAutoSend('B');
              else if (roll < -3) handleAutoSend('R');
              else if (roll > 3) handleAutoSend('L');
            },
            (error: any) => {
              console.log('Sensor Error:', error);
              setIsGyroActive(false);
            }
          );
      } catch (e) {
        console.log('Sensor Subscription Error:', e);
        setIsGyroActive(false);
      }
    } else {
      if (lastCommand !== 'S') handleAutoSend('S');
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isGyroActive]);

  const getSpeedChar = (val: number) => {
    if (val >= 240) return 'q';
    return Math.floor(val / 25).toString();
  };

  const handleAutoSend = (cmd: string) => {
    if (cmd === lastCommand) return;
    send(cmd);
    setLastCommand(cmd);
  };

  const send = (cmd: string) => {
    if (!connectedDevice) return;
    sendCommand(getSpeedChar(speed));
    setTimeout(() => {
      sendCommand(cmd);
    }, 50);
  };

  const handleSpeedChange = (val: number) => {
    const rounded = Math.round(val);
    setSpeed(rounded);
    sendCommand(getSpeedChar(rounded));
  };

  const processVoiceCommand = (text: string) => {
    const speech = text.toLowerCase();
    console.log('Speech result:', speech);

    if (speech.includes('forward') || speech.includes('front') || speech.includes('ahead') || speech.includes('go')) {
      send('F');
    } else if (speech.includes('back') || speech.includes('reverse') || speech.includes('backward')) {
      send('B');
    } else if (speech.includes('left')) {
      send('L');
    } else if (speech.includes('right')) {
      send('R');
    } else if (speech.includes('stop') || speech.includes('wait') || speech.includes('halt')) {
      send('S');
    }
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      try {
        await Voice.stop();
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const granted = await requestMicPermission();
    if (!granted) return;

    try {
      setLastCommand('');
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not start voice recognition.');
    }
  };

  const requestMicPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to control the car with voice.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  return (
    <Layout title="Car Remote" isConnected={!!connectedDevice}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          {/* 🔥 MODE SWITCHES */}
          <View style={styles.modeRow}>
          <Pressable 
            style={[styles.modeBtn, isVoiceActive && styles.modeBtnActive]}
            onPress={toggleVoice}
          >
            <Ionicons name="mic" size={24} color={isVoiceActive ? '#fff' : COLORS.primary} />
            <Text style={[styles.modeText, isVoiceActive && {color: '#fff'}]}>
              {isVoiceActive ? 'LISTENING' : 'VOICE'}
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.modeBtn, isGyroActive && styles.modeBtnActive]}
            onPress={() => setIsGyroActive(!isGyroActive)}
          >
            <Ionicons name="phone-portrait" size={24} color={isGyroActive ? '#fff' : COLORS.primary} />
            <Text style={[styles.modeText, isGyroActive && {color: '#fff'}]}>
              {isGyroActive ? 'TILT ON' : 'GYRO'}
            </Text>
          </Pressable>
        </View>

        {/* Forward */}
        <Pressable 
          style={({pressed}) => [styles.btn, pressed && styles.btnPressed]} 
          onPress={() => send('F')}
        >
          <Ionicons name="caret-up" size={40} color={COLORS.primary} />
        </Pressable>

        <View style={styles.row}>
          {/* Left */}
          <Pressable 
            style={({pressed}) => [styles.btn, pressed && styles.btnPressed]} 
            onPress={() => send('L')}
          >
            <Ionicons name="caret-back" size={40} color={COLORS.primary} />
          </Pressable>

          {/* Stop */}
          <Pressable 
            style={({pressed}) => [styles.btn, styles.stopBtn, pressed && styles.btnPressed]} 
            onPress={() => send('S')}
          >
            <Ionicons name="square" size={28} color="#ff4d4d" />
          </Pressable>

          {/* Right */}
          <Pressable 
            style={({pressed}) => [styles.btn, pressed && styles.btnPressed]} 
            onPress={() => send('R')}
          >
            <Ionicons name="caret-forward" size={40} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Backward */}
        <Pressable 
          style={({pressed}) => [styles.btn, pressed && styles.btnPressed]} 
          onPress={() => send('B')}
        >
          <Ionicons name="caret-down" size={40} color={COLORS.primary} />
        </Pressable>

        {/* SPEED SLIDER */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            POWER LEVEL: {speed === 255 ? 'MAX' : Math.floor((speed/255)*100)+'%'}
          </Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={255}
            value={speed}
            onValueChange={val => handleSpeedChange(val)}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor="#333"
            thumbTintColor={COLORS.primary}
          />
        </View>

        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    paddingVertical: 40,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  modeRow: {
    flexDirection: 'row',
    marginBottom: 30,
    width: '80%',
    justifyContent: 'space-between',
  },

  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 120,
    justifyContent: 'center',
  },

  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  modeText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
  },

  row: { 
    flexDirection: 'row', 
    marginVertical: 10 
  },

  /* 🔥 BUTTON (GLASS STYLE) */
  btn: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.05)', // glass effect
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderWidth: 1,
    borderColor: '#333',
  },

  btnPressed: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    transform: [{ scale: 0.92 }],
  },

  stopBtn: {
    backgroundColor: '#2a0a0a',
    borderColor: '#ff4d4d',
  },

  /* 🔥 SLIDER CARD */
  sliderContainer: {
    width: '85%',
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#333',
  },

  sliderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.5,
  },

  slider: {
    width: '100%',
    height: 40,
  },
});