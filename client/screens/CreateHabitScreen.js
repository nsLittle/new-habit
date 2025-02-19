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
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function CreateHabitScreen() {
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

  const [habitInput, setHabitInput] = useState("");
  const [habitData, setHabitData] = useState({ habits: [] });

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  const fetchUserData = async () => {
    try {
      if (!token) throw new Error("Authentication token is missing.");

      const [userResponse, habitsResponse, teamMemberResponse] =
        await Promise.all([
          fetch(`http://192.168.1.174:8000/user/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/habit/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/teammember/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member data.");

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const fetchedHabitData = await habitsResponse.json();
      setHabitData(fetchedHabitData);
      const teamMemberData = await teamMemberResponse.json();
      const habitValue = habitData.habits[0].habit;
      console.log("User Data: ", userData);
      console.log("Habit Data: ", habitData);
      console.log("Set Habit Data: ", setHabitData);
      console.log("Team Member Data: ", teamMemberData);
      console.log("Habit Value: ", habitValue);

      setProfileData((prev) => ({
        ...prev,
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        profilePic: userData?.profilePic || "",
        email: userData?.email || "",
        habits: habitData?.habits || [],
        teammembers: [...teamMemberData?.teamMembers] || [],
      }));

      console.log("Profile Data: ", profileData);
      console.log("User First Name; ", profileData.firstName);
      console.log("Teammembers: ", profileData.teammembers);
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

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

      if (!response.ok) {
        console.error("Failed to fetch habit.");
        return false;
      }

      const data = await response.json();
      console.log("Data: ", data);
      console.log("Habit: ", data.habits[0].habit);
      setHabitInput(data.habits[0].habit);
      console.log("Habit Completed?: ", data.habits[0].completed);

      if (data.habits[0].completed === false) {
        console.log("Habit found:", data.habits[0].habit);
        setDialogMessage("ARE YOU SURE YOU WANT TO EDIT YOUR HABIT?");
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error checking habit duplication:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkForExistingHabit = async () => {
      const isDuplicate = await checkDuplication();
      console.log("Checking for pre-existing habit...");
    };

    checkForExistingHabit();
  }, []);

  const saveHabit = async () => {
    console.log(`Attempting to save habit.`);
    console.log("Habit Input:", habitInput);

    if (!habitInput.trim()) {
      setDialogMessage("You must enter a habit.");
      setShowDialog(true);
      return;
    }
    if (!username) {
      setDialogMessage("Failed to find user.");
      setShowDialog(true);
      return;
    }

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

      if (!response.ok) throw new Error("Failed to fetch existing habits.");

      const data = await response.json();
      const existingHabit = data.habits.find(
        (habit_input) => habit_input.completed === false
      );

      if (existingHabit) {
        console.log("Existing Habit:", existingHabit.habit);
        console.log("Completed Status:", existingHabit.completed);
        console.log("Habit Id: ", existingHabit._id);
        const habitId = existingHabit._id;
        console.log("Set Habit Id:", habitId);

        if (existingHabit.habit === habitInput) {
          console.log("Habit is unchanged. No need to update.");
          setDialogMessage("No changes detected.");
          setShowDialog(true);
          return;
        }

        if (!existingHabit.completed) {
          console.log("Updating existing habit...");

          const updateResponse = await fetch(
            `http://192.168.1.174:8000/habit/${username}/${habitId}/habit`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                habit: habitInput,
              }),
            }
          );

          if (!updateResponse.ok)
            throw new Error("Failed to update the habit.");

          const updatedData = await updateResponse.json();
          console.log("Updated Habit:", updatedData);

          setDialogMessage("Habit updated successfully!");
          setShowDialog(true);
          setHabitInput("");
          navigation.navigate("HabitDescriptionScreen");
        }
      }

      console.log("Creating a new habit...");

      const createResponse = await fetch(
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

      if (!createResponse.ok) throw new Error("Failed to create a new habit.");

      const newData = await createResponse.json();
      console.log("New Habit Created:", newData);

      setUserContext((prev) => ({
        ...prev,
        habits: newData?.habit || "",
      }));

      setDialogMessage("Habit created successfully!");
      setShowDialog(true);
      setHabitInput("");

      navigation.navigate("HabitDescriptionScreen");
    } catch (error) {
      console.error("Error saving habit:", error);
      setDialogMessage("Could not save habit.");
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
            maxLength={50}
            value={habitInput}
            onChangeText={setHabitInput}
          />
          <Text style={styles.charCount}>{habitInput.length}/50</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("HabitDescriptionScreen")}>
            <Text style={styles.buttonText}>Keep Habit ▶</Text>
          </TouchableOpacity>
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
