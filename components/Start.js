import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import bgImage from '../assets/background-image.png';
const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [bgColor, setBgColor] = useState(colors[0]);

  const handleContinue = async () => {
    try {
      // Sign in anonymously with Firebase
      const result = await signInAnonymously(auth);
      const userID = result.user.uid;

      // Navigate to Chat with user data
      navigation.navigate('Chat', {
        name: name.trim() || 'User',
        bgColor,
        userID,
      });
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome! Let's Chat!</Text>
        <Text style={{ color: '#757083', fontSize: 16, marginBottom: 20 }}>
          Enter your name and choose a background color to start chatting.
        </Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor="#757083"
          />
        </View>

        <View style={styles.colorSection}>
          <Text style={styles.colorText}>Choose Background Color:</Text>
          <View style={styles.colorContainer}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color, borderWidth: bgColor === color ? 2 : 0 }
                ]}
                onPress={() => setBgColor(color)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover', justifyContent: 'center' },
  container: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  title: { fontSize: 36, fontWeight: '600', marginBottom: 30, color: '#474056' },
  inputBox: { width: '100%', marginBottom: 25 },
  textInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#757083',
    borderRadius: 5,
    fontSize: 16,
    color: '#757083',
    backgroundColor: '#fff'
  },
  colorSection: { width: '100%', alignItems: 'center', marginBottom: 25 },
  colorText: { fontSize: 16, color: '#757083', marginBottom: 10 },
  colorContainer: { flexDirection: 'row', justifyContent: 'center' },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
    borderColor: '#757083'
  },
  button: {
    backgroundColor: '#757083',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});

export default Start;