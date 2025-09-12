// App.js: Firebase initialization, navigation setup, passing db prop
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Welcome from "./Welcome";
import ShoppingLists from "./ShoppingLists";
import Chat from "./Chat";
import { StyleSheet } from "react-native";

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyBuvmkpA_tx7sT96HXPmTxXDpybAZJUc3o",
    authDomain: "shopping-list-demo-4accc.firebaseapp.com",
    projectId: "shopping-list-demo-4accc",
    storageBucket: "shopping-list-demo-4accc.firebasestorage.app",
    messagingSenderId: "912724780140",
    appId: "1:912724780140:web:1392e68dd23b6bef23e449"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="ShoppingLists">
          {props => <ShoppingLists {...props} db={db} />}
        </Stack.Screen>
        <Stack.Screen name="Chat">
          {props => <Chat {...props} db={db} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default App;