import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";

export default function ParentGate() {
  const [input, setInput] = useState("");
  const [correctPin, setCorrectPin] = useState(generateRandomPin());  // Store the correct PIN dynamically
  const router = useRouter();

  // Function to generate a random 3-digit PIN
  function generateRandomPin() {
    let pin = "";
    for (let i = 0; i < 3; i++) {
      pin += Math.floor(Math.random() * 10); // Generate a random digit between 0-9
    }
    return pin;
  }

  const handleDigitPress = (digit: string) => {
    if (input.length < 3) {
      const newInput = input + digit;
      setInput(newInput);

      if (newInput.length === 3) {
        if (newInput === correctPin) {
          router.replace("/CalendarTrackingPage");
        } else {
          alert("Incorrect PIN!");
          router.replace("/profile");
        }
      }
    }
  };

  const handleClear = () => {
    setInput(input.slice(0, -1));
  };

  // Effect to regenerate PIN every time the component is mounted
  useEffect(() => {
    setCorrectPin(generateRandomPin());
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View style={styles.leftSection}>
        <Text style={styles.title}>Enter Digits:</Text>
        {/* Ensure correctPin is a string and render it properly */}
        <Text style={styles.hint}>{correctPin.split('').join(' ')}</Text>
        <Text style={styles.parentsOnly}>Parents only...</Text>
        <Image 
          source={require('../assets/images/lock-icon.png')} 
          style={styles.lockImage} 
        />
        <View style={styles.inputBoxes}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.inputBox}>
              <Text style={styles.inputText}>{input[i] || "_"}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* RIGHT SIDE */}
      <View style={styles.rightSection}>
        <View style={styles.numpadContainer}>
          {/* Column 1 */}
          <View style={styles.column}>
            {["1", "4", "7", "0"].map((digit) => (
              <Pressable key={digit} style={styles.button} onPress={() => handleDigitPress(digit)}>
                <Text style={styles.buttonText}>{digit}</Text>
              </Pressable>
            ))}
          </View>
          {/* Column 2 */}
          <View style={styles.column}>
            {["2", "5", "8"].map((digit) => (
              <Pressable key={digit} style={styles.button} onPress={() => handleDigitPress(digit)}>
                <Text style={styles.buttonText}>{digit}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.button, styles.backspace]} onPress={handleClear}>
              <Text style={styles.buttonText}>⌫</Text>
            </Pressable>
          </View>
          {/* Column 3 */}
          <View style={styles.column}>
            {["3", "6", "9"].map((digit) => (
              <Pressable key={digit} style={styles.button} onPress={() => handleDigitPress(digit)}>
                <Text style={styles.buttonText}>{digit}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.button, styles.backspace]} onPress={handleClear}>
              <Text style={styles.buttonText}>⌫</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
  },
  leftSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  rightSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  hint: {
    fontSize: 20,
    color: "#6B7280",
    marginBottom: 5,
  },
  parentsOnly: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#9CA3AF",
    marginBottom: 10,
  },
  lockImage: {
    width: 120,
    height: 100,
    marginBottom: 15,
  },
  inputBoxes: {
    flexDirection: "row",
    gap: 10,
  },
  inputBox: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  inputText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  numpadContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    marginHorizontal: 5,
  },
  button: {
    width: 60,
    height: 60,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  backspace: {
    backgroundColor: "#FF6F61",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
