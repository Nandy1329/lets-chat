import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Start from './components/Start';
import Chat from './components/Chat';

const Stack = createNativeStackNavigator();

// Your Firebase config
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

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
      >
        <Stack.Screen
          name="Start"
          component={Start}
        />
        <Stack.Screen
          name="Chat">
          {props => <Chat db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;