// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Create the navigator
const Stack = createNativeStackNavigator();

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// import the screens
import ShoppingLists from './components/ShoppingLists';

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

  
  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ShoppingLists"
      >
        <Stack.Screen
          name="ShoppingLists"
        >
          {props => <ShoppingLists db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );

}

export default App;
