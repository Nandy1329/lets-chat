import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNetInfo } from '@react-native-community/netinfo';
import { disableNetwork, enableNetwork } from 'firebase/firestore';

// Firebase (import only, no re-init here)
import { db } from './firebase';

// Screens
import Start from './components/Start';
import Chat from './components/Chat';

const Stack = createNativeStackNavigator();

const App = () => {
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('Connection lost!');
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              {...props}
              db={db}
              isConnected={connectionStatus.isConnected}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;