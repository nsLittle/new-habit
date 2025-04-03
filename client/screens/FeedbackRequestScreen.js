import { useContext, useEffect, useState } from "react";
import {
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
import { useNavigation } from "@react-navigation/native";
import DefaultProfiler from "../component/DefaultProfiler";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestScreen() {
  const navigation = useNavigation();
  const { userContext } = useContext(UserContext) || {};
  const { userNameContext, token, firstNameContext, habitContextId } =
    userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembersData = async () => {
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

        console.log("Data: ", data);
        console.log("Team: ", members);

        setTeamMembers(members);
      } catch {
        setDialogMessage("Failed to load team members.");
        setShowDialog(true);
      }
    };
    fetchTeamMembersData();
  }, [token, userNameContext]);

  const activateFeedbackRequests = async () => {
    setIsLoading(true);
    try {
      const payload = {
        habitId: habitContextId,
        userId: userContext.userIdContext,
        teamMembers: teamMembers.map(
          ({
            teamMemberFirstName,
            teamMemberLastName,
            teamMemberEmail,
            _id,
          }) => ({
            firstName: teamMemberFirstName,
            lastName: teamMemberLastName,
            email: teamMemberEmail,
            teamMember_id: _id,
          })
        ),
      };

      const response = await fetch(
        `${BASE_URL}/email/${userNameContext}/${habitContextId}/trigger-email-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setDialogMessage("Feedback requests sent successfully.");
      setShowDialog(true);
      navigation.navigate("ReviewScreen");
    } catch (err) {
      setDialogMessage("Failed to send feedback requests.");
      setShowDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialogStyle}>
          <Dialog.Title>
            <Text style={styles.dialogTitle}>Notice</Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>
              <Text style={styles.dialogButton}>OK</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <Text style={styles.title}>Feedback Request</Text>

        {teamMembers.map((member, idx) => (
          <View key={idx} style={styles.memberBox}>
            <DefaultProfiler
              uri={member.teamMemberProfilePic}
              style={styles.profileImage}
            />
            <View style={styles.memberInfo}>
              <Text style={styles.name}>
                {member.teamMemberFirstName} {member.teamMemberLastName}
              </Text>
              <Text style={styles.email}>{member.teamMemberEmail}</Text>

              {/* <TouchableOpacity
                style={styles.buttonGray}
                onPress={() => {
                  navigation.navigate("FeedbackRequestWelcomeScreen", {
                    teammemberId: member._id,
                    token,
                  });
                }}>
                <Text style={styles.buttonText}>Test Feedback UI</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.buttonYellow}
          onPress={activateFeedbackRequests}
          disabled={isLoading}>
          <Text style={styles.buttonText}>Activate Feedback Requests</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dialogTitle: {
    color: "#B22222",
    fontWeight: "bold",
    fontSize: 18,
  },
  dialogButton: {
    color: "#228B22",
    fontWeight: "bold",
  },
  dialogStyle: {
    backgroundColor: "white",
    borderRadius: 12,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingHorizontal: wp("5%"),
  },
  body: {
    alignItems: "center",
    paddingTop: Platform.OS === "web" ? hp("15%") : hp("5%"),
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 100,
    marginBottom: 20,
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
    width: wp("85%"),
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
  },
  memberInfo: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  email: {
    fontSize: 12,
    color: "gray",
  },
  buttonYellow: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: 300,
    marginTop: 20,
    alignItems: "center",
  },
  buttonGray: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: 300,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12,
    color: "black",
  },
});
