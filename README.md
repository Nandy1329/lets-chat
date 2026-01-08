📱 LetsChat – React Native Chat App
A cross‑platform chat application built with Expo, React Native, and Firebase.
Features include:

- Real‑time messaging with Firestore
- Image sharing (from library or camera) stored in Firebase Storage
- Location sharing with Expo Location + map rendering
- Offline support with AsyncStorage
- Custom chat bubbles and accessibility‑friendly UI

🚀 Prerequisites
Before you begin, ensure you have the following installed:

- Node.js (v20 recommended)
- Expo CLI
  npm install -g expo-cli
- (or use npx expo without global install)
- Android Studio for emulator testing
  (or use a physical device with Expo Go app)
- A Firebase project with Firestore and Storage enabled

⚙️ Setup Instructions

- Clone the repository
  git clone https://github.com/yourusername/lets-chat.git
  cd lets-chat
- Install dependencies
  npm install
- Configure Firebase
- Create a Firebase project in the console
- Enable Firestore Database and Storage
- Copy your Firebase config into App.js (or firebase.js if centralized):
  const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
  };
- Set Firebase Storage Rules For development:
  rules_version = '2';
  service firebase.storage {
  match /b/{bucket}/o {
  match /{allPaths=\*\*} {
  allow read, write: if true;
  }
  }
  }
- For production (recommended):
  rules_version = '2';
  service firebase.storage {
  match /b/{bucket}/o {
  match /user_uploads/{userId}/{allPaths=\*\*} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  }
  }
- Run the app
  npx expo start

📦 Libraries Used

- expo-image-picker – select images from library or camera
- expo-location – share device location
- react-native-gifted-chat – chat UI
- @react-native-async-storage/async-storage – offline message caching
- firebase – Firestore + Storage
- react-native-maps – render location bubbles
- @react-navigation/native + @react-navigation/native-stack – navigation

🧪 Testing

- Start the app with npx expo start
- Test on Android emulator or physical device
- Verify:
- Send text messages
- Pick an image from library
- Take a photo with camera
- Share location
- Confirm images appear in Firebase Storage
- Confirm messages appear in Firestore

📹 Demo Recording
To demonstrate functionality:

- Open chat screen
- Send image (library + camera)
- Share location
- Show messages in Firestore
- Show images in Firebase Storage
  (Record using Android Studio emulator or physical device and upload the file/link here.)

👉 Next step: clone your repo into a fresh folder, follow this README exactly, and see if anything is missing. If you hit a missing dependency (like expo install react-native-maps), add it to the Libraries Used section.
Would you like me to also draft a short “Features” GIF/video script you can record in Android Studio so your demo looks polished and employer‑ready?
