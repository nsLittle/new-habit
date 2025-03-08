import { useContext, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function TeamInviteScreen() {
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

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Id Context: ", userIdContext);
      console.log("UserName Context: ", userNameContext);
      console.log("First Name Context: ", firstNameContext);
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

  const [contactData, setContactData] = useState({ teammembers: [] });

  useEffect(() => {
    console.log("I'm here to fetch team member data...");

    const fetchTeamMembersData = async () => {
      try {
        if (!token || !userNameContext) return;

        const response = await fetch(
          `http://192.168.1.174:8000/teammember/${userNameContext}`,
          {
            headers: {
              "Content-Type": `application/json`,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(
            `Failed to fetch team data. Status: ${response.status}`
          );

        const data = await response.json();
        console.log("Raw API Response:", data);

        const teammembers = Array.isArray(data.teamMembers)
          ? data.teamMembers.map((member) => ({
              teamMember_id: member._id,
              firstName: member.teamMemberFirstName,
              lastName: member.teamMemberLastName,
              profilePic: member.teamMemberProfilePic,
              email: member.teamMemberEmail,
            }))
          : [];

        setUserContext((prevContext) => ({
          ...prevContext,
          teammembers,
        }));

        console.log("Transformed team members:", teammembers);

        setDialogMessage("Teammember fetched.");
      } catch (err) {
        console.error("Error fetching teammembers.", err);
        setDialogMessage("Error fetching teammembers.");
      }
    };

    fetchTeamMembersData();
  }, [token, userNameContext]);

  const sendEmail = (email) => {
    if (!email) {
      console.error("No email address provided");
      setDialogMessage("No email address provided");
      setShowDialog(true);
      return;
    }

    const subject = encodeURIComponent(`Help ${firstNameContext}`);
    const requestUrl = "habit-app://feedback";
    const body = encodeURIComponent(
      `Hello,\n\nThis is ${firstNameContext}. I am working to ${habitinput}. I'd love your help by getting your feedback. Please go to ${requestUrl}`
    );

    const mailtoURL = `mailto:${emailContext}?subject=${subject}&body=${body}`;
    console.log("Mail To: ", mailtoURL);

    Linking.openURL(mailtoURL).catch((err) => {
      console.error("Failed to open email client", err);
      setDialogMessage("Failed to open email client.");
      setShowDialog(true);
    });
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
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Team Invite</Text>
        </View>

        <View style={styles.dataContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.addPersonButton,
                userContext.teammembers.length >= 10
                  ? { backgroundColor: "#D3D3D3" }
                  : {},
              ]}
              onPress={() => {
                if (userContext.teammembers.length < 10) {
                  console.log("Navigating to AddTeammemberScreen...");
                  navigation.navigate("AddTeammemberScreen");
                } else {
                  console.log("Max team members reached. Showing dialog...");
                  setDialogMessage(
                    "You cannot have more than 10 team members."
                  );
                  setShowDialog(true);
                }
              }}
              disabled={userContext.teammembers.length >= 10}>
              <Text style={styles.addPersonButtonText}>+ Add a person</Text>
            </TouchableOpacity>
          </View>

          {userContext.teammembers.map((teammember, index) => (
            <View style={styles.buttonContainer} key={index}>
              <TouchableOpacity style={styles.contactPersonButton}>
                {teammember.profilePic ? (
                  <Image
                    source={{ uri: teammember.profilePic }}
                    style={styles.profileImage}
                    onError={(error) =>
                      console.error("Image Load Error:", error?.nativeEvent)
                    }
                  />
                ) : (
                  <Text style={styles.profileData}>
                    No profile picture available.
                  </Text>
                )}
                <View style={styles.contactPersonNameColumn}>
                  <Text style={styles.contactName}>
                    {teammember.firstName} {teammember.lastName} {teammember.id}
                  </Text>
                  <Text style={styles.contactEmail}>{teammember.email}</Text>
                </View>
                <View style={styles.iconsColumn}>
                  <MaterialIcons
                    name="send"
                    size={24}
                    color="black"
                    style={styles.iconSend}
                    onPress={() => sendEmail(teammember.email)}
                  />
                  <MaterialIcons
                    name="edit"
                    size={24}
                    color="black"
                    style={styles.iconEdit}
                    onPress={() =>
                      navigation.push("EditTeammemberScreen", {
                        teamMember_id: teammember.teamMember_id,
                        firstName: teammember.firstName,
                        lastName: teammember.lastName,
                        email: teammember.email,
                        profilePic: teammember.profilePic,
                      })
                    }
                  />
                  <MaterialIcons
                    name="delete"
                    size={24}
                    color="black"
                    style={styles.iconDelete}
                    onPress={() => {
                      setDialogMessage(
                        "ARE YOU SURE YOU WANT TO DELETE YOUR TEAM MEMBER?"
                      );
                      console.log(`Delete contact: ${teammember}`);
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("HabitDescriptionScreen")}>
              <Text style={styles.backButtonText} title="Back">
                ◀ Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                contactData.teammembers.length < 3
                  ? { backgroundColor: "#D3D3D3" }
                  : {},
              ]}
              onPress={() => {
                console.log("Save button pressed...");
                if (userContext.teammembers.length < 3) {
                  setDialogMessage(
                    "You must have at least 3 team members to proceed with habit formation."
                  );
                  setShowDialog(true);
                  return;
                }
                navigation.navigate("CadenceScreen");
              }}>
              <Text style={styles.saveButtonText} title="Next">
                Save ▶
              </Text>
            </TouchableOpacity>
          </View>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingTop: Platform.OS === "web" ? hp("15%") : hp("2%"),
  },
  titleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  dataContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 50,
  },
  addPersonButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 25,
    marginBottom: 5,
    width: 350,
    height: 45,
    flexDirection: "row",
  },
  contactPersonButton: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 5,
    width: 350,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactPersonNameColumn: {
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "space-around",
  },
  contactEmail: {
    fontSize: 10,
    color: "gray",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconsColumn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
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
});
