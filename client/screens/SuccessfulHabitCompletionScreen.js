import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function SuccessfulHabitCompletionScreen() {
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
    habitContextEndDate,
    descriptionContextInput,
    teamMemberContextId,
    token,
  } = userContext || {};

  // useEffect(() => {
  //   if (userContext) {
  //     console.log("UserContext:", userContext);
  //     console.log("User Id Context: ", userIdContext);
  //     console.log("UserName Context: ", userNameContext);
  //     console.log("First Name Context: ", firstNameContext);
  //     console.log("Last Name Context: ", lastNameContext);
  //     console.log("Email Context: ", emailContext);
  //     console.log("Profile Pic Context: ", profilePicContext);
  //     console.log("Habit Id Context: ", habitContextId);
  //     console.log("Habit Input Context: ", habitContextInput);
  //     console.log("Habit End Date Context: ", habitContextEndDate);
  //     console.log("Description Input Context: ", descriptionContextInput);
  //     console.log("TeamMember Id Context: ", teamMemberContextId);
  //     console.log("Token: ", token);
  //   }
  // }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Confirm</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage || "Are you sure?"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogAction === "confirmNavigate" ? (
              <>
                <Button
                  onPress={() => setShowDialog(false)}
                  labelStyle={styles.dialogButtonNo}>
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
      <View style={styles.body}>
        <Text style={styles.bodyTitleText}>SUCCESS!!!</Text>
        <Text style={styles.bodyTitleText}>
          Your habit is now a part of your life
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate("LogoutScreen")}>
            <Text style={styles.saveButtonText}>Logout</Text>
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
  dialog: {
    backgroundColor: "white",
  },
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButtonNo: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
  },
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp("10%"),
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
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
