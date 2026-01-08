/**
 * Start Screen Component
 * 
 * This is the initial screen of the chat app where users can:
 * - Enter their name in a text input field
 * - Select a background color for the chat screen from 4 predefined options
 * - Navigate to the chat screen with their personalized settings
 * 
 * Features:
 * - Form validation to ensure name is entered before proceeding
 * - Color selection with visual feedback for selected color
 * - Keyboard handling to prevent UI elements from being covered
 * - Elegant design with shadows and proper spacing
 * - Accessibility support with proper labels and roles
 * 
 * Navigation: Passes user's name and selected background color to Chat screen
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground
} from 'react-native';
// Firebase Authentication (anonymous login)
import { signInAnonymouslyRN } from '../firebase';

// Background image
const bgImage = require('../assets/background-image.png');

const Start = ({ navigation, isConnected }) => {
  // State to store the user's name input
  const [name, setName] = useState('');

  // State to store the selected background color (defaults to black)
  const [selectedColor, setSelectedColor] = useState('#090C08');

  // Available background colors for the chat screen
  // These colors provide good contrast and readability for chat messages
  const backgroundColors = [
    '#090C08', // Black - Classic and professional
    '#474056', // Dark Purple - Modern and sleek
    '#8A95A5', // Blue Gray - Calm and neutral
    '#B9C6AE'  // Light Green - Fresh and natural
  ];

  /**
   * Anonymous sign-in then navigate to Chat.
   * If successful, passes uid, name, and selected background color.
   */
  const signInUser = async () => {
    if (name.trim() === '') {
      Alert.alert('Please enter your name', 'You need to enter a name to start chatting.');
      return;
    }

    try {
      // If offline, skip auth and navigate with a temporary offline user id
      if (!isConnected) {
        const offlineId = `offline_${Date.now()}`;
        navigation.navigate('Chat', {
          userId: offlineId,
          name: name.trim(),
          backgroundColor: selectedColor,
        });
        return;
      }

      const result = await signInAnonymouslyRN();
      const user = result?.user;

      if (user?.uid) {
        navigation.navigate('Chat', {
          userId: user.uid,
          name: name.trim(),
          backgroundColor: selectedColor,
        });
      } else {
        Alert.alert('Sign-in failed', 'No user returned from authentication.');
      }
    } catch (e) {
      const message = e?.message ?? 'Unknown error';
      Alert.alert('Unable to sign in', message);
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      {/* Subtle overlay to improve text readability over the image */}
      <View style={styles.overlay} pointerEvents="none" />
      {/* KeyboardAvoidingView prevents keyboard from covering the input fields */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Chat App</Text>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="#757083"
            />

            {/* Color Selection */}
            <Text style={styles.colorText}>Choose Background Color:</Text>
            <View style={styles.colorContainer}>
              {backgroundColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                  accessible={true}
                  accessibilityLabel={`Background color option ${index + 1}`}
                  accessibilityRole="button"
                />
              ))}
            </View>

            {/* Start Chat Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={signInUser}
              accessible={true}
              accessibilityLabel="Start chatting"
              accessibilityRole="button"
            >
              <Text style={styles.startButtonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  // KeyboardAvoidingView to handle keyboard behavior on start screen
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '88%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    width: '100%',
    height: 50,
    borderColor: '#757083',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 20,
  },
  colorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25, // Half of width/height to make it circular
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#757083',
    borderWidth: 3,
  },
  startButton: {
    backgroundColor: '#757083',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Start;