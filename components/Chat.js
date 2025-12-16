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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import CustomActions from './CustomActions';

const Chat = ({ route, navigation, db, isConnected }) => {
  const { name, bgColor, userID } = route.params ?? {};
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const botTimerRef = useRef(null);
  const unsubRef = useRef(null);
  const storage = getStorage();

  useLayoutEffect(() => {
    if (name) navigation.setOptions({ title: name });
  }, [name, navigation]);

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
            user: data.user || { _id: 'unknown', name: 'Unknown' },
            image: data.image || null,
            location: data.location || null
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
  }, [isConnected, db]);

  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages_list', JSON.stringify(messagesToCache));
    } catch (err) {
      console.warn('Cache failed:', err.message);
    }
  };

  const loadCachedMessages = async () => {
    try {
      const cached = await AsyncStorage.getItem('messages_list');
      if (cached) setMessages(JSON.parse(cached));
    } catch (err) {
      console.warn('Cache load failed:', err.message);
    }
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

  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  const onSend = useCallback(async (newMessages = []) => {
    const m = newMessages[0];
    if (!m?.text?.trim() && !m?.image && !m?.location) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: m.text || '',
        image: m.image || null,
        location: m.location || null,
        createdAt: serverTimestamp(),
        user: { _id: userID || 'anonymous', name: name || 'You' }
      });

      if (m.text && botTimerRef.current) clearTimeout(botTimerRef.current);
      if (m.text) {
        botTimerRef.current = setTimeout(async () => {
          const aiText = generateAIResponse(m.text);
          await addDoc(collection(db, 'messages'), {
            text: aiText,
            createdAt: serverTimestamp(),
            user: { _id: 'ai-bot', name: 'ChatBot' }
          });
        }, 900);
      }
    } catch (err) {
      console.error('Send failed:', err);
      Alert.alert('Error', 'Could not send your message.');
    }
  }, [db, userID, name, generateAIResponse]);

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await fetch(uri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const filename = uri.split('/').pop() || `photo_${timestamp}.jpg`;
      const storageRef = ref(storage, `user_uploads/${userID || 'anonymous'}/${timestamp}_${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          setUploadProgress(Math.round(progress * 100));
        },
        (error) => {
          console.error('Upload error:', error);
          Alert.alert('Upload failed', error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onSend([{ image: downloadURL }]);
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Upload failed', err.message);
      setUploading(false);
    }
  };

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

  const renderInputToolbar = (props) => (
    isConnected ? <InputToolbar {...props} /> : null
  );

  const renderActions = (props) => (
    <CustomActions
      {...props}
      onSend={onSend}
      storage={storage}
      userId={userID}
      pickImage={uploadImage}
    />
  );

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage?.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 8, marginTop: 6 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          pointerEvents="none"
        >
          <Marker coordinate={currentMessage.location} />
        </MapView>
      );
    }
    return null;
  };

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
          renderActions={renderActions}
          renderCustomView={renderCustomView}
          placeholder="Message..."
          alwaysShowSend
          showUserAvatar
          scrollToBottom
          timeTextStyle={{
            right: { color: '#d1d5db' },
            left: { color: '#6b7280' }
          }}
        />

        {uploading && (
          <View style={styles.uploading}>
            <Text style={styles.uploadingText}>
              Uploading image... {uploadProgress}%
            </Text>
          </View>
        )}

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
  container: { flex: 1 },
  uploading: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#000000aa',
    padding: 8,
    borderRadius: 6
  },
  uploadingText: {
    color: '#fff',
    fontSize: 14
  }
});

export default Chat;
