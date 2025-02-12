import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Portal, Dialog, Button } from "react-native-paper";
import { UserContext } from "../context/UserContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const [habitInput, setHabitInput] = useState("");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const showDialog = (message, callback = null) => {
    setDialogMessage(message);
    setDialogVisible(true);

    if (callback) {
      setTimeout(() => {
        callback();
      }, 1000);
    }
  };

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { username, userId, token } = userContext || {};
  console.log("UserContext:", userContext);
  console.log("Username: ", username);
  console.log("UserId: ", userId);
  console.log("Token: ", token);

  const checkDuplication = async () => {
    console.log(`Checking for existing habit...`);

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Got Data: ", data);
      console.log("Data.habit: ", data.habit);

      if (response.ok && data.habits && data.habits.length > 0) {
        console.log("User already has a habit.", data);
        showDialog("You already have a habit.", () => {
          setDialogVisible(false);
          navigation.navigate("HabitDescriptionScreen");
        });
        return true;
      } else {
        console.log("No existing habits found.");
        return false;
      }
    } catch (error) {
      console.error("Error checking habit duplication:", error);
    }
  };

  useEffect(() => {
    const checkForExistingHabit = async () => {
      const isDuplicate = await checkDuplication();
      if (isDuplicate) {
        navigation.navigate("HabitDescriptionScreen");
      }
    };

    checkForExistingHabit();
  }, []);

  const saveHabit = async () => {
    console.log(`Attempting to save habit.`);
    console.log("Habit Input:", habitInput);

    if (!habitInput.trim()) return showDialog("You must enter a habit.");
    if (!username) return showDialog("Failed to find user.");

    const isDuplicate = await checkDuplication();
    if (isDuplicate) {
      showDialog("You already have a habit.");
      navigation.navigate("HabitDescriptionScreen");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            habit: habitInput,
            userId: userId,
          }),
        }
      );

      const data = await response.json();
      console.log("Data: ", data);
      if (!response.ok)
        throw new Error(data.message || "Failed to save the habit.");

      await AsyncStorage.setItem("habitId", data.habitId);
      await AsyncStorage.setItem("userId", data.userId);
      console.log("Storing Habit Id:", data.habitId);
      console.log("Storing User Id:", data.userId);

      setUserContext((prev) => ({
        ...prev,
        habitId: data.habitId,
        userId: data.userId ?? prev.userId,
      }));

      showDialog("Habit created successfully!");
      setHabitInput("");

      navigation.navigate("HabitDescriptionScreen", {
        username,
        habitId: data.habitId,
        userId: data.userId,
      });
    } catch (error) {
      console.error("Error saving habit:", error);
      showDialog("Could not save habit.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
              labelStyle={styles.dialogButton}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <Text style={styles.bodyTitleText}>
          What is the habit you want to practice?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="I want to become a..."
            maxLength={50}
            value={habitInput ?? ""}
            onChangeText={setHabitInput}
          />
          <Text style={styles.charCount}>{habitInput.length}/50</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("WelcomeScreen")}>
            <Text style={styles.buttonText}>◀ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveHabit}>
            <Text style={styles.buttonText}>Save ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: wp("80%"),
    paddingVertical: hp("5%"),
  },
  bodyTitleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  charCount: {
    paddingTop: 5,
    textAlign: "right",
    color: "gray",
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 15,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
  profilePicMain: {
    borderWidth: 2,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
  dialog: {
    backgroundColor: "white",
  },
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
});
