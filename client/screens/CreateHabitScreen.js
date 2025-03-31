import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

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
    // habitContextInput,
    // habitContextEndDate,
    // descriptionContextInput,
    // teamMemberContextId,
    token,
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const [habitInput, setHabitInput] = useState("");
  const [existingHabit, setExistingHabit] = useState("");
  const [incompleteHabit, setIncompleteHabit] = useState(null);

  useEffect(() => {
    const checkForExistingHabit = async () => {
      console.log(`Checking for existing habit...`);

      try {
        const response = await fetch(`${BASE_URL}/habit/${userNameContext}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("No existing habit found.");
          setHabitInput("");
          setExistingHabit("");
          return false;
        }

        const data = await response.json();
        const incompleteHabit = data.habits.find((habit) => !habit.completed);

        if (incompleteHabit) {
          setHabitInput(incompleteHabit.habit);
          setExistingHabit(incompleteHabit.habit);
          setIncompleteHabit(incompleteHabit);
          setUserContext((prevContext) => ({
            ...prevContext,
            habitContextId: incompleteHabit._id,
            habitContextInput: incompleteHabit.habit,
            habitContextEndDate: incompleteHabit.endDate,
          }));

          // if (incompleteHabit.habit.trim().length > 0) {
          //   setDialogMessage("Do you want to edit your existing habit?");
          //   setDialogAction("editOrSkip");
          //   setShowDialog(true);
          // }
        }
      } catch (error) {
        console.error("Error checking existing habit:", error);
      }
    };
    checkForExistingHabit();
  }, []);

  const saveHabit = async () => {
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

    if (habitInput === existingHabit) {
      setDialogMessage(
        "No edits were made.\n\nTo keep habit as is, press KEEP.\nOtherwise, press EDIT."
      );
      setDialogAction("confirmNavigate");
      setShowDialog(true);
      return;
    }

    try {
      let response;
      let url;
      let method;

      if (Array.isArray(habitContextId) && habitContextId.length === 0) {
        url = `${BASE_URL}/habit/${userNameContext}`;
        method = "POST";
      } else if (habitContextId) {
        url = `${BASE_URL}/habit/${userNameContext}/${habitContextId}/habit`;
        method = "PATCH";
      } else {
        url = `${BASE_URL}/habit/${userNameContext}`;
        method = "POST";
      }

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

      setUserContext((prevContext) => {
        const updatedContext = {
          ...prevContext,
          habitContextId: responseData.habitId,
          habitContextInput: responseData.habit,
        };
        return updatedContext;
      });

      setHabitInput("");
      setDialogMessage("Habit successfully saved");
      setDialogAction("success");
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
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={sharedStyles.dialog}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Confirm
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage || "Are you sure?"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogAction === "confirmNavigate" ? (
              <>
                <Button
                  onPress={() => setShowDialog(false)}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  EDIT
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("HabitDescriptionScreen");
                  }}
                  labelStyle={styles.dialogButton}>
                  KEEP
                </Button>
              </>
            ) : dialogAction === "editOrSkip" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("HabitDescriptionScreen");
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  NO
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    setDialogAction(null);
                  }}
                  labelStyle={styles.dialogButton}>
                  YES
                </Button>
              </>
            ) : dialogAction === "success" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("HabitDescriptionScreen");
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  OK
                </Button>
              </>
            ) : (
              <Button
                onPress={() => {
                  setShowDialog(false);
                  if (dialogAction === "navigate") {
                    navigation.navigate("HabitDescriptionScreen");
                  }
                }}
                labelStyle={styles.dialogButton}>
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <Text style={sharedStyles.title}>
          What is the habit you want to practice?
        </Text>

        <View style={sharedStyles.inputContainer}>
          <TextInput
            style={[sharedStyles.input, { height: 120 }]}
            placeholder={habitInput ? habitInput : "I want to become a..."}
            maxLength={100}
            value={habitInput}
            onChangeText={setHabitInput}
            multiline={true}
            textAlignVertical="top"
            numberOfLines={1}
          />
          <Text style={sharedStyles.charCount}>{habitInput.length}/50</Text>
        </View>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={saveHabit}>
            <Text style={sharedStyles.buttonText}>Save Changes ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
