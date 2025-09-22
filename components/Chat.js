import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
// If you normally import db from a local module, you can do:
// import { db } from '../lib/firebase';

// Props:
// - route.params: { name, bgColor, userID }
// - navigation: React Navigation stack navigation
// - db: Firestore instance (or import it directly inside this file)
const Chat = ({ route, navigation, db }) => {
  const { name, bgColor, userID } = route.params ?? {};
  const [messages, setMessages] = useState([]);
  const botTimerRef = useRef(null);

  // Set the screen title deterministically
  useLayoutEffect(() => {
    if (name) navigation.setOptions({ title: name });
  }, [name, navigation]);

  // Subscribe to latest messages
  useEffect(() => {
    if (!db) {
      console.error('Firestore database instance is not available');
      return;
    }

    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50) // keep the list snappy
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          // GiftedChat message shape
          return {
            _id: docSnap.id,
            text: data.text ?? '',
            createdAt:
              // If serverTimestamp not yet materialized, fall back to now so UI is stable
              (data.createdAt && typeof data.createdAt.toDate === 'function'
                ? data.createdAt.toDate()
                : new Date()),
            user: data.user ?? {
              _id: data._id ?? 'unknown',
              name: data.name ?? 'Unknown User',
            },
          };
        });

        setMessages(fetched);
      },
      (err) => {
        console.error('onSnapshot error:', err);
        Alert.alert('Error', 'Failed to load messages. Please try again.');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [db]);

  // Simple AI response generator – stable reference
  const generateAIResponse = useMemo(() => {
    const responses = [
      "That's interesting! Tell me more.",
      'I understand. How can I help you with that?',
      'Thanks for sharing! What else is on your mind?',
      'Great point! I appreciate your perspective.',
      'I see what you mean. Anything else you’d like to discuss?',
      'Fascinating! Can you elaborate on that?',
      "I'm here to chat! What would you like to talk about next?",
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

  // Ensure we clear any pending bot timer on unmount
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
        // Save user message in Firestore
        await addDoc(collection(db, 'messages'), {
          text: m.text,
          createdAt: serverTimestamp(),
          user: {
            _id: userID,
            name: name || 'You',
          },
        });

        // Schedule bot reply
        botTimerRef.current = setTimeout(async () => {
          try {
            const aiText = generateAIResponse(m.text);
            await addDoc(collection(db, 'messages'), {
              text: aiText,
              createdAt: serverTimestamp(),
              user: {
                _id: 'ai-bot',
                name: 'ChatBot',
              },
            });
          } catch (botErr) {
            console.error('Error sending AI response:', botErr);
          }
        }, 900); // slightly under 1s feels snappy
      } catch (err) {
        console.error('Error sending message:', err);
        Alert.alert('Error', 'Could not send your message. Please try again.');
      }
    },
    [db, userID, name, generateAIResponse]
  );

  const renderBubble = useCallback((props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: '#111' },
          left: { backgroundColor: '#f2f3f5' },
        }}
        textStyle={{
          right: { color: '#fff' },
          left: { color: '#1f2937' },
        }}
      />
    );
  }, []);

  // Optional: Render a small scroll-to-bottom indicator
  const renderScrollToBottom = useCallback(() => {
    return (
      <View style={styles.scrollToBottomDot} />
    );
  }, []);

  const keyboardVerticalOffset = Platform.select({
    ios: 88, // adjust to your header height; or use useHeaderHeight() from @react-navigation/elements
    android: 0,
    default: 0,
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor || '#fff' }]} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: userID, name }}
          renderBubble={renderBubble}
          placeholder="Message..."
          alwaysShowSend
          showUserAvatar
          showAvatarForEveryMessage={false}
          renderUsernameOnMessage={false}
          scrollToBottom
          renderScrollToBottom={renderScrollToBottom}
          timeTextStyle={{
            right: { color: '#d1d5db' },
            left: { color: '#6b7280' },
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
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollToBottomDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111',
    marginRight: 8,
    marginBottom: 8,
  },
});

export default Chat;