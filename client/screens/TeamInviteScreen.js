import { useContext, useEffect, useState } from "react";
import {
  Image,
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
import { BASE_URL } from "../constants/config";
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

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);

  const [contactData, setContactData] = useState({ teamMembers: [] });

  useEffect(() => {
    const fetchTeamMembersData = async () => {
      try {
        if (!token || !userNameContext) return;

        const response = await fetch(
          `${BASE_URL}/teammember/${userNameContext}`,
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

        const teammembers = Array.isArray(data.teamMembers)
          ? data.teamMembers.map((member) => ({
              teamMember_id: member._id,
              firstName: member.teamMemberFirstName,
              lastName: member.teamMemberLastName,
              profilePic: member.teamMemberProfilePic,
              email: member.teamMemberEmail,
            }))
          : [];

        console.log("Fetched teammembers data:", data);
        setContactData({ teamMembers: teammembers || [] });
        setUserContext((prevContext) => ({
          ...prevContext,
          teammembers: teammembers || [],
        }));
      } catch (err) {
        console.error("Error fetching teammembers.", err);
        setDialogMessage("Error fetching teammembers.");
      }
    };

    fetchTeamMembersData();
  }, [token, userNameContext]);

  const handleDelete = async (teamMember_id) => {
    if (!token) {
      setDialogMessage("No authentication token found.");
      setShowDialog(true);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/teammember/${userNameContext}/${teamMember_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`);
      }

      setDialogMessage("Team member deleted successfully.");
      setShowDialog(true);

      setUserContext((prevContext) => ({
        ...prevContext,
        teammembers: prevContext.teammembers.filter(
          (member) => member.teamMember_id !== teamMember_id
        ),
      }));
    } catch (error) {
      console.error("Error deleting team member:", error);
      setDialogMessage("Error deleting team member.");
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
          <Dialog.Title style={styles.dialogTitle}>Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text>{"Are you sure?"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowDialog(false);
                setSelectedTeamMember(null);
              }}
              labelStyle={styles.dialogButtonNo}>
              NO
            </Button>
            <Button
              onPress={async () => {
                if (selectedTeamMember) {
                  await handleDelete(selectedTeamMember.teamMember_id);
                }
                setShowDialog(false);
                setSelectedTeamMember(null);
              }}
              labelStyle={styles.dialogButton}>
              YES
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
                (userContext?.teammembers?.length ?? 0) >= 10
                  ? { backgroundColor: "#D3D3D3" }
                  : {},
              ]}
              onPress={() => {
                if (userContext.teammembers.length < 10) {
                  navigation.navigate("AddTeammemberScreen");
                } else {
                  setDialogMessage(
                    "You cannot have more than 10 team members."
                  );
                  setShowDialog(true);
                }
              }}
              disabled={(userContext?.teammembers?.length ?? 0) >= 10}>
              <Text style={styles.addPersonButtonText}>+ Add a person</Text>
            </TouchableOpacity>
          </View>

          {(userContext?.teammembers ?? []).map((teammember, index) => (
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
                  {/* <Text style={styles.contactEmail}>{teammember.email}</Text> */}
                </View>
                <View style={styles.iconsColumn}>
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
                      if (!teammember.teamMember_id) {
                        console.error("Error: Team member ID is undefined.");
                        return;
                      }
                      setSelectedTeamMember(teammember);
                      setShowDialog(true);
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonRow}>
            {/* <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("ReminderScreen")}>
              <Text style={styles.backButtonText} title="Back">
                ◀ Back
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                !Array.isArray(contactData.teamMembers) ||
                contactData.teamMembers.length < 3
                  ? { backgroundColor: "#D3D3D3" }
                  : {},
              ]}
              onPress={() => {
                const members = contactData.teamMembers;
                if (!Array.isArray(members) || members.length < 3) {
                  setDialogMessage(
                    "You must have at least 3 team members to proceed with habit formation."
                  );
                  setShowDialog(true);
                  return;
                }
                navigation.navigate("ReviewScreen");
              }}
              disabled={
                !Array.isArray(contactData.teamMembers) ||
                contactData.teamMembers.length < 3
              }>
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
    borderWidth: 1,
    backgroundColor: "#FFD700",
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
  },
});
