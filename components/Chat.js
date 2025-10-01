import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bubble,
  GiftedChat,
  InputToolbar
} from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const Chat = ({ route, navigation, db, isConnected }) => {
  const { name, bgColor, userID } = route.params ?? {};
  const [messages, setMessages] = useState([]);
  const botTimerRef = useRef(null);
  const unsubRef = useRef(null);

  // Set screen title
  useLayoutEffect(() => {
    if (name) navigation.setOptions({ title: name });
  }, [name, navigation]);

  // Subscribe to Firestore or load cached messages
  useEffect(() => {
    if (!db) {
      console.error('Firestore not available');
      return;
    }

    if (isConnected) {
      if (typeof unsubRef.current === 'function') {
        unsubRef.current();
        unsubRef.current = null;
      }

      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));

      unsubRef.current = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text || '',
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : (data.createdAt || new Date()),
            user: data.user || { _id: 'unknown', name: 'Unknown' }
          };
        });
        setMessages(newMessages);
        cacheMessages(newMessages);
      });
    } else {
      loadCachedMessages();
    }

    return () => {
      if (typeof unsubRef.current === 'function') {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [isConnected]);

  // Cache messages locally
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages_list', JSON.stringify(messagesToCache));
    } catch (err) {
      console.warn('Cache failed:', err.message);
    }
  };

  // Load cached messages
  const loadCachedMessages = async () => {
    try {
      const cached = await AsyncStorage.getItem('messages_list');
      if (cached) setMessages(JSON.parse(cached));
    } catch (err) {
      console.warn('Cache load failed:', err.message);
    }
  };

  // AI response generator
  const generateAIResponse = useMemo(() => {
    const responses = [
      "That's interesting! Tell me more.",
      'I understand. How can I help you with that?',
      'Thanks for sharing! What else is on your mind?',
      'Great point! I appreciate your perspective.',
      'I see what you mean. Anything else you’d like to discuss?',
      'Fascinating! Can you elaborate on that?',
      "I'm here to chat! What would you like to talk about next?"
    ];

    return (text) => {
      const lower = (text || '').toLowerCase();
      if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How are you doing today?';
      if (lower.includes('how are you')) return "I'm doing great, thank you for asking! How about you?";
      if (lower.includes('goodbye') || lower.includes('bye')) return 'Goodbye! It was nice chatting with you!';
      if (lower.includes('help')) return "I'm here to help! What do you need assistance with?";
      if (lower.includes('weather')) return 'I wish I could check the weather for you! Try asking about something else.';
      return responses[Math.floor(Math.random() * responses.length)];
    };
  }, []);

  // Clean up bot timer
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  // Send message + bot reply
  const onSend = useCallback(async (newMessages = []) => {
    const m = newMessages[0];
    if (!m?.text?.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: m.text,
        createdAt: serverTimestamp(),
        user: { _id: userID || 'anonymous', name: name || 'You' }
      });

      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      botTimerRef.current = setTimeout(async () => {
        const aiText = generateAIResponse(m.text);
        await addDoc(collection(db, 'messages'), {
          text: aiText,
          createdAt: serverTimestamp(),
          user: { _id: 'ai-bot', name: 'ChatBot' }
        });
      }, 900);
    } catch (err) {
      console.error('Send failed:', err);
      Alert.alert('Error', 'Could not send your message.');
    }
  }, [db, userID, name, generateAIResponse]);

  // Custom bubble styling
  const renderBubble = useCallback((props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#111' },
        left: { backgroundColor: '#f2f3f5' }
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#1f2937' }
      }}
    />
  ), []);

  // Hide input when offline
  const renderInputToolbar = (props) => (
    isConnected ? <InputToolbar {...props} /> : null
  );

  const keyboardOffset = Platform.select({ ios: 88, android: 0 });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor || '#fff' }]} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {messages.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading messages...</Text>
          </View>
        )}
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: userID || 'anonymous', name: name || 'You' }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          placeholder="Message..."
          alwaysShowSend
          showUserAvatar
          scrollToBottom
          timeTextStyle={{
            right: { color: '#d1d5db' },
            left: { color: '#6b7280' }
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardOffset}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 }
});

export default Chat;
