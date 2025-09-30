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
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bubble,
  Day,
  GiftedChat,
  SystemMessage,
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
  let unsubMessages;

  useLayoutEffect(() => {
    if (name) navigation.setOptions({ title: name });
  }, [name, navigation]);

  useEffect(() => {
    if (!db) {
      console.error('Firestore database instance is not available');
      return;
    }

    if (isConnected === true) {
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));

      unsubMessages = onSnapshot(q, (documentsSnapshot) => {
        let newMessages = [];
        documentsSnapshot.forEach((doc) => {
          newMessages.push({
            _id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis())
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else {
      loadCachedMessages();
    }

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages_list', JSON.stringify(messagesToCache));
    } catch (error) {
      console.log('Cache error:', error.message);
    }
  };

  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem('messages_list');
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.log('Load cache error:', error.message);
    }
  };

  const renderInputToolbar = (props) => {
    return isConnected ? <InputToolbar {...props} /> : null;
  };

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

    return (userMessage) => {
      const lower = (userMessage || '').toLowerCase();

      if (lower.includes('hello') || lower.includes('hi')) {
        return 'Hello! How are you doing today?';
      }
      if (lower.includes('how are you')) {
        return "I'm doing great, thank you for asking! How about you?";
      }
      if (lower.includes('goodbye') || lower.includes('bye')) {
        return 'Goodbye! It was nice chatting with you!';
      }
      if (lower.includes('help')) {
        return "I'm here to help! What do you need assistance with?";
      }
      if (lower.includes('weather')) {
        return 'I wish I could check the weather for you! Try asking about something else.';
      }
      return responses[Math.floor(Math.random() * responses.length)];
    };
  }, []);

  useEffect(() => {
    return () => {
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
      }
    };
  }, []);

  const onSend = useCallback(
    async (newMessages = []) => {
      if (!db) {
        Alert.alert('Error', 'Database not initialized.');
        return;
      }
      const m = newMessages[0];
      if (!m?.text?.trim()) return;

      try {
        await addDoc(collection(db, 'messages'), {
          text: m.text,
          createdAt: serverTimestamp(),
          user: {
            _id: userID,
            name: name || 'You'
          }
        });

        botTimerRef.current = setTimeout(async () => {
          try {
            const aiText = generateAIResponse(m.text);
            await addDoc(collection(db, 'messages'), {
              text: aiText,
              createdAt: serverTimestamp(),
              user: {
                _id: 'ai-bot',
                name: 'ChatBot'
              }
            });
          } catch (botErr) {
            console.error('Error sending AI response:', botErr);
          }
        }, 900);
      } catch (err) {
        console.error('Error sending message:', err);
        Alert.alert('Error', 'Could not send your message. Please try again.');
      }
    },
    [db, userID, name, generateAIResponse]
  );

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

  const renderScrollToBottom = useCallback(() => (
    <View style={styles.scrollToBottomDot} />
  ), []);

  const keyboardVerticalOffset = Platform.select({
    ios: 88,
    android: 0,
    default: 0
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor || '#fff' }]} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: userID, name }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          placeholder="Message..."
          alwaysShowSend
          showUserAvatar
          showAvatarForEveryMessage={false}
          renderUsernameOnMessage={false}
          scrollToBottom
          renderScrollToBottom={renderScrollToBottom}
          timeTextStyle={{
            right: { color: '#d1d5db' },
            left: { color: '#6b7280' }
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1
  },
  scrollToBottomDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111',
    marginRight: 8,
    marginBottom: 8
  }
});

export default Chat;
