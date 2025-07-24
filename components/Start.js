import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, ImageBackground, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState();
  const colorOptions = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  return (
    <ImageBackground
      style={styles.backgroundImage}
      source={require("../assets/background-image.png")}
      resizeMode="cover"
    >
      <Text style={styles.title}>Chat App</Text>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder='Your Name'
        />

        <Text style={styles.colorText}>Choose Background Color</Text>
        <TouchableOpacity style={styles.colorButtonContainer}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={`color-button__${color}`}
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
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { opacity: name ? 1 : 0.5 },
          ]}
          disabled={!name}
          onPress={() =>
            navigation.navigate("Chat", {
              name: name,
              backgroundColor: selectedColor,
            })
          }
        >
          <Text style={styles.buttonText}>Start Chatting</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "88%",
    height: "44%",
    backgroundColor: "#ffffff",
    alignSelf: "center",
    paddingVertical: 20,
  },
  textInput: {
    width: "88%",
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: "#FFF"
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 60,
    marginBottom: 20
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
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
    width: "88%",
    marginBottom: 30,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  button: {
    padding: 20,
    backgroundColor: "#757083",
    width: "88%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#ffffff",
  },
});

export default Start;
