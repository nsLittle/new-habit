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
import { sharedStyles } from "../styles/sharedStyles";

export default function TeamInviteScreen() {
  const navigation = useNavigation();
  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { userNameContext, token } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        if (!token || !userNameContext) return;
        const response = await fetch(
          `${BASE_URL}/teammember/${userNameContext}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const members = Array.isArray(data.teamMembers) ? data.teamMembers : [];
        setTeamMembers(members);
        setUserContext((prev) => ({ ...prev, teammembers: members }));
      } catch (err) {
        setDialogMessage("Error fetching team members.");
        setShowDialog(true);
      }
    };
    fetchTeamMembers();
  }, [token, userNameContext]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/teammember/${userNameContext}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error();
      setTeamMembers((prev) => prev.filter((m) => m._id !== id));
      setDialogMessage("Team member deleted.");
      setShowDialog(true);
    } catch {
      setDialogMessage("Failed to delete team member.");
      setShowDialog(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title>Notice</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {selectedTeamMember ? (
              <>
                <Button
                  onPress={() => {
                    handleDelete(selectedTeamMember);
                    setSelectedTeamMember(null);
                    setShowDialog(false);
                  }}>
                  YES
                </Button>
                <Button
                  onPress={() => {
                    setSelectedTeamMember(null);
                    setShowDialog(false);
                  }}>
                  NO
                </Button>
              </>
            ) : (
              <Button onPress={() => setShowDialog(false)}>OK</Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <Text style={sharedStyles.title}>Invite Team Members</Text>
        <TouchableOpacity
          style={[
            styles.buttonYellow,
            teamMembers.length >= 10 && styles.buttonDisabled,
          ]}
          disabled={teamMembers.length >= 10}
          onPress={() => navigation.navigate("AddTeammemberScreen")}>
          <Text style={styles.buttonText}>+ Add a Person</Text>
        </TouchableOpacity>
        {teamMembers.map((member, idx) => (
          <View key={idx} style={styles.memberBox}>
            <Image
              source={{ uri: member.teamMemberProfilePic }}
              style={styles.profileImage}
            />
            <View style={styles.memberInfo}>
              <Text style={styles.name}>
                {member.teamMemberFirstName} {member.teamMemberLastName}
              </Text>
              <Text style={styles.email}>{member.teamMemberEmail}</Text>
            </View>
            <View style={styles.iconGroup}>
              <MaterialIcons
                name="edit"
                size={22}
                onPress={() => navigation.push("EditTeammemberScreen", member)}
              />
              <MaterialIcons
                name="delete"
                size={22}
                onPress={() => {
                  setSelectedTeamMember(member._id);
                  setDialogMessage(
                    "Are you sure you want to delete this team member?"
                  );
                  setShowDialog(true);
                }}
              />
            </View>
          </View>
        ))}

        <Text style={styles.note}>
          You must have at least 3 team members to proceed
        </Text>

        <TouchableOpacity
          style={[
            sharedStyles.yellowButton,
            teamMembers.length < 3 && styles.buttonDisabled,
          ]}
          disabled={teamMembers.length < 3}
          onPress={() => navigation.navigate("ReviewScreen")}>
          <Text style={sharedStyles.buttonText}>Save ▶</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonYellow: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: 250,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#D3D3D3",
  },
  memberBox: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 15,
    padding: 10,
    marginVertical: 8,
    width: wp("65%"),
    marginBottom: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
    marginLeft: 100,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 30,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  email: {
    fontSize: 12,
    color: "gray",
  },
  iconGroup: {
    flexDirection: "row",
    gap: 20,
    marginRight: 50,
  },
  note: {
    marginBottom: 35,
  },
});
