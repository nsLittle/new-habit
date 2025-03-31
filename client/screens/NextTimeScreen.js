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
import { sharedStyles } from "../styles/sharedStyles";

export default function NextTimeScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    // userIdContext,
    // userNameContext,
    // firstNameContext,
    // lastNameContext,
    // emailContext,
    // profilePicContext,
    // habitContextId,
    // habitContextInput,
    // habitContextEndDate,
    // descriptionContextInput,
    // teamMemberContextId,
    // token,
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

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
                labelStyle={sharedStyles.dialogButtonConfirm}>
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={sharedStyles.body}>
        <Text style={sharedStyles.bodyText}>
          Better habit formation next time
        </Text>
        <Text style={sharedStyles.bodyText}>
          Forming a habit is a continuous process.
        </Text>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={() => navigation.navigate("LogoutScreen")}>
            <Text style={sharedStyles.buttonText}>Logout</Text>
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
});
