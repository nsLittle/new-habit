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

export default function HabitDescriptionScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { username, userId, habitId, teammemberId, firstName, token } =
    userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [descriptionInput, setDescriptionInput] = useState("");
  const [existingDescription, setExistingDescription] = useState("");

  useEffect(() => {
    const checkForExistingDescription = async () => {
      console.log(`Checking for existing description...`);

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

        if (!response.ok) {
          console.error("No existing habit found.");
          setDescriptionInput("");
          setExistingDescription("");
          return false;
        }

        const data = await response.json();
        const existingDescription = data.habits[0]?.description || "";

        if (existingDescription) {
          console.log("Existing Description Found:", existingDescription);
          setDescriptionInput(existingDescription);
          setExistingDescription(existingDescription);
          setDialogMessage(
            "ARE YOU SURE YOU WANT TO EDIT YOUR DESCRIPTION?\n\nPress 'Keep Description' if you want to retain your current habit."
          );
          setShowDialog(true);
        }
      } catch (error) {
        console.error("Error checking existing description:", error);
      }
    };
    checkForExistingDescription();
  }, []);

  const saveDescription = async () => {
    console.log(`Attempting to save description.`);
    console.log("Description Input:", descriptionInput);
    console.log("Existing description: ", existingDescription);
    console.log("User Id:", userId);
    console.log("Habit Id:", habitId);
    console.log("Username: ", username);

    if (!descriptionInput.trim()) {
      setDialogMessage("You must enter a description.");
      setShowDialog(true);
      return;
    }

    if (!username) {
      setDialogMessage("Failed to find user.");
      setShowDialog(true);
      return;
    }

    if (descriptionInput === existingDescription) {
      setDialogMessage(
        "No edits were made; are you sure?\n\nTo Keep Description as is, press 'Keep Description'."
      );
      setShowDialog(true);
      return;
    }

    try {
      let response;
      let url;
      let method;

      if (habitId) {
        url = `http://192.168.1.174:8000/habit/${username}/${habitId}/description`;
        method = "PATCH";
      } else {
        // url = `http://192.168.1.174:8000/habit/${username}`;
        // method = "POST";
        // if there is no habitId, we must go back to CreateHabit to create a habit first so that a habitId can be generated
      }

      console.log(`Sending ${method} request to:`, url);

      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: descriptionInput, userId: userId }),
      });

      console.log(`Response Status: ${response.status}`);
      const responseData = await response.json();
      console.log("Response Data: ", responseData);

      if (!response.ok)
        throw new Error(`Failed to ${habitId ? "update" : "create"} habit.`);

      setUserContext((prevContext) => ({
        ...prevContext,
        habitId: responseData.habitId || habitId,
        descriptionInput: descriptionInput,
      }));

      console.log("Updated UserContext:", userContext); // Debugging

      setDialogMessage("Description successfully saved");
      setShowDialog(true);

      setTimeout(() => {
        setShowDialog(false);
        navigation.navigate("TeamInviteScreen");
      }, 500);
    } catch (error) {
      console.error(`Error ${habitId ? "updating" : "creating"} habit:`, error);
      setDialogMessage(
        `Error ${habitId ? "updating" : "creating"} habit. Please try again.`
      );
      setShowDialog(true);
    }
  };

  // const checkDuplication = async () => {
  //   console.log(`Checking for existing description...`);

  //   try {
  //     const response = await fetch(
  //       `http://192.168.1.174:8000/habit/${username}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       console.error("Failed to fetch description.");
  //       return false;
  //     }

  //     const data = await response.json();
  //     const habitId = data.habits[0]?._id;
  //     console.log("Data: ", data);
  //     console.log("Habit Id: ", data.habits[0]?._id);
  //     console.log("Habit Id: ", habitId);
  //     console.log("Habit: ", data.habits[0]?.habit);
  //     console.log("Description: ", data.habits[0]?.description);
  //     console.log("Habit Completed?: ", data.habits[0].completed);
  //     console.log("WHAT IS MY DESCRIPTION???");
  //     setUserContext((prev) => ({
  //       ...prev,
  //       habitId, // Update UserContext with new habitId
  //     }));
  //     setDescriptionInput(data.habits[0]?.description);
  //     console.log("Stuff: ", data.habits[0]?.description);
  //     console.log("Description Input: ", descriptionInput);

  //     if (data.habits[0].description) {
  //       console.log("Description found:", data.habits[0].description);
  //       setDialogMessage("ARE YOU SURE YOU WANT TO EDIT YOUR DESCRIPTION?");
  //       setShowDialog(true);
  //     }
  //   } catch (error) {
  //     console.error("Error checking description duplication:", error);
  //     return false;
  //   }
  // };

  // useEffect(() => {
  //   const checkForexistingDescription = async () => {
  //     const isDuplicate = await checkDuplication();
  //     console.log("Checking for pre-existing habit...");
  //   };

  //   checkForexistingDescription();
  // }, []);

  // const saveDescription = async () => {
  //   console.log(`Attempting to save description.`);
  //   console.log("Habit Description:", descriptionInput);

  //   if (!descriptionInput.trim()) {
  //     setDialogMessage("You must enter a description.");
  //     setShowDialog(true);
  //     return;
  //   }
  //   if (!username) {
  //     setDialogMessage("Failed to find user.");
  //     setShowDialog(true);
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       `http://192.168.1.174:8000/habit/${username}/${habitId}/description`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           description: descriptionInput,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       setDialogMessage(
  //         `Error ${habitId ? "updating" : "creating"} habit. Please try again.`
  //       );
  //       setShowDialog(true);
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log("Data: ", data);
  //     const existingDescription = data.updatedHabit;

  //     if (existingDescription) {
  //       console.log("Existing Description:", existingDescription);
  //       console.log("Completed Status:", existingDescription.completed);
  //       console.log("Habit Id: ", existingDescription._id);
  //       const habitId = existingDescription._id;
  //       console.log("Set Habit Id:", habitId);

  //       if (existingDescription.habit === descriptionInput) {
  //         console.log("Desription is unchanged. No need to update.");
  //         setDialogMessage("No changes detected.");
  //         setShowDialog(true);
  //         return;
  //       }

  //       if (!existingDescription.completed) {
  //         console.log("Updating existing description...");

  //         const updateResponse = await fetch(
  //           `http://192.168.1.174:8000/habit/${username}/${habitId}/description`,
  //           {
  //             method: "PATCH",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${token}`,
  //             },
  //             body: JSON.stringify({
  //               description: descriptionInput,
  //             }),
  //           }
  //         );

  //         if (!updateResponse.ok)
  //           throw new Error("Failed to update the habit.");

  //         const updatedData = await updateResponse.json();
  //         console.log("Updated Description:", updatedData);

  //         setDialogMessage("Description updated successfully!");
  //         setShowDialog(true);
  //         setDescriptionInput("");
  //         navigation.navigate("TeamInviteScreen");
  //       }
  //     }

  //     console.log("Creating a new description...");

  //     const createResponse = await fetch(
  //       `http://192.168.1.174:8000/habit/${username}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           habit: habitDescription,
  //           userId: userId,
  //         }),
  //       }
  //     );

  //     if (!createResponse.ok) throw new Error("Failed to create a new habit.");

  //     const newData = await createResponse.json();
  //     console.log("New Description Created:", newData);
  //     setDialogMessage("Description created successfully!");
  //     setShowDialog(true);
  //     setDescriptionInput("");

  //     navigation.navigate("HabitDescriptionScreen");
  //   } catch (error) {
  //     console.error("Error saving description:", error);
  //     setDialogMessage("Could not save description.");
  //     setShowDialog(true);
  //   }
  // };

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
          <Text style={styles.charCount}>
            {descriptionInput?.length || 0}/500
          </Text>
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
