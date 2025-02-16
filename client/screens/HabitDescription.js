import { useState, useContext, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Dialog, Portal, Button } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function HabitDescriptionScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { username, userId, habitId, token } = userContext || {};
  console.log("UserContext:", userContext);
  console.log("Username: ", username);
  console.log("UserId: ", userId);
  console.log("HabitId: ", habitId);
  console.log("Token: ", token);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  // const showDialog = (message, callback = null) => {
  //   setDialogMessage(message);
  //   setShowDialog(true);
  //   if (callback) {
  //     setTimeout(() => {
  //       callback();
  //     }, 1000);
  //   }
  // };

  const [descriptionInput, setDescriptionInput] = useState("");

  const checkDuplication = async () => {
    console.log(`Checking for existing description....`);

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}/${habitId}/get-detailed-habit`,
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
      console.log("Habit ID: ", data.descriptions[0]._id);

      if (!response.ok) {
        console.error("Error fetching description:", data.message);
        return false;
      }

      if (
        data.updatedHabit &&
        data.updatedHabit.description &&
        data.updatedHabit.description.trim().length > 0
      ) {
        console.log(
          "User already has a description:",
          data.updatedHabit.description
        );
        showDialog("You already have a description.", () => {
          setShowDialog(false);
          navigation.navigate("TeamInviteScreen");
        });
        return true;
      } else {
        console.log("No existing descriptions found.");
        return false;
      }
    } catch (error) {
      console.error("Error checking habit duplication:", error);
      return false;
    }
  };
  useEffect(() => {
    console.log("Looking for duplicates");
    const checkForExistingDescription = async () => {
      const isDuplicate = await checkDuplication();
      if (isDuplicate) {
        console.log("Navigating to TeamInviteScreen...");
        navigation.navigate("TeamInviteScreen");
      }
    };

    checkForExistingDescription();
  }, []);

  const saveDescription = async () => {
    console.log(`I'm ready to save description!`);
    console.log("Habit Description:", descriptionInput);
    console.log("Habit ID:", habitId);

    if (!descriptionInput.trim())
      return showDialog("You must enter a description.");
    if (!username) return showDialog("Failed to find user.");

    try {
      console.log("Ready to fetch data");
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}/${habitId}/edit-detailed-habit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ description: descriptionInput }),
        }
      );

      const data = await response.json();
      console.log("Data: ", data);

      if (response.ok) {
        // await AsyncStorage.setItem("habitId", data.habitId);
        // await AsyncStorage.setItem("userId", data.userId);
        // console.log("Storing Habit Id:", data.habitId);
        // console.log("Storing User Id:", data.userId);

        setUserContext(data);
        console.log(userContext);
        showDialog("Description created successfully!");
        console.log("Description saved successfully:", data);
        setDescriptionInput("");
        navigation.navigate("TeamInviteScreen");
      } else {
        console.error("Failed to save description:", data.message);
      }
    } catch (error) {
      console.error("Error saving habit description:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDialog(false)}
              labelStyle={styles.dialogButton}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Habit Description</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Describe yourself succesfully implementing the habit..."
            maxLength={500}
            value={descriptionInput ?? ""}
            onChangeText={setDescriptionInput}
            textAlignVertical="top"
            textAlign="left"
            multiline={true}
          />
          <Text style={styles.charCount}>{descriptionInput.length}/500</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("CreateHabitScreen")}>
            <Text style={styles.buttonText}>◀ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveDescription}>
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
    paddingHorizontal: wp("5%"),
  },
  body: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
  },
  bodyTitleContainer: {
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  bodyTitleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlignVertical: "top",
    position: "relative",
  },
  input: {
    height: 80,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    paddingTop: 0,
    lineHeight: 50,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    width: "100%",
    textAlignVertical: "top",
  },
  charCount: {
    paddingTop: 5,
    textAlign: "right",
    color: "gray",
    fontSize: 12,
    alignSelf: "flex-end",
    position: "absolute",
    right: 10,
    bottom: 20,
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
