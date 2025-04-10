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
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function HabitDescriptionScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userIdContext,
    userNameContext,
    firstNameContext,
    emailContext,
    profilePicContext,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    teamMemberContextId,
    token,
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const [descriptionInput, setDescriptionInput] = useState("");
  const [existingDescription, setExistingDescription] = useState("");
  const [incompleteHabit, setIncompleteHabit] = useState(null);

  useEffect(() => {
    const checkForExistingDescription = async () => {
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
          setDescriptionInput("");
          setExistingDescription("");
          setIncompleteHabit(null);
          return false;
        }

        const data = await response.json();
        const incompleteHabit = data.habits.find((habit) => !habit.completed);

        if (incompleteHabit && incompleteHabit.description?.trim()) {
          setDescriptionInput(incompleteHabit.description);
          setExistingDescription(incompleteHabit.description);
          setIncompleteHabit(incompleteHabit);
          setUserContext((prevContext) => ({
            ...prevContext,
            habitContextId: incompleteHabit._id,
            habitContextInput: incompleteHabit.habit,
          }));

          // if (incompleteHabit.description.trim().length > 0) {
          //   setDialogMessage("Do you want to edit your existing description?");
          //   setDialogAction("editOrSkip");
          //   setShowDialog(true);

          //   setTimeout(() => {
          //     setShowDialog(false);
          //   }, 10000);
          // }
        }
      } catch (error) {
        console.error("Error checking existing description:", error);
      }
    };
    checkForExistingDescription();
  }, []);

  const saveDescription = async () => {
    if (!descriptionInput.trim()) {
      setDialogMessage("You must enter a description.");
      setShowDialog(true);
      return;
    }

    if (!userNameContext) {
      setDialogMessage("Failed to find user.");
      setShowDialog(true);
      return;
    }

    if (descriptionInput === existingDescription) {
      setDialogMessage(
        "No edits were made.\n\nTo keep description as is, press YES.\nOtherwise, press NO."
      );
      setDialogAction("confirmNavigate");
      setShowDialog(true);
      return;
    }

    try {
      let response;
      let url = `${BASE_URL}/habit/${userNameContext}/${habitContextId}/description`;
      let method = "PATCH";

      if (habitContextId) {
        url = `${BASE_URL}/habit/${userNameContext}/${habitContextId}/description`;
        method = "PATCH";
      }

      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: descriptionInput,
          userId: userIdContext,
        }),
      });

      const responseData = await response.json();

      if (!response.ok)
        throw new Error(
          `Failed to ${habitContextId ? "update" : "create"} habit.`
        );

      setUserContext((prevContext) => ({
        ...prevContext,
        ...prevContext,
        habitContextId: responseData.habitId ?? prevContext.habitContextId,
        descriptionContextInput: descriptionInput,
      }));

      setDialogMessage("Description successfully saved");
      setDialogAction("successfulUpdate");
      setShowDialog(true);

      setTimeout(() => {
        setShowDialog(false);
        navigation.navigate("CadenceScreen");
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
          style={styles.dialog}>
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
                  onPress={() => {
                    setShowDialog(false);
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  NO
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("CadenceScreen");
                  }}
                  labelStyle={sharedStyles.dialogButtonConfirm}>
                  YES
                </Button>
              </>
            ) : dialogAction === "editOrSkip" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("CadenceScreen");
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  NO
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                  }}
                  labelStyle={sharedStyles.dialogButtonConfirm}>
                  YES
                </Button>
              </>
            ) : (
              <Button
                onPress={() => {
                  setShowDialog(false);
                  if (dialogAction === "navigate") {
                    navigation.navigate("CadenceScreen");
                  }
                }}
                labelStyle={sharedStyles.dialogButtonConfirm}>
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>
            What habit will you strengthen to achieve your goal?
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[sharedStyles.input, { height: 200 }]}
            placeholder="I will...(SMART goal)"
            maxLength={500}
            value={descriptionInput ?? ""}
            onChangeText={setDescriptionInput}
            textAlignVertical="top"
            textAlign="left"
            multiline={true}
          />
          <Text style={sharedStyles.charCount}>
            {descriptionInput?.length || 0}/500
          </Text>
        </View>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={saveDescription}>
            <Text style={sharedStyles.buttonText}>Save ▶</Text>
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
  bodyTitleContainer: {
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    width: "85%",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlignVertical: "top",
    position: "relative",
  },
});
