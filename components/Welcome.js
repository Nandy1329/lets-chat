import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

const Welcome = ({ navigation }) => {
  const auth = getAuth();

  const signInUser = async () => {
    try {
      const result = await signInAnonymously(auth);
      navigation.navigate('ShoppingLists', { userID: result.user.uid });
      Alert.alert('Signed in Successfully!');
    } catch (e) {
      Alert.alert('Unable to sign in, try again.');
      console.error('Anon sign-in failed:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Shopping Lists</Text>
      <TouchableOpacity style={styles.startButton} onPress={signInUser}>
        <Text style={styles.startButtonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.startButton, { marginTop: 12, backgroundColor: '#474056' }]}
        onPress={() => navigation.navigate('Start')}
      >
        <Text style={styles.startButtonText}>Go to Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appTitle: { fontWeight: '600', fontSize: 45, marginBottom: 100 },
  startButton: {
    backgroundColor: '#000',
    height: 50,
    width: '88%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  startButtonText: { color: '#FFF' }
});

export default Welcome;