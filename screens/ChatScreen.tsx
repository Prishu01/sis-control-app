import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Layout from '../components/Layout';
import { COLORS, RADIUS } from '../constants/theme';
import Voice from '@react-native-voice/voice';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your SIS AI assistant. How can I help you control your hardware today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Voice Setup
  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setInputText(text);
        // Automatically send after a short delay to let user see the text
        setTimeout(() => sendMessage(text), 500);
      }
    };
    Voice.onSpeechError = (e: any) => {
      console.log('Chat Voice Error:', e);
      setIsListening(false);
    };

    return () => {
      try {
        Voice.destroy().then(Voice.removeAllListeners);
      } catch (e) {
        console.log('Chat Voice cleanup error:', e);
      }
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleVoice = async () => {
    if (isListening) {
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
      setInputText('');
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
            message: 'To use voice query, we need access to your microphone.',
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

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (textToSend.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const apiUrl = `https://pawani09-sistec-bot.hf.space/ask?question=${encodeURIComponent(textToSend)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || "No response",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "⚠️ Error connecting to AI",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={styles.botIcon}>
            <Animated.View
              style={[
                styles.viRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.viCore} />
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Layout title="AI Assistant">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >

        {/* HEADER */}
        <View style={styles.cleanHeader}>
          <Text style={styles.cleanHeaderTitle}>SIS AI ONLINE</Text>
        </View>

        {/* CHAT LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* TYPING */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        )}

        {/* INPUT */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={toggleVoice} style={styles.voiceBtn}>
              <Ionicons 
                name={isListening ? "mic" : "mic-outline"} 
                size={22} 
                color={isListening ? COLORS.primary : "#666"} 
              />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder={isListening ? "Listening..." : "Type a command..."}
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity onPress={() => sendMessage()} style={styles.sendBtn}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  cleanHeader: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  cleanHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },

  listContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },

  userRow: {
    alignSelf: 'flex-end',
  },

  botRow: {
    alignSelf: 'flex-start',
  },

  /* BOT ICON */
  botIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  viCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  viRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  /* BUBBLES */
  bubble: {
    padding: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },

  userBubble: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },

  botBubble: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: '#333',
  },

  messageText: {
    fontSize: 14,
    color: '#fff',
  },

  userText: {
    fontWeight: '500',
  },

  botText: {
    color: '#ccc',
  },

  timestamp: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
    color: '#777',
  },

  typingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  typingText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  /* INPUT */
  inputWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    paddingLeft: 15,
    borderWidth: 1,
    borderColor: '#333',
  },

  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  voiceBtn: {
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
});