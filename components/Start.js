import { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Start = ({ navigation }) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState();
  const colorOptions = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  return (
    <ImageBackground
      style={styles.bgImage}
      source={require("../assets/background-image.png")}
      resizeMode="cover"
    >
      <Text style={styles.title}>Let's Chat!</Text>
      {/* Container with white background. Every elements are wrapped 
      inside separate containers for better responsive behavior*/}
      <View style={styles.container}>
        {/* Container for the input field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />
        </View>
        {/* Container for the color selection */}
        <View style={styles.colorContainer}>
          <Text style={styles.colorText}>Choose Background Color</Text>
          <View style={styles.colorButtonContainer}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={`color-button__${color}`}
                title="Got to Screen 2"
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && {
                    borderWidth: 2,
                    borderColor: "#757083",
                  },
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>
        {/* Container for the "Start Chatting" button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("Chat", {
                name: name,
                backgroundColor: selectedColor,
              })
            }
          >
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#ffffff",
    height: "40%",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "88%",
    height: "44%",
    backgroundColor: "#ffffff",
  },
  inputContainer: {
    flex: 3,
    width: "88%",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 1,
  },
  colorContainer: {
    flex: 5,
    width: "88%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  colorText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 1,
    marginBottom: 20,
  },
  colorButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonContainer: {
    flex: 3,
    width: "88%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 20,
    backgroundColor: "#757083",
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#ffffff",
  },
});

export default Start;