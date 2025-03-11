import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function CreateHabitScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userIdContext,
    userNameContext,
    firstNameContext,
    lastNameContext,
    emailContext,
    profilePicContext,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    teamMemberContextId,
    token,
  } = userContext || {};

  useEffect(() => {
    if (!userContext) {
      console.error("UserContext is NULL in CreateHabitScreen!");
    } else {
      console.log("UserContext in CreateHabitScreen:", userContext);
    }
  }, []);

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Id Context: ", userIdContext);
      console.log("UserName Context: ", userNameContext);
      console.log("First Name Context: ", firstNameContext);
      console.log("Last Name Context: ", lastNameContext);
      console.log("Email Context: ", emailContext);
      console.log("Profile Pic Context: ", profilePicContext);
      console.log("Habit Id Context: ", habitContextId);
      console.log("Habit Input Context: ", habitContextInput);
      console.log("Description Input Context: ", descriptionContextInput);
      console.log("TeamMember Id Context: ", teamMemberContextId);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [habitInput, setHabitInput] = useState("");
  const [existingHabit, setExistingHabit] = useState("");

  useEffect(() => {
    const checkForExistingHabit = async () => {
      console.log(`Checking for existing habit...`);

      try {
        const response = await fetch(
          `https://new-habit-69tm.onrender.com/habit/${userNameContext}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing habit found.");
          setHabitInput("");
          setExistingHabit("");
          return false;
        }

        const data = await response.json();
        console.log("Data: ", data);
        const incompleteHabit = data.habits.find((habit) => !habit.completed);

        if (incompleteHabit) {
          console.log(
            "Existing Incomplete Habit Found:",
            incompleteHabit.habit
          );
          console.log("Existing Habit ID Found:", incompleteHabit._id);
          setHabitInput(incompleteHabit.habit);
          setExistingHabit(incompleteHabit.habit);
          setDialogMessage("Do you want to edit your existing habit?");

          setUserContext((prevContext) => ({
            ...prevContext,
            habitContextId: incompleteHabit._id,
            habitContextInput: incompleteHabit.habit,
          }));

          setShowDialog(true);
        }
      } catch (error) {
        console.error("Error checking existing habit:", error);
      }
    };
    checkForExistingHabit();
  }, []);

  const saveHabit = async () => {
    console.log(`Attempting to save habit.`);
    console.log("Habit Input:", habitInput);
    console.log("Existing Habit: ", existingHabit);
    console.log("User Id:", userIdContext);
    console.log("Habit Id:", habitContextId);
    console.log("Username: ", userNameContext);

    if (!habitInput.trim()) {
      setDialogMessage("You must enter a habit.");
      setShowDialog(true);
      return;
    }

    if (!userNameContext) {
      setDialogMessage("Failed to find user.");
      setShowDialog(true);
      return;
    }

    try {
      let response;
      let url;
      let method;

      if (
        !habitContextId ||
        (Array.isArray(habitContextId) && habitContextId.length === 0)
      ) {
        url = `http://192.168.1.174:8000/habit/${userNameContext}`;
        method = "POST";
      } else {
        url = `http://192.168.1.174:8000/habit/${userNameContext}/${habitContextId}/habit`;
        method = "PATCH";
      }

      console.log(`Sending ${method} request to:`, url);

      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ habit: habitInput, userId: userIdContext }),
      });

      if (!response.ok)
        throw new Error(
          `Failed to ${habitContextId ? "update" : "create"} habit.`
        );

      const responseData = await response.json();
      console.log("Response Data: ", responseData);
      console.log("Habit Input: ", responseData.habit);
      console.log("Habit Id: ", responseData.habitId);

      setUserContext((prevContext) => {
        const updatedContext = {
          ...prevContext,
          habitContextId: responseData.habitId,
          habitContextInput: responseData.habit,
        };
        console.log("Updated UserContext: ", updatedContext);
        return updatedContext;
      });

      setHabitInput("");
      setDialogMessage("Habit successfully saved");
      setShowDialog(true);

      setTimeout(() => {
        setShowDialog(false);
        navigation.navigate("HabitDescriptionScreen");
      }, 500);
    } catch (error) {
      console.error(
        `Error ${habitContextId ? "updating" : "creating"} habit:`,
        error
      );
      setDialogMessage(
        `Error ${
          habitContextId ? "updating" : "creating"
        } habit. Please try again.`
      );
      setShowDialog(true);
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
        <Text style={styles.bodyTitleText}>
          What is the habit you want to practice?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={habitInput ? habitInput : "I want to become a..."}
            maxLength={100}
            value={habitInput}
            onChangeText={setHabitInput}
          />
          <Text style={styles.charCount}>{habitInput.length}/50</Text>
        </View>

        <View style={styles.buttonRow}>
          {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("HabitDescriptionScreen")}>
            <Text style={styles.buttonText}>Keep Habit ▶</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.saveButton} onPress={saveHabit}>
            <Text style={styles.buttonText}>Save Changes ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 50,
  },
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
