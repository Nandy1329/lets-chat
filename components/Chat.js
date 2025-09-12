// Chat.js: Real-time messages, passes user info to GiftedChat, Firestore integration
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Chat = ({ route, navigation, db, isConnected = true }) => {
  const { name, userID, backgroundColor } = route.params;
  const [messages, setMessages] = useState([]);

  // Custom bubble styling
  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: "#ce8551ff" },
        left: { backgroundColor: "#fffde8ff" }
      }}
    />
  );

  // Only show input if connected
  const renderInputToolbar = (props) => (
    isConnected ? <InputToolbar {...props} /> : null
  );

  // Save message to Firestore
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  useEffect(() => {
    navigation.setOptions({ title: name });
    let unsubMessages;
    if (isConnected) {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, async (docs) => {
        let newMessages = [];
        docs.forEach(doc => {
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
  }, [isConnected, db, name, navigation]);

  // Load messages from cache
  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem('messages');
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error('Messages failed to load from AsyncStorage', error);
    }
  };

  // Cache messages to AsyncStorage
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache));
    } catch (error) {
      console.error('Failed to cache messages', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}
      accessible={false}
      importantForAccessibility="no"
    >
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: userID, name: name }}
        keyboardShouldPersistTaps="handled"
        keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
      />
    </SafeAreaView>
  );
};

export default Chat;