import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth"; // <-- Import these

const Start = ({ navigation }) => {
  const [name, setName] = useState(""); // State for user input
  const [backgroundColor, setBackgroundColor] = useState("#090C08"); // Default background color
  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];
  const auth = getAuth(); // <-- Initialize Auth

  // Function for anonymous sign-in and navigation
  const handleStartChatting = () => {
    signInAnonymously(auth)
      .then(result => {
        navigation.navigate("Chat", {
          userID: result.user.uid,
          name: name || "User",
          backgroundColor,
        });
      })
      .catch((error) => {
        Alert.alert("Unable to sign in, try again.");
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/background-image.png")}
          style={styles.background}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Let's Chat!</Text>
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter Your Name"
                placeholderTextColor="#757083"
              />
              <Text style={styles.colorText}>Choose Background Color:</Text>
              <View style={styles.colorContainer}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      backgroundColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setBackgroundColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={handleStartChatting} // <-- Use new handler
              >
                <Text style={styles.buttonText}>Start Chatting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
};

/* Stylesheet for Start Component */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: "20%",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inputContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "88%",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#757083",
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "300",
    color: "#222",
    // opacity removed for darker text
  },
  colorText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25, // Makes the button circular
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#757083", // Highlights selected color
  },
  button: {
    backgroundColor: "#757083",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Start;