
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Bubble, GiftedChat, SystemMessage } from 'react-native-gifted-chat';

const Chat = ({ route, navigation }) => {
  const { name, backgroundColor } = route.params;
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: "Hello developer",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "React Native",
        avatar: "https://placeimg.com/140/140/any",
      },
    },
    {
      _id: 2,
      text: "You have entered the chat",
      createdAt: new Date(),
      system: true,
    },
  ]);

  // Set navigation title  npx expo run:android
  useEffect(() => {
    navigation.setOptions({ title: name });
  }, [name]);

  // Memoize onSend to prevent unnecessary re-renders
  const onSend = useCallback((newMessages = []) => {
    setMessages(prev => GiftedChat.append(prev, newMessages));
  }, []);

  // Bubble styling: user's bubble black with white text
  const renderBubble = useCallback((props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#000' },
        left: { backgroundColor: '#FFF' },
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#222' },
      }}
    />
  ), []);

  // Dynamically set container background color
  const containerStyle = [
    styles.container,
    { backgroundColor: backgroundColor || '#fff' }
  ];

  // Custom system message style
  const renderSystemMessage = (props) => (
    <SystemMessage
      {...props}
      textStyle={{ color: '#222', fontWeight: 'bold' }}
    />
  );

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderSystemMessage={renderSystemMessage}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Chat;