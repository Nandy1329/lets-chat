import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNetInfo } from '@react-native-community/netinfo';

// Firebase Core
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Screens
import Welcome from './components/Welcome';
import Start from './components/Start';
import Chat from './components/Chat';

// Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBuvmkpA_tx7sT96HXPmTxXDpybAZJUc3o',
  authDomain: 'shopping-list-demo-4accc.firebaseapp.com',
  projectId: 'shopping-list-demo-4accc',
  storageBucket: 'shopping-list-demo-4accc.appspot.com',
  messagingSenderId: '912724780140',
  appId: '1:912724780140:web:1392e68dd23b6bef23e449',
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Start">
          {(props) => <Start {...props} auth={auth} />}
        </Stack.Screen>
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
}
export default App;
