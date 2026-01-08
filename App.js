import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useMemo } from 'react';

// Firebase instances (initialized centrally in firebase.js)
import { db } from './firebase';
import { enableNetwork, disableNetwork  } from 'firebase/firestore';
import { useNetInfo } from '@react-native-community/netinfo';

// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
  // Real-time network info
  const netInfo = useNetInfo();
  const isConnected = useMemo(() => {
    // Treat undefined isInternetReachable as true when connected to avoid false negatives on first load
    const reachable = netInfo.isInternetReachable;
    return Boolean(netInfo.isConnected && (reachable === undefined || reachable));
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  // Toggle Firestore network based on connectivity
  useEffect(() => {
    let cancelled = false;
    const toggle = async () => {
      try {
        if (isConnected) {
          await enableNetwork(db);
        } else {
          await disableNetwork(db);
        }
      } catch (e) {
        if (__DEV__) console.warn('Firestore network toggle failed:', e?.message || e);
      }
    };
    toggle();
    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#757083',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Start" options={{ title: 'Welcome' }}>
          {(props) => <Start {...props} isConnected={isConnected} />}
        </Stack.Screen>
        {/* Pass the Firestore database instance to Chat without putting it in navigation state */}
        <Stack.Screen name="Chat">
          {(props) => <Chat {...props} db={db} isConnected={isConnected} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    fontSize: 18,
    color: '#BDC3C7',
    textAlign: 'center',
  },
});

export default App;