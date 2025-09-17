import { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const Chat = ({ route, navigation, db }) => {
  const [messages, setMessages] = useState([]);
  const { name, bgColor, userID } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: name });

    if (!db) {
      console.error('Firestore database instance is not available');
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          user: data.user || {
            _id: data._id || 'unknown',
            name: data.name || 'Unknown User',
          },
        };
      });

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [db]);

  const onSend = async (newMessages = []) => {
    const message = newMessages[0];
    try {
      // Save user message
      await addDoc(collection(db, 'messages'), {
        text: message.text,
        createdAt: serverTimestamp(),
        user: {
          _id: userID,
          name: name,
        },
      });

      // Generate AI response after a short delay
      setTimeout(async () => {
        const aiResponse = generateAIResponse(message.text);
        await addDoc(collection(db, 'messages'), {
          text: aiResponse,
          createdAt: serverTimestamp(),
          user: {
            _id: 'ai-bot',
            name: 'ChatBot',
          },
        });
      }, 1000); // 1 second delay for natural feel
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Simple AI response generator
  const generateAIResponse = (userMessage) => {
    const responses = [
      "That's interesting! Tell me more.",
      "I understand. How can I help you with that?",
      "Thanks for sharing! What else is on your mind?",
      "Great point! I appreciate your perspective.",
      "I see what you mean. Anything else you'd like to discuss?",
      "Fascinating! Can you elaborate on that?",
      "I'm here to chat! What would you like to talk about next?",
    ];

    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How are you doing today?";
    } else if (lowerMessage.includes('how are you')) {
      return "I'm doing great, thank you for asking! How about you?";
    } else if (lowerMessage.includes('goodbye') || lowerMessage.includes('bye')) {
      return "Goodbye! It was nice chatting with you!";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help! What do you need assistance with?";
    } else if (lowerMessage.includes('weather')) {
      return "I wish I could check the weather for you! Try asking about something else.";
    } else {
      // Random response from the array
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#000' },
        left: { backgroundColor: '#FFF' },
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor || '#fff' }]}>
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: userID, name }}
        renderBubble={renderBubble}
      />
      {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;