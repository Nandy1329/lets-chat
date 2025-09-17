import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Screens
import Welcome from './components/Welcome';
import ShoppingLists from './components/ShoppingLists';
import Chat from './components/Chat';
import Start from './components/Start';

const firebaseConfig = {
  apiKey: 'AIzaSyBuvmkpA_tx7sT96HXPmTxXDpybAZJUc3o',
  authDomain: 'shopping-list-demo-4accc.firebaseapp.com',
  projectId: 'shopping-list-demo-4accc',
  storageBucket: 'shopping-list-demo-4accc.appspot.com', // corrected
  messagingSenderId: '912724780140',
  appId: '1:912724780140:web:1392e68dd23b6bef23e449'
};

// Initialize Firebase once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {/* Shopping Lists flow */}
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="ShoppingLists">
          {(props) => <ShoppingLists {...props} db={db} />}
        </Stack.Screen>

        {/* Chat flow */}
        <Stack.Screen name="Start">
          {(props) => <Start {...props} auth={auth} />}
        </Stack.Screen>
        <Stack.Screen name="Chat">
          {(props) => <Chat {...props} db={db} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}